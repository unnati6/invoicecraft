
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { OrderFormForm } from '@/components/orderform-form'; // Changed
import type { OrderFormFormData } from '@/lib/schemas'; // Changed
import { saveOrderForm } from '@/lib/actions'; // Changed
import { useToast } from '@/hooks/use-toast';

export default function NewOrderFormPage() { // Changed
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: OrderFormFormData) => { // Changed
    setIsSubmitting(true);
    try {
      const newOrderForm = await saveOrderForm(data); // Changed
      if (newOrderForm) {
        toast({ title: "Success", description: "Order Form created successfully." }); // Changed
        router.push(`/orderforms/${newOrderForm.id}`);  // Changed
      } else {
        toast({ title: "Error", description: "Failed to create order form. Please try again.", variant: "destructive" }); // Changed
      }
    } catch (error) {
      console.error("Failed to create order form:", error); // Changed
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Create New Order Form" showBackButton /> {/* Changed */}
      <main className="flex-1 p-4 md:p-6">
        <OrderFormForm onSubmit={handleSubmit} isSubmitting={isSubmitting} /> {/* Changed */}
      </main>
    </>
  );
}
