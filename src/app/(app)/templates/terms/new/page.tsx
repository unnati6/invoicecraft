
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { TermsTemplateForm } from '@/components/terms-template-form';
import type { TermsTemplateFormData } from '@/lib/schemas';
import { saveTermsTemplate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function NewTermsTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: TermsTemplateFormData) => {
    setIsSubmitting(true);
    try {
      const newTemplate = await saveTermsTemplate(data);
      if (newTemplate) {
        toast({ title: "Success", description: "T&C Template created successfully." });
        router.push('/templates/terms');
      } else {
        toast({ title: "Error", description: "Failed to create template. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create template:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Create New T&C Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <TermsTemplateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
