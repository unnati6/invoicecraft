'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { termsSchema, type TermsFormData } from '@/lib/schemas';
import { fetchInvoiceById, saveInvoiceTerms } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Invoice } from '@/types';
import { Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function InvoiceTermsPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { toast } = useToast();

  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<TermsFormData>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      termsAndConditions: '',
    },
  });

  React.useEffect(() => {
    if (invoiceId) {
      async function loadInvoiceTerms() {
        setLoading(true);
        try {
          const data = await fetchInvoiceById(invoiceId);
          if (data) {
            setInvoice(data);
            form.reset({ termsAndConditions: data.termsAndConditions || '' });
          } else {
            toast({ title: "Error", description: "Invoice not found.", variant: "destructive" });
            router.push('/invoices');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch invoice details.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      loadInvoiceTerms();
    }
  }, [invoiceId, router, toast, form]);

  const handleSubmit = async (data: TermsFormData) => {
    setIsSubmitting(true);
    try {
      const updatedInvoice = await saveInvoiceTerms(invoiceId, data);
      if (updatedInvoice) {
        toast({ title: "Success", description: "Terms and conditions updated." });
        router.push(`/invoices/${invoiceId}`);
      } else {
        toast({ title: "Error", description: "Failed to update terms.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update terms:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <>
        <AppHeader title="Loading Terms..." showBackButton />
        <main className="flex-1 p-4 md:p-6">
           <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        </main>
      </>
    );
  }

  if (!invoice) {
     return (
        <>
         <AppHeader title="Error" showBackButton />
         <main className="flex-1 p-4 md:p-6 text-center">Invoice not found.</main>
        </>
    );
  }

  return (
    <>
      <AppHeader title={`Terms for Invoice ${invoice.invoiceNumber}`} showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Edit Terms & Conditions</CardTitle>
                <CardDescription>
                  Specify the terms and conditions for this invoice. This will be displayed on the invoice preview and PDF.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Payment due within 30 days. Late fees of 1.5% per month will be applied to overdue balances."
                          className="min-h-[200px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : 'Save Terms'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </main>
    </>
  );
}

