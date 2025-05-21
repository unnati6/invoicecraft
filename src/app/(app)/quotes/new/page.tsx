
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { QuoteForm } from '@/components/quote-form';
import type { QuoteFormData } from '@/lib/schemas';
import { saveQuote } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function NewQuotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    try {
      const newQuote = await saveQuote(data);
      if (newQuote) {
        toast({ title: "Success", description: "Quote created successfully." });
        router.push(`/quotes/${newQuote.id}`); 
      } else {
        toast({ title: "Error", description: "Failed to create quote. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create quote:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Create New Quote" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <QuoteForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
