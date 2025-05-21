
'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { MsaTemplateForm } from '@/components/msa-template-form';
import type { MsaTemplateFormData } from '@/lib/schemas';
import { fetchMsaTemplateById, saveMsaTemplate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { MsaTemplate } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function EditMsaTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const templateId = params.id as string;
  const { toast } = useToast();
  
  const [template, setTemplate] = React.useState<MsaTemplate | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (templateId) {
      async function loadTemplate() {
        setLoading(true);
        try {
          const data = await fetchMsaTemplateById(templateId);
          if (data) {
            setTemplate(data);
          } else {
            toast({ title: "Error", description: "MSA Template not found.", variant: "destructive" });
            router.push('/templates/msa');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch MSA template details.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      loadTemplate();
    }
  }, [templateId, router, toast, pathname]);

  const handleSubmit = async (data: MsaTemplateFormData) => {
    setIsSubmitting(true);
    try {
      const updatedTemplate = await saveMsaTemplate(data, templateId);
      if (updatedTemplate) {
        toast({ title: "Success", description: "MSA Template updated successfully." });
        router.push('/templates/msa');
      } else {
        toast({ title: "Error", description: "Failed to update MSA template.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update MSA template:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Edit MSA Template" showBackButton />
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
         <main className="flex-1 p-4 md:p-6 text-center">MSA Template not found.</main>
        </>
    );
  }

  return (
    <>
      <AppHeader title="Edit MSA Template" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <MsaTemplateForm onSubmit={handleSubmit} initialData={template} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
