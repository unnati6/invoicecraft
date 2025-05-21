
'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { termsSchema, type TermsFormData } from '@/lib/schemas';
import { fetchQuoteById, saveQuoteTerms } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Quote } from '@/types';
import { Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuoteTermsPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;
  const { toast } = useToast();

  const [quote, setQuote] = React.useState<Quote | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<TermsFormData>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      termsAndConditions: '',
    },
  });

  React.useEffect(() => {
    if (quoteId) {
      async function loadQuoteTerms() {
        setLoading(true);
        try {
          const data = await fetchQuoteById(quoteId);
          if (data) {
            setQuote(data);
            form.reset({ termsAndConditions: data.termsAndConditions || '' });
          } else {
            toast({ title: "Error", description: "Quote not found.", variant: "destructive" });
            router.push('/quotes');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch quote details.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      loadQuoteTerms();
    }
  }, [quoteId, router, toast, form]);

  const handleSubmit = async (data: TermsFormData) => {
    setIsSubmitting(true);
    try {
      const updatedQuote = await saveQuoteTerms(quoteId, data);
      if (updatedQuote) {
        toast({ title: "Success", description: "Terms and conditions updated." });
        router.push(`/quotes/${quoteId}`);
      } else {
        toast({ title: "Error", description: "Failed to update terms.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update terms:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <>
        <AppHeader title="Loading Terms..." showBackButton />
        <main className="flex-1 p-4 md:p-6">
           <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        </main>
      </>
    );
  }

  if (!quote) {
     return (
        <>
         <AppHeader title="Error" showBackButton />
         <main className="flex-1 p-4 md:p-6 text-center">Quote not found.</main>
        </>
    );
  }

  return (
    <>
      <AppHeader title={`Terms for Quote ${quote.quoteNumber}`} showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Edit Terms & Conditions</CardTitle>
                <CardDescription>
                  Specify the terms and conditions for this quote. This will be displayed on the quote preview and PDF.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., This quote is valid for 30 days. Payment terms: 50% upfront, 50% upon completion."
                          className="min-h-[200px] resize-y"
                          {...field}
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
                  {isSubmitting ? 'Saving...' : 'Save Terms'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </main>
    </>
  );
}
