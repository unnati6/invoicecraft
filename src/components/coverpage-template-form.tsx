
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card';
import { coverPageTemplateSchema, type CoverPageTemplateFormData } from '@/lib/schemas';
import type { CoverPageTemplate } from '@/types';
import { Save, Image as ImageIcon } from 'lucide-react';

interface CoverPageTemplateFormProps {
  onSubmit: (data: CoverPageTemplateFormData) => Promise<void>;
  initialData?: CoverPageTemplate | null;
  isSubmitting?: boolean;
}

export function CoverPageTemplateForm({ onSubmit, initialData, isSubmitting = false }: CoverPageTemplateFormProps) {
  const form = useForm<CoverPageTemplateFormData>({
    resolver: zodResolver(coverPageTemplateSchema),
    defaultValues: {
      name: initialData?.name || '',
      title: initialData?.title || 'Master Service Agreement',
      companyLogoEnabled: initialData?.companyLogoEnabled ?? true,
      companyLogoUrl: initialData?.companyLogoUrl || 'https://placehold.co/200x60.png',
      clientLogoEnabled: initialData?.clientLogoEnabled ?? true,
      clientLogoUrl: initialData?.clientLogoUrl || 'https://placehold.co/150x50.png',
      additionalImage1Enabled: initialData?.additionalImage1Enabled ?? false,
      additionalImage1Url: initialData?.additionalImage1Url || 'https://placehold.co/300x200.png',
      additionalImage2Enabled: initialData?.additionalImage2Enabled ?? false,
      additionalImage2Url: initialData?.additionalImage2Url || 'https://placehold.co/300x200.png',
    },
  });

  const watchCompanyLogoEnabled = form.watch('companyLogoEnabled');
  const watchClientLogoEnabled = form.watch('clientLogoEnabled');
  const watchAdditionalImage1Enabled = form.watch('additionalImage1Enabled');
  const watchAdditionalImage2Enabled = form.watch('additionalImage2Enabled');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Cover Page Template' : 'Create New Cover Page Template'}</CardTitle>
            <CardDesc>
              Design a reusable cover page. You can specify a title and URLs for logos/images.
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
                    <Input placeholder="e.g. Standard MSA Cover" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Page Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Master Service Agreement" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>This title will appear prominently on the cover page.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Image Configuration</h3>
              {/* Company Logo */}
              <FormField
                control={form.control}
                name="companyLogoEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                    <FormLabel>Show Company Logo</FormLabel>
                  </FormItem>
                )}
              />
              {watchCompanyLogoEnabled && (
                <FormField
                  control={form.control}
                  name="companyLogoUrl"
                  render={({ field }) => (
                    <FormItem className="pl-7">
                      <FormLabel>Company Logo URL</FormLabel>
                      <FormControl><Input placeholder="https://placehold.co/200x60.png" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Client Logo */}
              <FormField
                control={form.control}
                name="clientLogoEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                    <FormLabel>Show Client Logo</FormLabel>
                  </FormItem>
                )}
              />
              {watchClientLogoEnabled && (
                <FormField
                  control={form.control}
                  name="clientLogoUrl"
                  render={({ field }) => (
                    <FormItem className="pl-7">
                      <FormLabel>Client Logo URL</FormLabel>
                      <FormControl><Input placeholder="https://placehold.co/150x50.png" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {/* Additional Image 1 */}
                <FormField
                    control={form.control}
                    name="additionalImage1Enabled"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                        <FormLabel>Show Additional Image 1</FormLabel>
                    </FormItem>
                    )}
                />
                {watchAdditionalImage1Enabled && (
                    <FormField
                    control={form.control}
                    name="additionalImage1Url"
                    render={({ field }) => (
                        <FormItem className="pl-7">
                        <FormLabel>Additional Image 1 URL</FormLabel>
                        <FormControl><Input placeholder="https://placehold.co/300x200.png" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                {/* Additional Image 2 */}
                <FormField
                    control={form.control}
                    name="additionalImage2Enabled"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                        <FormLabel>Show Additional Image 2</FormLabel>
                    </FormItem>
                    )}
                />
                {watchAdditionalImage2Enabled && (
                    <FormField
                    control={form.control}
                    name="additionalImage2Url"
                    render={({ field }) => (
                        <FormItem className="pl-7">
                        <FormLabel>Additional Image 2 URL</FormLabel>
                        <FormControl><Input placeholder="https://placehold.co/300x200.png" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
            </div>
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

CoverPageTemplateForm.displayName = "CoverPageTemplateForm";
