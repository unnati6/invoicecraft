
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RichTextEditor } from '@/components/rich-text-editor';
import { msaTemplateSchema, type MsaTemplateFormData } from '@/lib/schemas';
import type { MsaTemplate } from '@/types';
import { Save } from 'lucide-react';

interface MsaTemplateFormProps {
  onSubmit: (data: MsaTemplateFormData) => Promise<void>;
  initialData?: MsaTemplate | null;
  isSubmitting?: boolean;
}

export function MsaTemplateForm({ onSubmit, initialData, isSubmitting = false }: MsaTemplateFormProps) {
  const form = useForm<MsaTemplateFormData>({
    resolver: zodResolver(msaTemplateSchema),
    defaultValues: {
      name: initialData?.name || '',
      content: initialData?.content || '<p></p>',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit MSA Template' : 'Create New MSA Template'}</CardTitle>
            <CardDescription>
              {initialData ? 'Modify the details of your Master Service Agreement template.' : 'Define a reusable Master Service Agreement template.'}
            </CardDescription>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
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
