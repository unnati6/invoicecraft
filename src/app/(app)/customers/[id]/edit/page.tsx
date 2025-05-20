'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { CustomerForm } from '@/components/customer-form';
import type { CustomerFormData } from '@/lib/schemas';
import { fetchCustomerById, saveCustomer } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Customer } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { toast } = useToast();
  
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (customerId) {
      async function loadCustomer() {
        setLoading(true);
        try {
          const data = await fetchCustomerById(customerId);
          if (data) {
            setCustomer(data);
          } else {
            toast({ title: "Error", description: "Customer not found.", variant: "destructive" });
            router.push('/customers');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch customer details.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      loadCustomer();
    }
  }, [customerId, router, toast]);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      const updatedCustomer = await saveCustomer(data, customerId);
      if (updatedCustomer) {
        toast({ title: "Success", description: "Customer updated successfully." });
        router.push('/customers');
      } else {
        toast({ title: "Error", description: "Failed to update customer.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Edit Customer" showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <CardSkeleton />
        </main>
      </>
    );
  }

  if (!customer) {
    // This case should ideally be handled by the redirect in useEffect if customer not found
    return (
        <>
         <AppHeader title="Error" showBackButton />
         <main className="flex-1 p-4 md:p-6 text-center">Customer not found.</main>
        </>
    );
  }

  return (
    <>
      <AppHeader title="Edit Customer" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <CustomerForm onSubmit={handleSubmit} initialData={customer} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-1/3 mt-4" />
    </div>
  );
}
