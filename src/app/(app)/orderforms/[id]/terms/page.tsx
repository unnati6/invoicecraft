
'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RichTextEditor } from '@/components/rich-text-editor';
import { termsSchema, type TermsFormData } from '@/lib/schemas';
import { fetchOrderFormById, saveOrderFormTerms } from '@/lib/actions'; // Changed
import { useToast } from '@/hooks/use-toast';
import type { OrderForm } from '@/types'; // Changed
import { Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderFormTermsPage() { // Changed
  const router = useRouter();
  const params = useParams();
  const orderFormId = params.id as string; // Changed
  const { toast } = useToast();

  const [orderForm, setOrderForm] = React.useState<OrderForm | null>(null); // Changed
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<TermsFormData>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      termsAndConditions: '',
    },
  });

  React.useEffect(() => {
    if (orderFormId) { // Changed
      async function loadOrderFormTerms() { // Changed
        setLoading(true);
        try {
          const data = await fetchOrderFormById(orderFormId); // Changed
          if (data) {
            setOrderForm(data); // Changed
            form.reset({ termsAndConditions: data.termsAndConditions || '<p></p>' });
          } else {
            toast({ title: "Error", description: "Order Form not found.", variant: "destructive" }); // Changed
            router.push('/orderforms'); // Changed
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch order form details.", variant: "destructive" }); // Changed
        } finally {
          setLoading(false);
        }
      }
      loadOrderFormTerms(); // Changed
    }
  }, [orderFormId, router, toast, form]); // Changed

  const handleSubmit = async (data: TermsFormData) => {
    setIsSubmitting(true);
    try {
      const termsToSave = data.termsAndConditions === '<p></p>' ? '' : data.termsAndConditions;
      const updatedOrderForm = await saveOrderFormTerms(orderFormId, { termsAndConditions: termsToSave }); // Changed
      if (updatedOrderForm) {
        toast({ title: "Success", description: "Terms and conditions updated." });
        router.push(`/orderforms/${orderFormId}`); // Changed
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
            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
            <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
          </Card>
        </main>
      </>
    );
  }

  if (!orderForm) { // Changed
     return (
        <>
         <AppHeader title="Error" showBackButton />
         <main className="flex-1 p-4 md:p-6 text-center">Order Form not found.</main> {/* Changed */}
        </>
    );
  }

  return (
    <>
      <AppHeader title={`Terms for Order Form ${orderForm.orderFormNumber}`} showBackButton /> {/* Changed */}
      <main className="flex-1 p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Edit Terms &amp; Conditions</CardTitle>
                <CardDescription>Use the editor below to format the terms and conditions for this order form.</CardDescription> {/* Changed */}
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Terms &amp; Conditions</FormLabel>
                      <FormControl>
                        <RichTextEditor value={field.value || ''} onChange={field.onChange} disabled={isSubmitting} />
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
