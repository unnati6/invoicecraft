
'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { PurchaseOrderForm } from '@/components/purchase-order-form';
import type { PurchaseOrderFormData } from '@/lib/schemas';
import { fetchPurchaseOrderById, savePurchaseOrder } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { PurchaseOrder } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadCNDescription, CardFooter } from '@/components/ui/card'; // Renamed to avoid conflict
import { Button } from '@/components/ui/button';
import { Edit, Printer } from 'lucide-react';
import Link from 'next/link';

export default function ViewEditPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const poId = params.id as string;
  const { toast } = useToast();
  
  const [purchaseOrder, setPurchaseOrder] = React.useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);

  React.useEffect(() => {
    if (poId) {
      async function loadPurchaseOrder() {
        setLoading(true);
        try {
          const data = await fetchPurchaseOrderById(poId);
          if (data) {
            setPurchaseOrder(data);
            // Automatically enter edit mode if the PO is a draft
            if (data.status === 'Draft') {
              setIsEditMode(true);
            }
          } else {
            toast({ title: "Error", description: "Purchase Order not found.", variant: "destructive" });
            router.push('/purchase-orders');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch purchase order details.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      loadPurchaseOrder();
    }
  }, [poId, router, toast, pathname]);

  const handleSubmit = async (data: PurchaseOrderFormData) => {
    setIsSubmitting(true);
    try {
      const updatedPurchaseOrder = await savePurchaseOrder(data, poId);
      if (updatedPurchaseOrder) {
        setPurchaseOrder(updatedPurchaseOrder);
        setIsEditMode(false); // Exit edit mode on successful save
        toast({ title: "Success", description: "Purchase Order updated successfully." });
        router.refresh(); // Refresh to show updated data in view mode if applicable
      } else {
        toast({ title: "Error", description: "Failed to update Purchase Order.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update Purchase Order:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    // Placeholder for print functionality
    toast({ title: "Print (Prototype)", description: "Printing functionality is not yet implemented." });
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Loading Purchase Order..." showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Skeleton className="h-[500px] w-full" />
        </main>
      </>
    );
  }

  if (!purchaseOrder) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">Purchase Order not found.</main>
      </>
    );
  }

  const pageTitle = isEditMode 
    ? `Edit Purchase Order: ${purchaseOrder.poNumber}` 
    : `View Purchase Order: ${purchaseOrder.poNumber}`;

  return (
    <>
      <AppHeader title={pageTitle} showBackButton>
        {purchaseOrder.status === 'Draft' && !isEditMode && (
          <Button variant="outline" onClick={() => setIsEditMode(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit PO
          </Button>
        )}
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print PO
        </Button>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        <PurchaseOrderForm
          onSubmit={handleSubmit}
          initialData={purchaseOrder}
          isSubmitting={isSubmitting}
          poNumber={purchaseOrder.poNumber}
          isViewMode={!isEditMode} // Form is in view mode if not in edit mode
        />
      </main>
    </>
  );
}
