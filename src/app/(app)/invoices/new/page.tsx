'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { InvoiceForm } from '@/components/invoice-form';
import type { InvoiceFormData } from '@/lib/schemas';
import { saveInvoice } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      const newInvoice = await saveInvoice(data);
      if (newInvoice) {
        toast({ title: "Success", description: "Invoice created successfully." });
        router.push(`/invoices`); // Navigate to the new invoice's detail page
      } else {
        toast({ title: "Error", description: "Failed to create invoice. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Create New Invoice" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <InvoiceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
