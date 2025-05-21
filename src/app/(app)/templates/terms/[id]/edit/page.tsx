
'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { TermsTemplateForm } from '@/components/terms-template-form';
import type { TermsTemplateFormData } from '@/lib/schemas';
import { fetchTermsTemplateById, saveTermsTemplate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { TermsTemplate } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function EditTermsTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const templateId = params.id as string;
  const { toast } = useToast();
  
  const [template, setTemplate] = React.useState<TermsTemplate | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (templateId) {
      async function loadTemplate() {
        setLoading(true);
        try {
          const data = await fetchTermsTemplateById(templateId);
          if (data) {
            setTemplate(data);
          } else {
            toast({ title: "Error", description: "T&C Template not found.", variant: "destructive" });
            router.push('/templates/terms');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch template details.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      loadTemplate();
    }
  }, [templateId, router, toast, pathname]);

  const handleSubmit = async (data: TermsTemplateFormData) => {
    setIsSubmitting(true);
    try {
      const updatedTemplate = await saveTermsTemplate(data, templateId);
      if (updatedTemplate) {
        toast({ title: "Success", description: "T&C Template updated successfully." });
        router.push('/templates/terms');
      } else {
        toast({ title: "Error", description: "Failed to update template.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update template:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Edit T&C Template" showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        </main>
      </>
    );
  }

  if (!template) {
    return (
        <>
         <AppHeader title="Error" showBackButton />
         <main className="flex-1 p-4 md:p-6 text-center">T&C Template not found.</main>
        </>
    );
  }

  return (
    <>
      <AppHeader title="Edit T&C Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <TermsTemplateForm onSubmit={handleSubmit} initialData={template} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
