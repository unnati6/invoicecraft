
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { RepositoryItemForm } from '@/components/repository-item-form';
import type { RepositoryItemFormData } from '@/lib/schemas';
import { saveRepositoryItem } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function NewRepositoryItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: RepositoryItemFormData) => {
    setIsSubmitting(true);
    try {
      const newItem = await saveRepositoryItem(data); // No ID passed, so it's a create operation
      if (newItem) {
        toast({ title: "Success", description: "Repository Item created successfully." });
        router.push('/item-repository');
      } else {
        toast({ title: "Error", description: "Failed to create repository item. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create repository item:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Create New Repository Item" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <RepositoryItemForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
