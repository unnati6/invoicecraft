
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
import { purchaseOrderFormSchema, type PurchaseOrderFormData, type PurchaseOrderItemFormData } from '@/lib/schemas';
import type { PurchaseOrder } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Save, Trash2 } from 'lucide-react';
import { getCurrencySymbol } from '@/lib/currency-utils';

interface PurchaseOrderFormProps {
  onSubmit: (data: PurchaseOrderFormData) => Promise<void>;
  initialData?: PurchaseOrder | null;
  isSubmitting?: boolean;
  poNumber?: string; // For displaying auto-generated PO number
  isViewMode?: boolean; // To render form as read-only
}

const currencies = [
  { value: 'USD', label: 'USD - United States Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'GBP', label: 'GBP - British Pound Sterling' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'INR', label: 'INR - Indian Rupee' },
];

export function PurchaseOrderForm({
  onSubmit,
  initialData,
  isSubmitting = false,
  poNumber,
  isViewMode = false,
}: PurchaseOrderFormProps) {
  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          issueDate: new Date(initialData.issueDate),
          items: initialData.items.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            procurementPrice: item.procurementPrice,
          })),
        }
      : {
          poNumber: poNumber || '',
          vendorName: '',
          issueDate: new Date(),
          items: [{ description: '', quantity: 1, procurementPrice: 0 }],
          status: 'Draft',
          currencyCode: 'USD',
          orderFormId: undefined,
          orderFormNumber: undefined,
        },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');
  const watchedCurrencyCode = form.watch('currencyCode');
  const currentCurrencySymbol = getCurrencySymbol(watchedCurrencyCode);

  const grandTotalVendorPayable = React.useMemo(() => {
    return watchedItems.reduce((sum, item) => {
      const itemTotal = (Number(item.quantity) || 0) * (Number(item.procurementPrice) || 0);
      return sum + itemTotal;
    }, 0);
  }, [watchedItems]);

  React.useEffect(() => {
    if (poNumber && !initialData) {
      form.setValue('poNumber', poNumber);
    }
  }, [poNumber, initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>
              {isViewMode 
                ? `View Purchase Order: ${initialData?.poNumber}` 
                : (initialData ? `Edit Purchase Order: ${initialData.poNumber}` : 'Create New Purchase Order')}
            </CardTitle>
            {initialData?.orderFormNumber && (
                 <CardDescription>
                    Linked to Order Form: {initialData.orderFormNumber}
                 </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. PO-001" {...field} disabled={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Supplier Corp" {...field} disabled={isViewMode || isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                            disabled={isViewMode || isSubmitting}
                          >
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
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        disabled={isViewMode || isSubmitting || !!initialData?.orderFormId /* Lock if from OF */ }
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!!initialData?.orderFormId && <FormMessage>Currency is inherited from the linked Order Form.</FormMessage>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isViewMode || isSubmitting}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {['Draft', 'Issued', 'Fulfilled', 'Cancelled'].map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-semibold pt-4 border-t">Items</h3>
            {itemFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start p-3 border rounded-md relative">
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field: descField }) => (
                    <FormItem className="col-span-12 md:col-span-5">
                      {index === 0 && <FormLabel className="text-xs">Description *</FormLabel>}
                      <FormControl><Input placeholder="Item description" {...descField} disabled={isViewMode || isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field: qtyField }) => (
                    <FormItem className="col-span-4 md:col-span-2">
                      {index === 0 && <FormLabel className="text-xs">Quantity *</FormLabel>}
                      <FormControl><Input type="number" placeholder="1" {...qtyField} onChange={e => qtyField.onChange(parseFloat(e.target.value) || 0)} disabled={isViewMode || isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.procurementPrice`}
                  render={({ field: priceField }) => (
                    <FormItem className="col-span-4 md:col-span-2">
                      {index === 0 && <FormLabel className="text-xs">Proc. Price ({currentCurrencySymbol}) *</FormLabel>}
                      <FormControl><Input type="number" placeholder="0.00" {...priceField} onChange={e => priceField.onChange(parseFloat(e.target.value) || 0)} disabled={isViewMode || isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-4 md:col-span-2 flex items-end h-full">
                  {index === 0 && <FormLabel className="text-xs md:invisible md:block">Total</FormLabel>}
                  <p className="py-2 text-sm font-medium min-w-[70px] text-right">
                    {currentCurrencySymbol}{((Number(watchedItems[index]?.quantity) || 0) * (Number(watchedItems[index]?.procurementPrice) || 0)).toFixed(2)}
                  </p>
                </div>
                {!isViewMode && (
                  <div className="col-span-12 md:col-span-1 flex items-end justify-end h-full pt-2 md:pt-0">
                    {itemFields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive" disabled={isSubmitting}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {!isViewMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => appendItem({ description: '', quantity: 1, procurementPrice: 0 })}
                className="mt-2"
                disabled={isSubmitting}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            )}
            {form.formState.errors.items && typeof form.formState.errors.items === 'string' && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>
            )}
            {Array.isArray(form.formState.errors.items) && form.formState.errors.items.length === 0 && form.formState.errors.items.message && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-end gap-2 border-t pt-4">
            <div className="text-lg font-semibold">
              Grand Total Payable: {currentCurrencySymbol}{grandTotalVendorPayable.toFixed(2)}
            </div>
            {!isViewMode && (
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Purchase Order')}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

PurchaseOrderForm.displayName = "PurchaseOrderForm";
