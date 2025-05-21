
'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { OrderFormForm } from '@/components/orderform-form'; // Changed
import type { OrderFormFormData } from '@/lib/schemas'; // Changed
import { fetchOrderFormById, saveOrderForm, fetchCustomerById, convertOrderFormToInvoice } from '@/lib/actions'; // Changed
import { useToast } from '@/hooks/use-toast';
import type { OrderForm, Customer } from '@/types'; // Changed
import { Button } from '@/components/ui/button';
import { OrderFormPreviewDialog } from '@/components/orderform-preview-dialog'; // Changed
import { Eye, FileEdit, FileSignature } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function EditOrderFormPage() { // Changed
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const orderFormId = params.id as string; // Changed
  const { toast } = useToast();
  
  const [orderForm, setOrderForm] = React.useState<OrderForm | null>(null); // Changed
  const [customer, setCustomer] = React.useState<Customer | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);

  React.useEffect(() => {
    if (orderFormId) { // Changed
      async function loadOrderForm() { // Changed
        setLoading(true);
        try {
          const data = await fetchOrderFormById(orderFormId); // Changed
          if (data) {
            setOrderForm(data); // Changed
            if (data.customerId) {
              const customerData = await fetchCustomerById(data.customerId);
              setCustomer(customerData);
            }
          } else {
            toast({ title: "Error", description: "Order Form not found.", variant: "destructive" }); // Changed
            router.push('/orderforms'); // Changed
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch order form details.", variant: "destructive" }); // Changed
        } finally {
          setLoading(false);
        }
      }
      loadOrderForm(); // Changed
    }
  }, [orderFormId, router, toast, pathname]); // Changed

  const handleSubmit = async (data: OrderFormFormData) => { // Changed
    setIsSubmitting(true);
    try {
      const updatedOrderForm = await saveOrderForm(data, orderFormId); // Changed
      if (updatedOrderForm) {
        setOrderForm(updatedOrderForm);  // Changed
        if (updatedOrderForm.customerId && updatedOrderForm.customerId !== customer?.id) {
            const customerData = await fetchCustomerById(updatedOrderForm.customerId);
            setCustomer(customerData);
        }
        toast({ title: "Success", description: "Order Form updated successfully." }); // Changed
      } else {
        toast({ title: "Error", description: "Failed to update order form.", variant: "destructive" }); // Changed
      }
    } catch (error) {
      console.error("Failed to update order form:", error); // Changed
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!orderForm) return; // Changed
    setIsConverting(true);
    try {
      const newInvoice = await convertOrderFormToInvoice(orderForm.id); // Changed
      if (newInvoice) {
        toast({ title: "Success", description: `Invoice ${newInvoice.invoiceNumber} created from order form.` }); // Changed
        router.push(`/invoices/${newInvoice.id}`);
      } else {
        toast({ title: "Error", description: "Failed to convert order form to invoice.", variant: "destructive" }); // Changed
      }
    } catch (error) {
      console.error("Failed to convert order form:", error); // Changed
      toast({ title: "Error", description: "An unexpected error occurred during conversion.", variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Loading Order Form..." showBackButton> {/* Changed */}
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

  if (!orderForm) { // Changed
     return (
        <>
         <AppHeader title="Error" showBackButton />
         <main className="flex-1 p-4 md:p-6 text-center">Order Form not found.</main> {/* Changed */}
        </>
    );
  }

  return (
    <>
      <AppHeader title={`Order Form ${orderForm.orderFormNumber}`} showBackButton> {/* Changed */}
        <OrderFormPreviewDialog  // Changed
            orderForm={orderForm} // Changed
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
            disabled={isConverting || isSubmitting || orderForm.status === 'Accepted'} // Example: Disable if already accepted/converted // Changed
        >
            <FileSignature className="mr-2 h-4 w-4" /> 
            {isConverting ? 'Converting...' : 'Convert to Invoice'}
        </Button>
        <Button variant="outline" asChild disabled={isConverting || isSubmitting}>
            <Link href={`/orderforms/${orderForm.id}/terms`}> {/* Changed */}
                 <FileEdit className="mr-2 h-4 w-4" /> T&C
            </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        <OrderFormForm onSubmit={handleSubmit} initialData={orderForm} isSubmitting={isSubmitting || isConverting} /> {/* Changed */}
      </main>
    </>
  );
}

function FormSkeleton() { // This skeleton is generic enough, no change needed
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
