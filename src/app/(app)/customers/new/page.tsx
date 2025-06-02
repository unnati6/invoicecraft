// src/app/customers/new/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { CustomerForm } from '@/components/customer-form';
import type { CustomerFormData } from '@/lib/schemas'; // <-- Keep this
import { saveCustomer } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
// import { useFormStatus } from 'react-dom'; // No longer directly needed here

export default function NewCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Updated formAction to directly receive CustomerFormData
  const formAction = async (data: CustomerFormData) => { // <-- Change 'formData: FormData' to 'data: CustomerFormData'
    console.log('FRONTEND DEBUG: formAction triggered from CustomerForm with data:', data);

    try {
      // Pass the already prepared customerData object to saveCustomer
      const result = await saveCustomer(data); // <-- Pass 'data' directly

      if (result && result.id) {
        toast({ title: "Success", description: "Customer created successfully." });
 router.push(`/customers`);
 //router.push(`/customers/${result.id}/edit`);
      } else {
        toast({ title: "Error", description: "Failed to create customer. No valid ID returned.", variant: "destructive" });
      }
    } catch (error) {
      console.error("FRONTEND ERROR: Error during form submission:", error);
      toast({ title: "Error", description: "An unexpected error occurred during submission.", variant: "destructive" });
    }
  };

  return (
    <>
      <AppHeader title="Add New Customer" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        {/* Pass the updated formAction to CustomerForm */}
        <CustomerForm formAction={formAction} />
      </main>
    </>
  );
}