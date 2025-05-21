
'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { CoverPageTemplateForm } from '@/components/coverpage-template-form';
import type { CoverPageTemplateFormData } from '@/lib/schemas';
import { fetchCoverPageTemplateById, saveCoverPageTemplate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { CoverPageTemplate } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function EditCoverPageTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const templateId = params.id as string;
  const { toast } = useToast();
  
  const [template, setTemplate] = React.useState<CoverPageTemplate | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (templateId) {
      async function loadTemplate() {
        setLoading(true);
        try {
          const data = await fetchCoverPageTemplateById(templateId);
          if (data) {
            setTemplate(data);
          } else {
            toast({ title: "Error", description: "Cover Page Template not found.", variant: "destructive" });
            router.push('/templates/coverpages');
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

  const handleSubmit = async (data: CoverPageTemplateFormData) => {
    setIsSubmitting(true);
    try {
      const updatedTemplate = await saveCoverPageTemplate(data, templateId);
      if (updatedTemplate) {
        toast({ title: "Success", description: "Cover Page Template updated successfully." });
        router.push('/templates/coverpages');
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
        <AppHeader title="Edit Cover Page Template" showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-6 w-1/4 mb-2" />
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
         <main className="flex-1 p-4 md:p-6 text-center">Cover Page Template not found.</main>
        </>
    );
  }

  return (
    <>
      <AppHeader title="Edit Cover Page Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <CoverPageTemplateForm onSubmit={handleSubmit} initialData={template} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
