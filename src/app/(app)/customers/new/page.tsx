
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { CustomerForm } from '@/components/customer-form';
import type { CustomerFormData } from '@/lib/schemas';
import { createNewCustomer } from '../../../../lib/customer-actions';
import { useToast } from '@/hooks/use-toast';

export default function NewCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      // Call the ultra-minimal, synchronous void action
      createNewCustomer(data); 
      toast({ title: "Action Called", description: "createNewCustomer (minimal) was called." });
      // Since it's a void function for diagnostics, we won't get a result to check.
      // We'll just assume success for this test and redirect.
      router.push('/customers'); 
    } catch (error) {
      console.error("Failed to call createNewCustomer:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Add New Customer" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <CustomerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
