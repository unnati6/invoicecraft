
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, PackageOpen } from 'lucide-react';
import type { PurchaseOrder } from '@/types';
import { getAllPurchaseOrders, removePurchaseOrder } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrencySymbol } from '@/lib/currency-utils'; // Assuming POs might reference a base currency

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllPurchaseOrders();
        setPurchaseOrders(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch purchase orders.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]);

  const handleDeletePurchaseOrder = async (id: string) => {
    try {
      await removePurchaseOrder(id);
      setPurchaseOrders(prev => prev.filter(po => po.id !== id));
      toast({ title: "Success", description: "Purchase Order deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete purchase order.", variant: "destructive" });
    }
  };

  const getStatusVariant = (status: PurchaseOrder['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Issued': return 'default'; // Green
      case 'Fulfilled': return 'secondary'; // Blue-gray
      case 'Cancelled': return 'destructive'; // Red
      case 'Draft': return 'outline'; // Default outline
      default: return 'outline';
    }
  };

  const columns: any[] = [
    { accessorKey: 'poNumber', header: 'PO Number', cell: (row: PurchaseOrder) => row.poNumber, size: 120 },
    { accessorKey: 'vendorName', header: 'Vendor', cell: (row: PurchaseOrder) => row.vendorName, size: 200 },
    { 
      accessorKey: 'orderFormNumber', 
      header: 'Source Order Form', 
      cell: (row: PurchaseOrder) => (
        <Link href={`/orderforms/${row.orderFormId}`} className="text-primary hover:underline">
          {row.orderFormNumber}
        </Link>
      ),
      size: 150 
    },
    { accessorKey: 'issueDate', header: 'Issue Date', cell: (row: PurchaseOrder) => format(new Date(row.issueDate), 'PP'), size: 120 },
    { 
      accessorKey: 'grandTotalVendorPayable', 
      header: 'Total Payable', 
      // Assuming POs might not have a specific currency_code, default to app's base for display
      cell: (row: PurchaseOrder) => `${getCurrencySymbol('USD')}${row.grandTotalVendorPayable.toFixed(2)}`, 
      size: 130 
    },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      cell: (row: PurchaseOrder) => (
        <Badge variant={getStatusVariant(row.status)} className={row.status === 'Issued' ? 'bg-primary text-primary-foreground hover:bg-primary/80' : ''}>
          {row.status}
        </Badge>
      ),
      size: 100
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: PurchaseOrder) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); /* router.push(`/purchase-orders/${row.id}`); */ toast({title: "Info", description: "PO detail view not yet implemented."}) }} title="View Purchase Order">
            <Eye className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog 
            onConfirm={() => handleDeletePurchaseOrder(row.id)} 
            itemName={`purchase order ${row.poNumber}`}
            trigger={
               <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Purchase Order">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        </div>
      ),
      size: 120
    },
  ];
  
  if (loading) {
    return (
      <>
        <AppHeader title="Purchase Orders" />
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>All Purchase Orders</CardTitle><CardDescription>Manage and track your purchase orders to vendors.</CardDescription></CardHeader>
            <CardContent><div className="space-y-2">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div></CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Purchase Orders" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Purchase Orders</CardTitle>
            <CardDescription>Manage and track your purchase orders to vendors.</CardDescription>
          </CardHeader>
          <CardContent>
            {purchaseOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[30vh] text-center">
                <PackageOpen className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Purchase Orders Yet</h2>
                <p className="text-muted-foreground">Purchase orders are automatically generated when you save an Order Form with items that have a vendor and procurement price.</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={purchaseOrders}
                onRowClick={(row) => { /* router.push(`/purchase-orders/${row.id}`); */ toast({title: "Info", description: "PO detail view not yet implemented."})}}
                noResultsMessage="No purchase orders found."
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
