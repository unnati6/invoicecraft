
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Eye, Trash2, Download, ChevronDown, FileSignature as OrderFormIcon } from 'lucide-react'; // Changed QuoteIcon to OrderFormIcon
import type { OrderForm, Customer } from '@/types'; // Changed Quote to OrderForm
import { getAllOrderForms, removeOrderForm, fetchCustomerById, convertMultipleOrderFormsToInvoices } from '@/lib/actions'; // Changed to OrderForm actions
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { OrderFormPreviewDialog } from '@/components/orderform-preview-dialog'; // Changed to OrderFormPreviewDialog
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadPdfForDocument, downloadMultipleDocumentsAsSinglePdf } from '@/lib/pdf-utils';
import { getCurrencySymbol } from '@/lib/currency-utils';

export default function OrderFormsPage() { // Renamed component
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [orderForms, setOrderForms] = React.useState<OrderForm[]>([]); // Changed to OrderForm
  const [loading, setLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isBulkConverting, setIsBulkConverting] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllOrderForms(); // Changed to getAllOrderForms
        setOrderForms(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch order forms.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]);

  const handleDeleteOrderForm = async (id: string) => { // Renamed
    try {
      await removeOrderForm(id); // Changed to removeOrderForm
      setOrderForms(prev => prev.filter(of => of.id !== id));
      setRowSelection(prev => {
        const newSelection = {...prev};
        delete newSelection[id];
        return newSelection;
      });
      toast({ title: "Success", description: "Order Form deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete order form.", variant: "destructive" });
    }
  };
  
  const getSelectedOrderForms = (): OrderForm[] => { // Renamed
    return Object.entries(rowSelection)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => orderForms.find(of => of.id === id))
      .filter((of): of is OrderForm => !!of);
  };

  const handleDownloadIndividualPdfs = async () => {
    const selectedOrderForms = getSelectedOrderForms(); // Renamed
    if (selectedOrderForms.length === 0) {
      toast({ title: "No Selection", description: "Please select order forms to download.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    toast({ title: "Processing PDFs...", description: `Preparing ${selectedOrderForms.length} order form(s) for download.` });

    for (const orderForm of selectedOrderForms) { // Renamed
      try {
        let customer: Customer | undefined = undefined;
        if (orderForm.customerId) {
           customer = await fetchCustomerById(orderForm.customerId);
        }
        await downloadPdfForDocument(orderForm, customer);
        if (selectedOrderForms.length > 1) await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error downloading PDF for order form:", orderForm.orderFormNumber, error); // Renamed
        toast({ title: "Download Error", description: `Failed to download PDF for ${orderForm.orderFormNumber}.`, variant: "destructive" });
      }
    }
    setIsDownloading(false);
    setRowSelection({}); 
  };

  const handleDownloadCombinedPdf = async () => {
    const selectedOrderForms = getSelectedOrderForms(); // Renamed
    if (selectedOrderForms.length === 0) {
      toast({ title: "No Selection", description: "Please select order forms for combined PDF.", variant: "destructive" });
      return;
    }
    setIsDownloading(true);
     const customers = await Promise.all(
        selectedOrderForms.map(of => of.customerId ? fetchCustomerById(of.customerId) : Promise.resolve(undefined))
    );
    await downloadMultipleDocumentsAsSinglePdf(selectedOrderForms, customers, 'Combined_OrderForms.pdf'); // Renamed
    setIsDownloading(false);
    setRowSelection({});
  };

  const handleBulkConvertToInvoices = async () => {
    const selectedOrderFormIds = Object.entries(rowSelection) // Renamed
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedOrderFormIds.length === 0) {
      toast({ title: "No Selection", description: "Please select order forms to convert.", variant: "destructive" });
      return;
    }

    setIsBulkConverting(true);
    toast({ title: "Processing...", description: `Converting ${selectedOrderFormIds.length} order form(s) to invoices.` });

    try {
      const result = await convertMultipleOrderFormsToInvoices(selectedOrderFormIds); // Corrected function name
      if (result.successCount > 0) {
        toast({ title: "Conversion Successful", description: `${result.successCount} order form(s) converted to invoices.` });
      }
      if (result.errorCount > 0) {
        toast({ title: "Conversion Partially Failed", description: `${result.errorCount} order form(s) could not be converted.`, variant: "destructive" });
      }
      setOrderForms(prev => prev.filter(of => !selectedOrderFormIds.includes(of.id))); 
      router.push('/invoices'); 
    } catch (error) {
      console.error("Error converting multiple order forms:", error);
      toast({ title: "Bulk Conversion Error", description: "An unexpected error occurred during bulk conversion.", variant: "destructive" });
    } finally {
      setIsBulkConverting(false);
      setRowSelection({});
    }
  };

  const getStatusVariant = (status: OrderForm['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Accepted': return 'default'; 
      case 'Sent': return 'secondary';
      case 'Declined': 
      case 'Expired': return 'destructive';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };
  const acceptedBadgeClass = "bg-primary text-primary-foreground hover:bg-primary/80";

  const columns: any[] = [ 
    { accessorKey: 'orderFormNumber', header: 'Number', cell: (row: OrderForm) => row.orderFormNumber, size: 120 },
    { accessorKey: 'customerName', header: 'Customer', cell: (row: OrderForm) => row.customerName || 'N/A', size: 200 },
    { accessorKey: 'issueDate', header: 'Issue Date', cell: (row: OrderForm) => format(new Date(row.issueDate), 'PP'), size: 120 },
    { accessorKey: 'validUntilDate', header: 'Valid Until', cell: (row: OrderForm) => format(new Date(row.validUntilDate), 'PP'), size: 120 }, // Renamed from expiryDate
    { accessorKey: 'total', header: 'Total', cell: (row: OrderForm) => `${getCurrencySymbol(row.currencyCode)}${row.total.toFixed(2)}`, size: 100 },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      cell: (row: OrderForm) => (
        <Badge variant={getStatusVariant(row.status)} className={row.status === 'Accepted' ? acceptedBadgeClass : ''}>
          {row.status}
        </Badge>
      ),
      size: 100
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: OrderForm) => (
        <div className="flex space-x-1">
          <OrderFormPreviewDialog // Renamed
            orderForm={row} 
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Preview Order Form">
                <Eye className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/orderforms/${row.id}`); }} title="Edit Order Form">
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog 
            onConfirm={() => handleDeleteOrderForm(row.id)} 
            itemName={`order form ${row.orderFormNumber}`}
            trigger={
               <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Order Form">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        </div>
      ),
      size: 150
    },
  ];
  
  const numSelected = Object.values(rowSelection).filter(Boolean).length;

  if (loading) {
    return (
      <>
        <AppHeader title="Order Forms"> {/* Renamed title */}
          <Skeleton className="h-10 w-36" />
        </AppHeader>
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Order Forms</CardTitle> {/* Renamed title */}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Order Forms"> {/* Renamed title */}
         {numSelected > 0 && (
          <>
            <Button onClick={handleBulkConvertToInvoices} disabled={isBulkConverting || isDownloading} variant="outline">
                <OrderFormIcon className="mr-2 h-4 w-4" /> {/* Changed Icon */}
                {isBulkConverting ? `Converting ${numSelected}...` : `Convert ${numSelected} to Invoice(s)`}
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isDownloading || isBulkConverting}>
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? `Processing ${numSelected}...` : `Download ${numSelected} Selected`}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleDownloadIndividualPdfs} disabled={isDownloading || isBulkConverting}>
                    Download as Individual PDFs
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDownloadCombinedPdf} disabled={isDownloading || isBulkConverting}>
                    Download as Single PDF
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <Link href="/orderforms/new"> {/* Link to new order form */}
          <Button disabled={isBulkConverting || isDownloading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Order Form {/* Button text changed */}
          </Button>
        </Link>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Order Forms</CardTitle> {/* Renamed title */}
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={orderForms}
              onRowClick={(row) => router.push(`/orderforms/${row.id}`)}
              noResultsMessage="No order forms found. Create your first order form!"
              isSelectable={true}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}

    