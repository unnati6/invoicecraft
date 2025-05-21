
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card';
import { RichTextEditor } from '@/components/rich-text-editor';
import { msaTemplateSchema, type MsaTemplateFormData } from '@/lib/schemas';
import type { MsaTemplate, CoverPageTemplate } from '@/types';
import { getAllCoverPageTemplates } from '@/lib/actions';
import { Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface MsaTemplateFormProps {
  onSubmit: (data: MsaTemplateFormData) => Promise<void>;
  initialData?: MsaTemplate | null;
  isSubmitting?: boolean;
}

export function MsaTemplateForm({ onSubmit, initialData, isSubmitting = false }: MsaTemplateFormProps) {
  const [coverPageTemplates, setCoverPageTemplates] = React.useState<CoverPageTemplate[]>([]);
  const [isLoadingCoverPageTemplates, setIsLoadingCoverPageTemplates] = React.useState(true);
  const { toast } = useToast();

  const form = useForm<MsaTemplateFormData>({
    resolver: zodResolver(msaTemplateSchema),
    defaultValues: {
      name: initialData?.name || '',
      content: initialData?.content || '<p></p>',
      coverPageTemplateId: initialData?.coverPageTemplateId || '',
    },
  });

  React.useEffect(() => {
    async function loadCoverPageTemplates() {
      setIsLoadingCoverPageTemplates(true);
      try {
        const templates = await getAllCoverPageTemplates();
        setCoverPageTemplates(templates);
      } catch (error) {
        console.error("Failed to load cover page templates", error);
        toast({ title: "Error", description: "Could not load cover page templates.", variant: "destructive" });
      } finally {
        setIsLoadingCoverPageTemplates(false);
      }
    }
    loadCoverPageTemplates();
  }, [toast]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit MSA Template' : 'Create New MSA Template'}</CardTitle>
            <CardDesc> 
              {initialData ? 'Modify the details of your Master Service Agreement template.' : 'Define a reusable Master Service Agreement template.'}
            </CardDesc>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Standard MSA for Services" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Content *</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || '<p></p>'}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverPageTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Page Template (Optional)</FormLabel>
                  {isLoadingCoverPageTemplates ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None (No Cover Page)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None (No Cover Page)</SelectItem>
                        {coverPageTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormDescription>Select a pre-designed cover page to attach to this MSA.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || isLoadingCoverPageTemplates}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Template')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

MsaTemplateForm.displayName = "MsaTemplateForm";
