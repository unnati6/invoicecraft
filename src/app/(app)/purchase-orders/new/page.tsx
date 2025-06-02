
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { PurchaseOrderForm } from '@/components/purchase-order-form';
import type { PurchaseOrderFormData } from '@/lib/schemas';
import { savePurchaseOrder, fetchNextPoNumberData } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingPoNumber, setIsLoadingPoNumber] = React.useState(true);
  const [poNumber, setPoNumber] = React.useState('');

  React.useEffect(() => {
    async function loadNextPoNumber() {
      setIsLoadingPoNumber(true);
      try {
        const nextPoNum = await fetchNextPoNumberData();
        setPoNumber(nextPoNum);
      } catch (error) {
        console.error("Failed to fetch next PO number", error);
        toast({ title: "Error", description: "Could not fetch PO number.", variant: "destructive" });
        setPoNumber('PO-ERROR');
      } finally {
        setIsLoadingPoNumber(false);
      }
    }
    loadNextPoNumber();
  }, [toast]);

  const handleSubmit = async (data: PurchaseOrderFormData) => {
    setIsSubmitting(true);
    try {
      // PO number is already set in the form's default values or by the effect
      const newPurchaseOrder = await savePurchaseOrder(data); 
      if (newPurchaseOrder) {
        toast({ title: "Success", description: "Purchase Order created successfully." });
        router.push(`/purchase-orders`);
      } else {
        toast({ title: "Error", description: "Failed to create Purchase Order. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create Purchase Order:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPoNumber) {
    return (
      <>
        <AppHeader title="Create New Purchase Order" showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Skeleton className="h-96 w-full" />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Create New Purchase Order" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <PurchaseOrderForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          poNumber={poNumber} // Pass the fetched PO number
        />
      </main>
    </>
  );
}
