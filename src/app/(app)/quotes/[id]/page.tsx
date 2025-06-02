
'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation'; // Added usePathname
import { AppHeader } from '@/components/layout/app-header';
import { QuoteForm } from '@/components/quote-form';
//import type { QuoteFormData } from '@/lib/schemas';
import { fetchQuoteById, saveQuote, fetchCustomerById, convertQuoteToInvoice } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Quote, Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { QuotePreviewDialog } from '@/components/quote-preview-dialog';
import { Eye, FileEdit, FileSignature } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function EditQuotePage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname(); // Added
  const quoteId = params.id as string;
  const { toast } = useToast();
  
  const [quote, setQuote] = React.useState<Quote | null>(null);
  const [customer, setCustomer] = React.useState<Customer | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);

  React.useEffect(() => {
    if (quoteId) {
      async function loadQuote() {
        setLoading(true);
        try {
          const data = await fetchQuoteById(quoteId);
          if (data) {
            setQuote(data);
            if (data.customerId) {
              const customerData = await fetchCustomerById(data.customerId);
              setCustomer(customerData);
            }
          } else {
            toast({ title: "Error", description: "Quote not found.", variant: "destructive" });
            router.push('/quotes');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch quote details.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      loadQuote();
    }
  }, [quoteId, router, toast, pathname]); // Added pathname

  const handleSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    try {
      const updatedQuote = await saveQuote(data, quoteId);
      if (updatedQuote) {
        setQuote(updatedQuote); 
        if (updatedQuote.customerId && updatedQuote.customerId !== customer?.id) {
            const customerData = await fetchCustomerById(updatedQuote.customerId);
            setCustomer(customerData);
        }
        toast({ title: "Success", description: "Quote updated successfully." });
      } else {
        toast({ title: "Error", description: "Failed to update quote.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update quote:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!quote) return;
    setIsConverting(true);
    try {
      const newInvoice = await convertQuoteToInvoice(quote.id);
      if (newInvoice) {
        toast({ title: "Success", description: `Invoice ${newInvoice.invoiceNumber} created from quote.` });
        router.push(`/invoices/${newInvoice.id}`);
      } else {
        toast({ title: "Error", description: "Failed to convert quote to invoice.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to convert quote:", error);
      toast({ title: "Error", description: "An unexpected error occurred during conversion.", variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Loading Quote..." showBackButton>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </AppHeader>
        <main className="flex-1 p-4 md:p-6">
          <FormSkeleton />
        </main>
      </>
    );
  }

  if (!quote) {
     return (
        <>
         <AppHeader title="Error" showBackButton />
         <main className="flex-1 p-4 md:p-6 text-center">Quote not found.</main>
        </>
    );
  }

  return (
    <>
      <AppHeader title={`Quote ${quote.quoteNumber}`} showBackButton>
        <QuotePreviewDialog 
            quote={quote} 
            customer={customer}
            trigger={
                <Button variant="outline" disabled={isConverting || isSubmitting}>
                    <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
            }
        />
        <Button 
            variant="outline" 
            onClick={handleConvertToInvoice} 
            disabled={isConverting || isSubmitting || quote.status === 'Accepted'} // Example: Disable if already accepted/converted
        >
            <FileSignature className="mr-2 h-4 w-4" /> 
            {isConverting ? 'Converting...' : 'Convert to Invoice'}
        </Button>
        <Button variant="outline" asChild disabled={isConverting || isSubmitting}>
            <Link href={`/quotes/${quote.id}/terms`}>
                 <FileEdit className="mr-2 h-4 w-4" /> T&C
            </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        <QuoteForm onSubmit={handleSubmit} initialData={quote} isSubmitting={isSubmitting || isConverting} />
      </main>
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-8 w-1/4 mb-4" />
          {[1, 2].map(i => (
            <div key={i} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start p-3 border rounded-md">
              <Skeleton className="h-10 col-span-12 md:col-span-5" />
              <Skeleton className="h-10 col-span-4 md:col-span-2" />
              <Skeleton className="h-10 col-span-4 md:col-span-2" />
              <Skeleton className="h-10 col-span-4 md:col-span-2" />
              <Skeleton className="h-10 col-span-12 md:col-span-1" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 mt-2" />
        </div>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2 pt-2 border-t">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    </div>
  );
}
