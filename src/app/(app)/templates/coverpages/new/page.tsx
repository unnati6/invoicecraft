
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { CoverPageTemplateForm } from '@/components/coverpage-template-form';
import type { CoverPageTemplateFormData } from '@/lib/schemas';
import { saveCoverPageTemplate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function NewCoverPageTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: CoverPageTemplateFormData) => {
    setIsSubmitting(true);
    try {
      const newTemplate = await saveCoverPageTemplate(data);
      if (newTemplate) {
        toast({ title: "Success", description: "Cover Page Template created successfully." });
        router.push('/templates/coverpages');
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
      <AppHeader title="Create New Cover Page Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <CoverPageTemplateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
