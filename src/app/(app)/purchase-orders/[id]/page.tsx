
'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { PurchaseOrder } from '@/types';
import { fetchPurchaseOrderById } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrencySymbol } from '@/lib/currency-utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poId = params.id as string;
  const { toast } = useToast();

  const [purchaseOrder, setPurchaseOrder] = React.useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (poId) {
      async function loadPurchaseOrder() {
        setLoading(true);
        try {
          const data = await fetchPurchaseOrderById(poId);
          if (data) {
            setPurchaseOrder(data);
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
  }, [poId, router, toast]);

  const getStatusVariant = (status: PurchaseOrder['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Issued': return 'default';
      case 'Fulfilled': return 'secondary';
      case 'Cancelled': return 'destructive';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Loading Purchase Order..." showBackButton />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full mt-4" /> {/* For items table */}
              <Skeleton className="h-6 w-1/3 ml-auto" /> {/* For total */}
            </CardContent>
          </Card>
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

  // Assuming a base currency for POs, or derive from customer if linked through OrderForm
  const currencySymbol = getCurrencySymbol('USD'); // Or derive more dynamically if POs can have different currencies

  return (
    <>
      <AppHeader title={`Purchase Order: ${purchaseOrder.poNumber}`} showBackButton />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>PO Details: {purchaseOrder.poNumber}</CardTitle>
            <CardDescription>Vendor: {purchaseOrder.vendorName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="font-semibold text-muted-foreground">Issue Date:</span> {format(new Date(purchaseOrder.issueDate), 'PPP')}</p>
                <p><span className="font-semibold text-muted-foreground">Status:</span> <Badge variant={getStatusVariant(purchaseOrder.status)} className={purchaseOrder.status === 'Issued' ? 'bg-primary text-primary-foreground hover:bg-primary/80' : ''}>{purchaseOrder.status}</Badge></p>
              </div>
              <div>
                <p><span className="font-semibold text-muted-foreground">Source Order Form:</span>
                  <Link href={`/orderforms/${purchaseOrder.orderFormId}`} className="text-primary hover:underline ml-1">
                    {purchaseOrder.orderFormNumber}
                  </Link>
                </p>
              </div>
            </div>

            <h4 className="text-md font-semibold pt-4 border-t mt-4">Items</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Proc. Price</TableHead>
                  <TableHead className="text-right">Total Payable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrder.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{currencySymbol}{item.procurementPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{currencySymbol}{item.totalVendorPayable.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-4">
              <div className="w-full max-w-xs space-y-1 text-sm">
                <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                  <span>Grand Total Payable:</span>
                  <span>{currencySymbol}{purchaseOrder.grandTotalVendorPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
