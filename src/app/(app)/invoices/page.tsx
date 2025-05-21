
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
import { PlusCircle, Edit, Eye, Trash2, ChevronDown, Download } from 'lucide-react';
import type { Invoice, Customer } from '@/types';
import { getAllInvoices, removeInvoice, fetchCustomerById } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { InvoicePreviewDialog } from '@/components/invoice-preview-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { downloadPdfForDocument, downloadMultipleDocumentsAsSinglePdf } from '@/lib/pdf-utils';

export default function InvoicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllInvoices();
        setInvoices(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch invoices.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]);

  const handleDeleteInvoice = async (id: string) => {
    try {
      await removeInvoice(id);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      setRowSelection(prev => {
        const newSelection = {...prev};
        delete newSelection[id];
        return newSelection;
      });
      toast({ title: "Success", description: "Invoice deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete invoice.", variant: "destructive" });
    }
  };

  const getSelectedInvoices = (): Invoice[] => {
    return Object.entries(rowSelection)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => invoices.find(inv => inv.id === id))
      .filter((inv): inv is Invoice => !!inv);
  };

  const handleDownloadIndividualPdfs = async () => {
    const selectedInvoices = getSelectedInvoices();
    if (selectedInvoices.length === 0) {
      toast({ title: "No Selection", description: "Please select invoices to download.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    toast({ title: "Processing PDFs...", description: `Preparing ${selectedInvoices.length} invoice(s) for download.` });

    for (const invoice of selectedInvoices) {
      try {
        let customer: Customer | undefined = undefined;
        if (invoice.customerId) {
           customer = await fetchCustomerById(invoice.customerId);
        }
        await downloadPdfForDocument(invoice, customer);
        if (selectedInvoices.length > 1) await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error downloading PDF for invoice:", invoice.invoiceNumber, error);
        toast({ title: "Download Error", description: `Failed to download PDF for ${invoice.invoiceNumber}.`, variant: "destructive" });
      }
    }
    setIsDownloading(false);
    setRowSelection({});
  };

  const handleDownloadCombinedPdf = async () => {
    const selectedInvoices = getSelectedInvoices();
    if (selectedInvoices.length === 0) {
      toast({ title: "No Selection", description: "Please select invoices for combined PDF.", variant: "destructive" });
      return;
    }
    setIsDownloading(true);
    const customers = await Promise.all(
        selectedInvoices.map(inv => inv.customerId ? fetchCustomerById(inv.customerId) : Promise.resolve(undefined))
    );
    await downloadMultipleDocumentsAsSinglePdf(selectedInvoices, customers, 'Combined_Invoices.pdf');
    setIsDownloading(false);
    setRowSelection({});
  };


  const getStatusVariant = (status: Invoice['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Paid': return 'default'; 
      case 'Sent': return 'secondary';
      case 'Overdue': return 'destructive';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };
  const paidBadgeClass = "bg-primary text-primary-foreground hover:bg-primary/80";


  const columns: any[] = [
    { accessorKey: 'invoiceNumber', header: 'Number', cell: (row: Invoice) => row.invoiceNumber, size: 100 },
    { accessorKey: 'customerName', header: 'Customer', cell: (row: Invoice) => row.customerName || 'N/A', size: 200 },
    { accessorKey: 'issueDate', header: 'Issue Date', cell: (row: Invoice) => format(new Date(row.issueDate), 'PP'), size: 120 },
    { accessorKey: 'dueDate', header: 'Due Date', cell: (row: Invoice) => format(new Date(row.dueDate), 'PP'), size: 120 },
    { accessorKey: 'total', header: 'Total', cell: (row: Invoice) => `$${row.total.toFixed(2)}`, size: 100 },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      cell: (row: Invoice) => (
        <Badge variant={getStatusVariant(row.status)} className={row.status === 'Paid' ? paidBadgeClass : ''}>
          {row.status}
        </Badge>
      ),
      size: 100
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: Invoice) => (
        <div className="flex space-x-1">
          <InvoicePreviewDialog 
            invoice={row} 
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Preview Invoice">
                <Eye className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/invoices/${row.id}`); }} title="Edit Invoice">
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog 
            onConfirm={() => handleDeleteInvoice(row.id)} 
            itemName={`invoice ${row.invoiceNumber}`}
            trigger={
               <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Invoice">
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
        <AppHeader title="Invoices">
          <Skeleton className="h-10 w-36" />
        </AppHeader>
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
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
      <AppHeader title="Invoices">
        {numSelected > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isDownloading}>
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? `Processing ${numSelected}...` : `Download ${numSelected} Selected`}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleDownloadIndividualPdfs} disabled={isDownloading}>
                Download as Individual PDFs
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDownloadCombinedPdf} disabled={isDownloading}>
                Download as Single PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => router.push('/invoices/new')}>
              Create Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push('/quotes/new')}>
              Create Quote
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={invoices}
              onRowClick={(row) => router.push(`/invoices/${row.id}`)}
              noResultsMessage="No invoices found. Create your first invoice!"
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

