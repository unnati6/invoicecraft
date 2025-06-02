
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
import { PlusCircle, Edit, Eye, Trash2, ChevronDown, Download, CheckSquare } from 'lucide-react';
import type { Invoice, Customer } from '@/types';
import { getAllInvoices,getAllCustomers, removeInvoice, fetchCustomerById, markInvoiceAsPaid } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { InvoicePreviewDialog } from '@/components/invoice-preview-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadPdfForDocument, downloadMultipleDocumentsAsSinglePdf } from '@/lib/pdf-utils.tsx';
import { getCurrencySymbol } from '@/lib/currency-utils';

export default function InvoicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = React.useState<string | null>(null);
  const [customers,setCustomers] = React.useState<Customer[]>([]);
  

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllInvoices();
        const customerdata = await getAllCustomers();
        
        setCustomers(customerdata);
        const enrichedOrderForms = data.map(form => {
          const customer = customerdata.find(cust => cust.id === form.customerId);
          return {
            ...form,
            customerName: customer ? customer.name : 'Unknown Customer', // नई प्रॉपर्टी जोड़ें
            
          };
        });
        setInvoices(enrichedOrderForms);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch invoices.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDeleteInvoice = async (id: string) => {
    try {
        const success = await removeInvoice(id); // Capture the boolean result
      if (success) {
            setInvoices(prev => prev.filter(inv => inv.id !== id));
            setRowSelection(prev => {
                const newSelection = {...prev};
                delete newSelection[id];
                return newSelection;
            });
            toast({ title: "Success", description: "Invoice deleted successfully." });
        } else {
            // This 'else' block handles cases where the action returns false (e.g., due to an error in data.ts being caught and returning false)
            toast({ title: "Error", description: "Failed to delete invoice. (Action returned false)", variant: "destructive" });
        }
    } catch (error) { // This block handles actual exceptions thrown by removeInvoice
        console.error("Error deleting invoice:", error);
        toast({ title: "Error", description: "Failed to delete invoice. (An unexpected error occurred)", variant: "destructive" });
    }
};


  const handleMarkAsPaid = async (invoiceId: string) => {
    setIsMarkingPaid(invoiceId);
    try {
      const updatedInvoice = await markInvoiceAsPaid(invoiceId);
      if (updatedInvoice) {
        setInvoices(prevInvoices =>
          prevInvoices.map(inv =>
            inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv
          )
        );
        toast({ title: "Success", description: `Invoice ${updatedInvoice.invoiceNumber} marked as paid.` });
      } else {
        toast({ title: "Error", description: "Failed to mark invoice as paid.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsMarkingPaid(null);
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
    { accessorKey: 'customerName', header: 'Customer', cell: (row: Invoice) => row.customerName || 'N/A', size: 150 },
    { accessorKey: 'issueDate', header: 'Issue Date', cell: (row: Invoice) =>{
            return row.issueDate ? format(row.issueDate, 'PP') : 'N/A';
          
        },
        size:120 },
    {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: (row: Invoice) => {
            // यह भी
            return row.dueDate ? format(row.dueDate, 'PP') : 'N/A';
        },
        size: 120
    },   {
        accessorKey: 'total',
        header: 'Total',
        cell: (row: Invoice) => {
            // **यहां नल और प्रकार जांच लागू करें**
            // यदि row.total null या undefined है, तो डिफ़ॉल्ट मान 0.00 का उपयोग करें
            const displayTotal = row.total != null && typeof row.total === 'number'
                                 ? row.total
                                 : 0; // यदि total null है, तो 0 का उपयोग करें

            const currencySymbol = getCurrencySymbol(row.currencyCode || 'USD'); // डिफ़ॉल्ट USD यदि currencyCode अनुपस्थित है

            return `${currencySymbol}${displayTotal.toFixed(2)}`;
        },
        size: 100
    },  { 
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
        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
          <InvoicePreviewDialog 
            invoice={row} 
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Preview Invoice">
                <Eye className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation();
             router.push(`/invoices/${row.id}/`); }} 
             title="Edit Invoice">
              <Edit className="h-4 w-4" />
          </Button>
          {row.status !== 'Paid' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(row.id); }}
              disabled={isMarkingPaid === row.id}
              title="Mark as Paid"
            >
              <CheckSquare className="h-4 w-4 text-primary" />
            </Button>
          )}
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
      size: 180 // Increased size to accommodate new button
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
            <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader>
            <CardContent><div className="space-y-2">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div></CardContent>
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
              <DropdownMenuItem onSelect={handleDownloadIndividualPdfs} disabled={isDownloading}>Download as Individual PDFs</DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDownloadCombinedPdf} disabled={isDownloading}>Download as Single PDF</DropdownMenuItem>
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
            <DropdownMenuItem onSelect={() => router.push('/invoices/new')}>Create Invoice</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push('/orderforms/new')}>Create Order Form</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader>
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
