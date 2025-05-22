
'use client';

import * as React from 'react';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card';
import { repositoryItemSchema, type RepositoryItemFormData } from '@/lib/schemas';
import type { RepositoryItem } from '@/types';
import { Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrencySymbol } from '@/lib/currency-utils';

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

interface RepositoryItemFormProps {
  onSubmit: (data: RepositoryItemFormData) => Promise<void>;
  initialData?: RepositoryItem | null;
  isSubmitting?: boolean;
}

export function RepositoryItemForm({ onSubmit, initialData, isSubmitting = false }: RepositoryItemFormProps) {
  const form = useForm<RepositoryItemFormData>({
    resolver: zodResolver(repositoryItemSchema),
    defaultValues: {
      name: initialData?.name || '',
      defaultRate: initialData?.defaultRate ?? 0,
      defaultProcurementPrice: initialData?.defaultProcurementPrice ?? undefined,
      defaultVendorName: initialData?.defaultVendorName || '',
      currencyCode: initialData?.currencyCode || 'USD',
      // customerId and customerName are not directly edited here
      customerId: initialData?.customerId,
      customerName: initialData?.customerName,
    },
  });

  const watchCurrencyCode = form.watch('currencyCode');
  const currentCurrencySymbol = getCurrencySymbol(watchCurrencyCode);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Repository Item' : 'Create New Repository Item'}</CardTitle>
            <CardDesc>
              Manage the default details for this item/service.
            </CardDesc>
          </CardHeader>
          <CardContent className="space-y-6">
            {initialData?.customerName && (
              <div className="bg-muted/50 p-3 rounded-md border">
                <p className="text-sm font-medium text-foreground">Customer-Specific Item</p>
                <p className="text-xs text-muted-foreground">This item's defaults are specific to: {initialData.customerName}.</p>
              </div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name / Description *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Standard Web Development Hour" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="defaultRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Selling Rate ({currentCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="defaultProcurementPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Procurement Price ({currentCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00 (Optional)"
                        {...field}
                        value={field.value ?? ''} // Handle undefined for optional number
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value) || 0)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultVendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Vendor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional vendor name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             {/* Hidden fields for IDs if needed for submission, but not typically part of RepositoryItemFormData directly */}
            {initialData?.id && <input type="hidden" {...form.register("id")} value={initialData.id} />}
            {initialData?.customerId && <input type="hidden" {...form.register("customerId")} value={initialData.customerId} />}
            {initialData?.customerName && <input type="hidden" {...form.register("customerName")} value={initialData.customerName} />}

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Item')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

RepositoryItemForm.displayName = "RepositoryItemForm";
