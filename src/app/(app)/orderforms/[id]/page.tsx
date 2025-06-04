// EditOrderFormPage.tsx
'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { OrderFormForm } from '@/components/orderform-form';
import type { OrderFormFormData } from '@/lib/schemas';
import { fetchOrderFormById, saveOrderForm, fetchCustomerById, convertOrderFormToInvoice } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { OrderForm, Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { OrderFormPreviewDialog } from '@/components/orderform-preview-dialog';
import { Eye, FileEdit, FileSignature } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

// NEW: Import BrandingSettings and getBrandingSettings action
import { BrandingSettingsFormData as BrandingSettings } from '@/lib/schemas';
import { getBrandingSettings } from '@/lib/actions'; // Adjust path if necessary

export default function EditOrderFormPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const orderFormId = params.id as string;
  const { toast } = useToast();

  const [orderForm, setOrderForm] = React.useState<OrderForm | null>(null);
  const [customer, setCustomer] = React.useState<Customer | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);

  // NEW: State for company branding
  const [companyBranding, setCompanyBranding] = React.useState<BrandingSettings | null>(null);
  const [loadingCompanyBranding, setLoadingCompanyBranding] = React.useState(true);
  const [companyBrandingError, setCompanyBrandingError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (orderFormId) {
      async function loadOrderFormAndBranding() {
        setLoading(true); // Start loading for both order form and branding
        setLoadingCompanyBranding(true); // Specifically for branding

        let fetchedOrderForm: OrderForm | null = null;
        let fetchedCustomer: Customer | undefined = undefined;
        let fetchedCompanyBranding: BrandingSettings | null = null;

        try {
          // Fetch Order Form Data
          const orderFormData = await fetchOrderFormById(orderFormId);
          console.log("Fetched Order Form Data:", orderFormData);

          if (orderFormData) {
            fetchedOrderForm = orderFormData;
            if (orderFormData.customerId) {
              fetchedCustomer = await fetchCustomerById(orderFormData.customerId);
            }
          } else {
            toast({ title: "Error", description: "Order Form not found.", variant: "destructive" });
            router.push('/orderforms');
            return; // Exit if order form is not found
          }

          // Fetch Company Branding Data
          try {
            fetchedCompanyBranding = await getBrandingSettings();
            console.log("Fetched Branding Data:", fetchedCompanyBranding);
          } catch (brandingErr) {
            console.error("Error fetching company branding:", brandingErr);
            setCompanyBrandingError("Failed to load company branding information.");
            toast({ title: "Error", description: "Failed to load company branding.", variant: "destructive" });
          }

        } catch (error) {
          console.error("Failed to fetch order form details:", error);
          toast({ title: "Error", description: "Failed to fetch order form details.", variant: "destructive" });
        } finally {
          setOrderForm(fetchedOrderForm);
          setCustomer(fetchedCustomer);
          setCompanyBranding(fetchedCompanyBranding);
          setLoading(false);
          setLoadingCompanyBranding(false);
        }
      }
      loadOrderFormAndBranding();
    }
  }, [orderFormId, router, toast, pathname]);

  const handleSubmit = async (data: OrderFormFormData) => {
    setIsSubmitting(true);
    try {
      const updatedOrderForm = await saveOrderForm(data, orderFormId);
      if (updatedOrderForm) {
        setOrderForm(updatedOrderForm);
        if (updatedOrderForm.customerId && updatedOrderForm.customerId !== customer?.id) {
            const customerData = await fetchCustomerById(updatedOrderForm.customerId);
            setCustomer(customerData);
        }
        toast({ title: "Success", description: "Order Form updated successfully." });
        router.push('/orderforms');
      } else {
        toast({ title: "Error", description: "Failed to update order form.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update order form:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!orderForm) return;
    setIsConverting(true);
    try {
      const newInvoice = await convertOrderFormToInvoice(orderForm.id);
      if (newInvoice) {
        toast({ title: "Success", description: `Invoice ${newInvoice.invoiceNumber} created from order form.` });
        router.push(`/invoices/${newInvoice.id}`);
      } else {
        toast({ title: "Error", description: "Failed to convert order form to invoice.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to convert order form:", error);
      toast({ title: "Error", description: "An unexpected error occurred during conversion.", variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  };

  // Combine loading states
  const overallLoading = loading || loadingCompanyBranding;

  if (overallLoading) {
    return (
      <>
        <AppHeader title="Loading Order Form..." showBackButton>
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

  // Handle specific errors for order form not found or branding not loaded
  if (!orderForm) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">Order Form not found or failed to load.</main>
      </>
    );
  }

  if (companyBrandingError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6">
        <h1 className="text-2xl font-bold text-destructive">Error Loading Page</h1>
        <p className="text-muted-foreground mt-2">{companyBrandingError}</p>
        <p className="text-muted-foreground">Please check your backend connection or refresh the page.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Reload Page</Button>
      </div>
    );
  }

  // Final fallback if companyBranding is null after loading (shouldn't happen with error handling)
  if (!companyBranding) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6">
        <h1 className="text-2xl font-bold">Configuration Missing</h1>
        <p className="text-muted-foreground mt-2">Company branding information could not be loaded. This is required for previewing documents.</p>
        <p className="text-muted-foreground">Please ensure your branding settings are configured in the system.</p>
      </div>
    );
  }

  return (
    <>
      <AppHeader title={`Order Form ${orderForm.orderFormNumber}`} showBackButton>
        {/* Pass companyBranding to OrderFormPreviewDialog */}
        <OrderFormPreviewDialog
          orderFormId={orderForm.id} // Pass the ID, not the whole object
       
          companyBranding={companyBranding} // <-- NEW: Pass companyBranding here
          trigger={
            <Button variant="outline" disabled={isConverting || isSubmitting}>
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
          }
        />
        <Button variant="outline" asChild disabled={isConverting || isSubmitting}>
            <Link href={`/orderforms/${orderForm.id}/terms`}>
                <FileEdit className="mr-2 h-4 w-4" /> T&C
            </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        <OrderFormForm onSubmit={handleSubmit} initialData={orderForm} isSubmitting={isSubmitting || isConverting} />
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