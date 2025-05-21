
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { invoiceSchema, type InvoiceFormData, type AdditionalChargeFormData } from '@/lib/schemas';
import type { Invoice, Customer, TermsTemplate, MsaTemplate } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Save, Trash2, ExternalLink, FileCheck2 } from 'lucide-react';
import { getAllCustomers, fetchNextInvoiceNumber, getAllTermsTemplates, saveInvoiceTerms, getAllMsaTemplates } from '@/lib/actions';
import Link from 'next/link';
import { getCurrencySymbol } from '@/lib/currency-utils';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  initialData?: Invoice | null;
  isSubmitting?: boolean;
}

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

const paymentTermOptions = [
  { value: "Due on Receipt", label: "Due on Receipt" },
  { value: "Net 15 Days", label: "Net 15 Days" },
  { value: "Net 30 Days", label: "Net 30 Days" },
  { value: "Net 60 Days", label: "Net 60 Days" },
  { value: "Custom", label: "Custom" },
];

const commitmentPeriodOptions = [
  { value: "N/A", label: "N/A" },
  { value: "1 Month", label: "1 Month" },
  { value: "3 Months", label: "3 Months" },
  { value: "6 Months", label: "6 Months" },
  { value: "12 Months", label: "12 Months" },
  { value: "24 Months", label: "24 Months" },
  { value: "Custom", label: "Custom" },
];

const NO_MSA_TEMPLATE_SELECTED = "none";

export function InvoiceForm({ onSubmit, initialData, isSubmitting = false }: InvoiceFormProps) {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = React.useState(true);
  const [isLoadingInvNumber, setIsLoadingInvNumber] = React.useState(!initialData);
  const [currentCurrencySymbol, setCurrentCurrencySymbol] = React.useState('$');
  const [termsTemplates, setTermsTemplates] = React.useState<TermsTemplate[]>([]);
  const [msaTemplates, setMsaTemplates] = React.useState<MsaTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(true);
  const { toast } = useToast();
  const [isAutoSavingTerms, setIsAutoSavingTerms] = React.useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          issueDate: new Date(initialData.issueDate),
          dueDate: new Date(initialData.dueDate),
          items: initialData.items.map(item => ({ 
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
          })),
          additionalCharges: initialData.additionalCharges?.map(ac => ({
            id: ac.id,
            description: ac.description,
            valueType: ac.valueType,
            value: ac.value,
          })) || [],
          linkedMsaTemplateId: initialData.linkedMsaTemplateId || NO_MSA_TEMPLATE_SELECTED,
          msaContent: initialData.msaContent || '',
          msaCoverPageTemplateId: initialData.msaCoverPageTemplateId || '',
          termsAndConditions: initialData.termsAndConditions || '<p></p>',
          paymentTerms: initialData.paymentTerms || "Net 30 Days",
          commitmentPeriod: initialData.commitmentPeriod || "N/A",
          serviceStartDate: initialData.serviceStartDate ? new Date(initialData.serviceStartDate) : null,
          serviceEndDate: initialData.serviceEndDate ? new Date(initialData.serviceEndDate) : null,
        }
      : {
          invoiceNumber: '',
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), 
          items: [{ description: '', quantity: 1, rate: 0 }],
          additionalCharges: [],
          taxRate: 0,
          linkedMsaTemplateId: NO_MSA_TEMPLATE_SELECTED,
          msaContent: '',
          msaCoverPageTemplateId: '',
          termsAndConditions: '<p></p>', 
          status: 'Draft',
          customerId: '',
          paymentTerms: "Net 30 Days",
          commitmentPeriod: "N/A",
          serviceStartDate: null,
          serviceEndDate: null,
        },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control: form.control,
    name: 'additionalCharges',
  });

  React.useEffect(() => {
    async function loadInitialData() {
      setIsLoadingCustomers(true);
      setIsLoadingTemplates(true);
      try {
        const [fetchedCustomers, fetchedTermsTemplates, fetchedMsaTemplates] = await Promise.all([
          getAllCustomers(),
          getAllTermsTemplates(),
          getAllMsaTemplates()
        ]);
        setCustomers(fetchedCustomers);
        setTermsTemplates(fetchedTermsTemplates);
        setMsaTemplates(fetchedMsaTemplates);
      } catch (error) {
        console.error("Failed to fetch initial data for form", error);
        toast({ title: "Error", description: "Failed to load supporting data.", variant: "destructive" });
      } finally {
        setIsLoadingCustomers(false);
        setIsLoadingTemplates(false);
      }
    }
    loadInitialData();
  }, [toast]);
  
  React.useEffect(() => {
    async function loadNextInvoiceNumber() {
      if (!initialData) { 
        setIsLoadingInvNumber(true);
        try {
          const nextInvNum = await fetchNextInvoiceNumber();
          form.setValue('invoiceNumber', nextInvNum);
        } catch (error) {
          console.error("Failed to fetch next invoice number", error);
          form.setValue('invoiceNumber', 'INV-ERROR');
        } finally {
          setIsLoadingInvNumber(false);
        }
      }
    }
    loadNextInvoiceNumber();
  }, [initialData, form]);

  const watchedCustomerId = form.watch('customerId');

  React.useEffect(() => {
    let custCurrencyCode: string | undefined = 'USD'; 
    const determineCurrency = () => {
      const currentFormCustomerId = form.getValues('customerId');
      if (currentFormCustomerId && customers.length > 0) {
        const customer = customers.find(c => c.id === currentFormCustomerId);
        if (customer?.currency) custCurrencyCode = customer.currency;
      } else if (initialData?.customerId && customers.length > 0) {
        const customer = customers.find(c => c.id === initialData.customerId);
        if (customer?.currency) custCurrencyCode = customer.currency;
      }
      setCurrentCurrencySymbol(getCurrencySymbol(custCurrencyCode));
    };
    if (!isLoadingCustomers) determineCurrency();
  }, [watchedCustomerId, customers, initialData?.customerId, form, isLoadingCustomers]);

  const watchedItems = form.watch('items');
  const watchedAdditionalCharges = form.watch('additionalCharges');
  const watchedTaxRate = form.watch('taxRate');

  const mainItemsSubtotal = React.useMemo(() => {
    return watchedItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  }, [watchedItems]);

  const totalCalculatedAdditionalCharges = React.useMemo(() => {
    return watchedAdditionalCharges?.reduce((sum, charge) => {
      const value = Number(charge.value) || 0;
      if (charge.valueType === 'fixed') return sum + value;
      if (charge.valueType === 'percentage') return sum + (mainItemsSubtotal * (value / 100));
      return sum;
    }, 0) || 0;
  }, [watchedAdditionalCharges, mainItemsSubtotal]);

  const taxableAmount = React.useMemo(() => mainItemsSubtotal + totalCalculatedAdditionalCharges, [mainItemsSubtotal, totalCalculatedAdditionalCharges]);
  const taxAmount = React.useMemo(() => taxableAmount * ((Number(watchedTaxRate) || 0) / 100), [taxableAmount, watchedTaxRate]);
  const total = React.useMemo(() => taxableAmount + taxAmount, [taxableAmount, taxAmount]);

  const handleTermsTemplateSelect = (templateId: string) => {
    if (templateId === "none" || !templateId) {
      form.setValue('termsAndConditions', '<p></p>', { shouldDirty: true, shouldValidate: true }); 
      return;
    }
    const selectedTemplate = termsTemplates.find(t => t.id === templateId);
    if (selectedTemplate) form.setValue('termsAndConditions', selectedTemplate.content, { shouldDirty: true, shouldValidate: true });
  };

  const handleMsaTemplateSelect = (selectedMsaTemplateId: string) => {
    form.setValue('linkedMsaTemplateId', selectedMsaTemplateId, {shouldDirty: true});
    if (selectedMsaTemplateId === NO_MSA_TEMPLATE_SELECTED || !selectedMsaTemplateId) {
      form.setValue('msaContent', '', { shouldDirty: true });
      form.setValue('msaCoverPageTemplateId', '', { shouldDirty: true });
      return;
    }
    const selectedTemplate = msaTemplates.find(t => t.id === selectedMsaTemplateId);
    if (selectedTemplate) {
      form.setValue('msaContent', selectedTemplate.content, { shouldDirty: true });
      form.setValue('msaCoverPageTemplateId', selectedTemplate.coverPageTemplateId || '', { shouldDirty: true });
    }
  };

  const debouncedSaveTerms = React.useCallback(
    debounce(async (terms: string, docId: string) => {
      if (!docId || isSubmitting) return;
      setIsAutoSavingTerms(true);
      try {
        await saveInvoiceTerms(docId, { termsAndConditions: terms });
        toast({ title: "Terms Auto-Saved", description: "Your terms and conditions have been saved." });
      } catch (error) {
        console.error("Failed to auto-save terms:", error);
        toast({ title: "Auto-Save Failed", description: "Could not auto-save terms and conditions.", variant: "destructive" });
      } finally {
        setIsAutoSavingTerms(false);
      }
    }, 1500), [toast, isSubmitting] 
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{initialData ? 'Edit Invoice' : 'Create New Invoice'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer *</FormLabel>
                        <div className="flex items-center gap-2">
                        <Select 
                            onValueChange={field.onChange}
                            value={field.value} // Use value for controlled component
                            disabled={isLoadingCustomers}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingCustomers ? "Loading..." : "Select a customer"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/customers/new" target="_blank"><PlusCircle className="h-4 w-4"/></Link>
                        </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. INV-001" {...field} disabled={isLoadingInvNumber || !!initialData} />
                        </FormControl>
                         {isLoadingInvNumber && <p className="text-xs text-muted-foreground">Fetching next invoice number...</p>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Issue Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                       <FormItem className="flex flex-col">
                        <FormLabel>Due Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {['Draft', 'Sent', 'Paid', 'Overdue'].map(status => (<SelectItem key={status} value={status}>{status}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
            </Card>

             <Card>
              <CardHeader><CardTitle>Payment &amp; Service Details</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select payment terms" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {paymentTermOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="commitmentPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commitment Period</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select commitment period" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {commitmentPeriodOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="serviceStartDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Service Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date (Optional)</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serviceEndDate"
                    render={({ field }) => (
                       <FormItem className="flex flex-col">
                        <FormLabel>Service End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date (Optional)</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} disabled={(date) => form.getValues("serviceStartDate") ? date < form.getValues("serviceStartDate")! : false} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Invoice Items</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {itemFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start p-3 border rounded-md relative">
                    <FormField control={form.control} name={`items.${index}.description`} render={({ field: descField }) => (
                      <FormItem className="col-span-12 md:col-span-5">
                        {index === 0 && <FormLabel className="text-xs">Description *</FormLabel>}
                        <FormControl><Input placeholder="Item or service description" {...descField} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: qtyField }) => (
                      <FormItem className="col-span-4 md:col-span-2">
                        {index === 0 && <FormLabel className="text-xs">Quantity *</FormLabel>}
                        <FormControl><Input type="number" placeholder="1" {...qtyField} onChange={e => qtyField.onChange(parseFloat(e.target.value) || 0)}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.rate`} render={({ field: rateField }) => (
                      <FormItem className="col-span-4 md:col-span-2">
                        {index === 0 && <FormLabel className="text-xs">Rate ({currentCurrencySymbol}) *</FormLabel>}
                        <FormControl><Input type="number" placeholder="0.00" {...rateField} onChange={e => rateField.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                     <div className="col-span-4 md:col-span-2 flex items-end h-full">
                        {index === 0 && <FormLabel className="text-xs md:invisible md:block">Amount</FormLabel>}
                         <p className="py-2 text-sm font-medium min-w-[60px] text-right">
                           {currentCurrencySymbol}{((Number(watchedItems[index]?.quantity) || 0) * (Number(watchedItems[index]?.rate) || 0)).toFixed(2)}
                         </p>
                     </div>
                    <div className="col-span-12 md:col-span-1 flex items-end justify-end h-full pt-2 md:pt-0">
                      {itemFields.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>)}
                    </div>
                  </div>
                ))}
                 {form.formState.errors.items && typeof form.formState.errors.items === 'string' && (<p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>)}
                {Array.isArray(form.formState.errors.items) && form.formState.errors.items.length === 0 && form.formState.errors.items.message && (<p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>)}
                <Button type="button" variant="outline" onClick={() => appendItem({ description: '', quantity: 1, rate: 0 })} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Additional Charges</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {chargeFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start p-3 border rounded-md relative">
                    <FormField control={form.control} name={`additionalCharges.${index}.description`} render={({ field: descField }) => (
                      <FormItem className="col-span-12 md:col-span-5">
                        {index === 0 && <FormLabel className="text-xs">Description *</FormLabel>}
                        <FormControl><Input placeholder="e.g. Shipping, Handling Fee" {...descField} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name={`additionalCharges.${index}.valueType`} render={({ field: typeField }) => (
                      <FormItem className="col-span-6 md:col-span-3">
                        {index === 0 && <FormLabel className="text-xs">Type *</FormLabel>}
                        <Select onValueChange={typeField.onChange} value={typeField.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed ({currentCurrencySymbol})</SelectItem>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name={`additionalCharges.${index}.value`} render={({ field: valField }) => (
                      <FormItem className="col-span-6 md:col-span-3">
                        {index === 0 && <FormLabel className="text-xs">Value *</FormLabel>}
                        <FormControl><Input type="number" placeholder="0.00" {...valField} onChange={e => valField.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <div className="col-span-12 md:col-span-1 flex items-end justify-end h-full pt-2 md:pt-0">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCharge(index)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendCharge({ description: '', valueType: 'fixed', value: 0 })} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Charge
                </Button>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center"><FileCheck2 className="mr-2 h-5 w-5" /> Master Service Agreement (MSA)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingTemplates ? (<Skeleton className="h-10 w-full" />) : (
                        <FormField
                            control={form.control}
                            name="linkedMsaTemplateId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apply MSA Template</FormLabel>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value); // Update the linkedMsaTemplateId
                                            handleMsaTemplateSelect(value); // Update msaContent and msaCoverPageTemplateId
                                        }}
                                        value={field.value || NO_MSA_TEMPLATE_SELECTED}
                                    >
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select an MSA template (optional)" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value={NO_MSA_TEMPLATE_SELECTED}>None (No MSA)</SelectItem>
                                            {msaTemplates.map(template => (<SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="msaContent"
                        render={({ field }) => (
                            <FormItem className="hidden"> 
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="msaCoverPageTemplateId"
                        render={({ field }) => ( 
                            <FormItem className="hidden">
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Terms &amp; Conditions</CardTitle>
                      <div className="flex items-center gap-2">
                        {isAutoSavingTerms && <span className="text-xs text-muted-foreground">Saving terms...</span>}
                        {initialData && (<Button variant="outline" size="sm" asChild><Link href={`/invoices/${initialData.id}/terms`}>Edit in Full Page <ExternalLink className="ml-2 h-3 w-3"/></Link></Button>)}
                      </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingTemplates ? (<Skeleton className="h-10 w-full" />) : (
                        <FormItem>
                            <FormLabel>Apply Template</FormLabel>
                            <Select onValueChange={handleTermsTemplateSelect}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a T&C template (optional)" /></SelectTrigger></FormControl>
                                <SelectContent>
                                <SelectItem value="none">None (Custom)</SelectItem>
                                {termsTemplates.map(template => (<SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                    <FormField control={form.control} name="termsAndConditions" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Terms &amp; Conditions Content</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value || '<p></p>'}
                            onChange={(newTerms) => {
                              field.onChange(newTerms);
                              if (initialData?.id) debouncedSaveTerms(newTerms, initialData.id);
                            }}
                            disabled={isSubmitting || isAutoSavingTerms}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20 self-start">
            <Card>
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2 pt-2">
                  <div className="flex justify-between"><span>Subtotal (Items):</span><span>{currentCurrencySymbol}{mainItemsSubtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Additional Charges:</span><span>{currentCurrencySymbol}{totalCalculatedAdditionalCharges.toFixed(2)}</span></div>
                   <div className="flex justify-between font-medium border-t pt-1 mt-1"><span>Taxable Amount:</span><span>{currentCurrencySymbol}{taxableAmount.toFixed(2)}</span></div>
                </div>
                <FormField control={form.control} name="taxRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 10" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between"><span>Tax Amount:</span><span>{currentCurrencySymbol}{taxAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2 mt-2"><span>Total:</span><span>{currentCurrencySymbol}{total.toFixed(2)}</span></div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                 <Button type="submit" disabled={isSubmitting || isAutoSavingTerms} className="w-full">
                   <Save className="mr-2 h-4 w-4" />
                   {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Invoice')}
                 </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}

InvoiceForm.displayName = "InvoiceForm";
