
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
import { Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => Promise<void>;
  initialData?: Customer | null;
  isSubmitting?: boolean;
}

const currencies = [
  { value: 'USD', label: 'USD - United States Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound Sterling' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
];

export function CustomerForm({ onSubmit, initialData, isSubmitting = false }: CustomerFormProps) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      currency: initialData?.currency || 'USD',
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. (123) 456-7890" {...field} />
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
            
            <p className="text-base font-semibold text-foreground pt-4">Billing Address</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="billingAddress.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Main St" {...field} />
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
                      <Input placeholder="e.g. Anytown" {...field} />
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
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CA" {...field} />
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
                    <FormLabel>ZIP / Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 90210" {...field} />
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
                      <Input placeholder="e.g. USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-base font-semibold text-foreground pt-4">Shipping Address</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="shippingAddress.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 456 Oak Ave" {...field} />
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
                      <Input placeholder="e.g. Otherville" {...field} />
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
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. TX" {...field} />
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
                    <FormLabel>ZIP / Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 75001" {...field} />
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
                      <Input placeholder="e.g. USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Customer')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

CustomerForm.displayName = "CustomerForm";
