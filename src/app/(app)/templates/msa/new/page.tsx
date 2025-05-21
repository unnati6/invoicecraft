
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { MsaTemplateForm } from '@/components/msa-template-form';
import type { MsaTemplateFormData } from '@/lib/schemas';
import { saveMsaTemplate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function NewMsaTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: MsaTemplateFormData) => {
    setIsSubmitting(true);
    try {
      const newTemplate = await saveMsaTemplate(data);
      if (newTemplate) {
        toast({ title: "Success", description: "MSA Template created successfully." });
        router.push('/templates/msa');
      } else {
        toast({ title: "Error", description: "Failed to create MSA template. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create MSA template:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Create New MSA Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <MsaTemplateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
