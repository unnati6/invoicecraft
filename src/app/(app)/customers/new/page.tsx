'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { CustomerForm } from '@/components/customer-form';
import type { CustomerFormData } from '@/lib/schemas';
import { saveCustomer } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function NewCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      const newCustomer = await saveCustomer(data);
      if (newCustomer) {
        toast({ title: "Success", description: "Customer created successfully." });
        router.push('/customers');
      } else {
        toast({ title: "Error", description: "Failed to create customer. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create customer:", error);
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
