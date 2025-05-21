
'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation'; // Added usePathname
import { AppHeader } from '@/components/layout/app-header';
import { InvoiceForm } from '@/components/invoice-form';
import type { InvoiceFormData } from '@/lib/schemas';
import { fetchInvoiceById, saveInvoice, fetchCustomerById } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Invoice, Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { InvoicePreviewDialog } from '@/components/invoice-preview-dialog';
import { Eye, FileEdit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname(); // Added
  const invoiceId = params.id as string;
  const { toast } = useToast();
  
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [customer, setCustomer] = React.useState<Customer | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (invoiceId) {
      async function loadInvoice() {
        setLoading(true);
        try {
          const data = await fetchInvoiceById(invoiceId);
          if (data) {
            setInvoice(data);
            if (data.customerId) {
              const customerData = await fetchCustomerById(data.customerId);
              setCustomer(customerData);
            }
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
      loadInvoice();
    }
  }, [invoiceId, router, toast, pathname]); // Added pathname

  const handleSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      const updatedInvoice = await saveInvoice(data, invoiceId);
      if (updatedInvoice) {
        setInvoice(updatedInvoice); // Update local state with returned data
        if (updatedInvoice.customerId && updatedInvoice.customerId !== customer?.id) {
            const customerData = await fetchCustomerById(updatedInvoice.customerId);
            setCustomer(customerData);
        }
        toast({ title: "Success", description: "Invoice updated successfully." });
        // Optionally, router.push('/invoices') or stay on page
      } else {
        toast({ title: "Error", description: "Failed to update invoice.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Loading Invoice..." showBackButton>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </AppHeader>
        <main className="flex-1 p-4 md:p-6">
          <FormSkeleton />
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
      <AppHeader title={`Invoice ${invoice.invoiceNumber}`} showBackButton>
        <InvoicePreviewDialog 
            invoice={invoice} 
            customer={customer}
            trigger={
                <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
            }
        />
        <Button variant="outline" asChild>
            <Link href={`/invoices/${invoice.id}/terms`}>
                 <FileEdit className="mr-2 h-4 w-4" /> T&C
            </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        <InvoiceForm onSubmit={handleSubmit} initialData={invoice} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Invoice Details Card Skeleton */}
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
        {/* Items Card Skeleton */}
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
      {/* Summary Card Skeleton */}
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
