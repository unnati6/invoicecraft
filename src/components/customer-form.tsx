// src/components/customer-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { customerSchema, type CustomerFormData } from '@/lib/schemas';
import type { Customer } from '@/types';
import { Save, Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormStatus } from 'react-dom'; // Import useFormStatus if you want loading state

interface CustomerFormProps {
  initialData?: Customer | null;
  // Change the type of formAction to accept CustomerFormData
  formAction: (data: CustomerFormData) => Promise<void>;
}


const currencies = [
  { value: 'USD', label: 'USD - United States Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'GBP', label: 'GBP - British Pound Sterling' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan Renminbi' },
  { value: 'SEK', label: 'SEK - Swedish Krona' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
  { value: 'NOK', label: 'NOK - Norwegian Krone' },
  { value: 'KRW', label: 'KRW - South Korean Won' },
  { value: 'TRY', label: 'TRY - Turkish Lira' },
  { value: 'RUB', label: 'RUB - Russian Ruble' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'ZAR', label: 'ZAR - South African Rand' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'ARS', label: 'ARS - Argentine Peso' },
  { value: 'CLP', label: 'CLP - Chilean Peso' },
  { value: 'COP', label: 'COP - Colombian Peso' },
  { value: 'CZK', label: 'CZK - Czech Koruna' },
  { value: 'DKK', label: 'DKK - Danish Krone' },
  { value: 'HUF', label: 'HUF - Hungarian Forint' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'ILS', label: 'ILS - Israeli New Shekel' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'PHP', label: 'PHP - Philippine Peso' },
  { value: 'PLN', label: 'PLN - Polish Złoty' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
  { value: 'THB', label: 'THB - Thai Baht' },
  { value: 'TWD', label: 'TWD - New Taiwan Dollar' },
];



export function CustomerForm({ initialData, formAction }: CustomerFormProps) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstname: initialData?.firstname || '',
      lastname: initialData?.lastname || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      currency: initialData?.currency || 'USD',
      company:{
        name: initialData?.company?.name || '',
        email: initialData?.company?.email || '',
        street: initialData?.company?.street || '',
        city: initialData?.company?.city || '',
        state: initialData?.company?.state || '',
        zip: initialData?.company?.name || '',
        country: initialData?.company?.country || '',
      },
      billingAddress: {
        street: initialData?.billingAddress?.street || '',
        city: initialData?.billingAddress?.city || '',
        state: initialData?.billingAddress?.state || '',
        zip: initialData?.billingAddress?.zip || '',
        country: initialData?.billingAddress?.country || '',
      },
      shippingAddress: {
        street: initialData?.shippingAddress?.street || '',
        city: initialData?.shippingAddress?.city || '',
        state: initialData?.shippingAddress?.state || '',
        zip: initialData?.shippingAddress?.zip || '',
        country: initialData?.shippingAddress?.country || '',
      },
    },
  });

  const handleCopyBillingAddress = () => {
    const billing = form.getValues('billingAddress');
    if (billing) {
      form.setValue('shippingAddress.street', billing.street || '', { shouldDirty: true, shouldValidate: true });
      form.setValue('shippingAddress.city', billing.city || '', { shouldDirty: true, shouldValidate: true });
      form.setValue('shippingAddress.state', billing.state || '', { shouldDirty: true, shouldValidate: true });
      form.setValue('shippingAddress.zip', billing.zip || '', { shouldDirty: true, shouldValidate: true });
      form.setValue('shippingAddress.country', billing.country || '', { shouldDirty: true, shouldValidate: true });
    }
  };

  // Component to render the submit button with loading state
  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} aria-disabled={pending}>
        {pending ? (
          <>
            <Save className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> {initialData ? 'Update Customer' : 'Create Customer'}
          </>
        )}
      </Button>
    );
  }

  return (
    <Form {...form}>
      {/* Use the form's onSubmit to validate, then trigger the formAction with the validated data */}
      <form onSubmit={form.handleSubmit(async (data) => {
        // Add a debug log here
        console.log("DEBUG: CustomerForm onSubmit triggered after validation. Data:", data);
        await formAction(data);
      })}> {/* <-- Direct call with validated 'data' */}
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John " {...field}  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g.  Doe" {...field}  />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. john.doe@example.com" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. (123) 456-7890" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'USD'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-base font-semibold text-foreground pt-4">Company Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<FormField
                control={form.control}
                name="company.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="brandworks worldwide" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. Brandwork@example.com" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="company.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Main St" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Anytown" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="company.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CA" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip/Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 90210" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. USA" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            <p className="text-base font-semibold text-foreground pt-4">Billing Address</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="billingAddress.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Main St" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingAddress.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Anytown" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="billingAddress.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CA" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingAddress.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip/Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 90210" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingAddress.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. USA" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-base font-semibold text-foreground">Shipping Address</p>
              <Button type="button" variant="outline" onClick={handleCopyBillingAddress} size="sm">
                <Copy className="mr-2 h-4 w-4" /> Copy Billing Address
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="shippingAddress.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Main St" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Anytown" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="shippingAddress.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CA" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip/Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 90210" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. USA" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}