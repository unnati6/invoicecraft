
'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { RepositoryItemForm } from '@/components/repository-item-form';
import type { RepositoryItemFormData } from '@/lib/schemas';
import { fetchRepositoryItemById, saveRepositoryItem } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { RepositoryItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function EditRepositoryItemPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const itemId = params.id as string;
  const { toast } = useToast();
  
  const [item, setItem] = React.useState<RepositoryItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (itemId) {
      async function loadItem() {
        setLoading(true);
        try {
          const data = await fetchRepositoryItemById(itemId);
          if (data) {
            setItem(data);
          } else {
            toast({ title: "Error", description: "Repository Item not found.", variant: "destructive" });
            router.push('/item-repository');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch repository item details.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      loadItem();
    }
  }, [itemId, router, toast, pathname]);

  const handleSubmit = async (data: RepositoryItemFormData) => {
    setIsSubmitting(true);
    try {
      // Ensure id is passed for update
      const updatedItem = await saveRepositoryItem(data, itemId);
      if (updatedItem) {
        toast({ title: "Success", description: "Repository Item updated successfully." });
        router.push('/item-repository');
      } else {
        toast({ title: "Error", description: "Failed to update repository item.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update repository item:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Edit Repository Item" showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="grid grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        </main>
      </>
    );
  }

  if (!item) {
    return (
        <>
         <AppHeader title="Error" showBackButton />
         <main className="flex-1 p-4 md:p-6 text-center">Repository Item not found.</main>
        </>
    );
  }

  return (
    <>
      <AppHeader title="Edit Repository Item" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <RepositoryItemForm onSubmit={handleSubmit} initialData={item} isSubmitting={isSubmitting} />
      </main>
    </>
  );
}
