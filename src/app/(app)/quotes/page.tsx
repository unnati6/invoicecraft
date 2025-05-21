
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
import { PlusCircle, Edit, Eye, Trash2, FileText as QuoteIcon, Download, ChevronDown, FileSignature } from 'lucide-react';
import type { Quote, Customer } from '@/types';
import { getAllQuotes, removeQuote, fetchCustomerById, convertMultipleQuotesToInvoices } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { QuotePreviewDialog } from '@/components/quote-preview-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadPdfForDocument, downloadMultipleDocumentsAsSinglePdf } from '@/lib/pdf-utils';

export default function QuotesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [quotes, setQuotes] = React.useState<Quote[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isBulkConverting, setIsBulkConverting] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllQuotes();
        setQuotes(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch quotes.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]);

  const handleDeleteQuote = async (id: string) => {
    try {
      await removeQuote(id);
      setQuotes(prev => prev.filter(q => q.id !== id));
      setRowSelection(prev => {
        const newSelection = {...prev};
        delete newSelection[id];
        return newSelection;
      });
      toast({ title: "Success", description: "Quote deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete quote.", variant: "destructive" });
    }
  };
  
  const getSelectedQuotes = (): Quote[] => {
    return Object.entries(rowSelection)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => quotes.find(q => q.id === id))
      .filter((q): q is Quote => !!q);
  };

  const handleDownloadIndividualPdfs = async () => {
    const selectedQuotes = getSelectedQuotes();
    if (selectedQuotes.length === 0) {
      toast({ title: "No Selection", description: "Please select quotes to download.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    toast({ title: "Processing PDFs...", description: `Preparing ${selectedQuotes.length} quote(s) for download.` });

    for (const quote of selectedQuotes) {
      try {
        let customer: Customer | undefined = undefined;
        if (quote.customerId) {
           customer = await fetchCustomerById(quote.customerId);
        }
        await downloadPdfForDocument(quote, customer);
        if (selectedQuotes.length > 1) await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error downloading PDF for quote:", quote.quoteNumber, error);
        toast({ title: "Download Error", description: `Failed to download PDF for ${quote.quoteNumber}.`, variant: "destructive" });
      }
    }
    setIsDownloading(false);
    setRowSelection({}); 
  };

  const handleDownloadCombinedPdf = async () => {
    const selectedQuotes = getSelectedQuotes();
    if (selectedQuotes.length === 0) {
      toast({ title: "No Selection", description: "Please select quotes for combined PDF.", variant: "destructive" });
      return;
    }
    setIsDownloading(true);
     const customers = await Promise.all(
        selectedQuotes.map(q => q.customerId ? fetchCustomerById(q.customerId) : Promise.resolve(undefined))
    );
    await downloadMultipleDocumentsAsSinglePdf(selectedQuotes, customers, 'Combined_Quotes.pdf');
    setIsDownloading(false);
    setRowSelection({});
  };

  const handleBulkConvertToInvoices = async () => {
    const selectedQuoteIds = Object.entries(rowSelection)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedQuoteIds.length === 0) {
      toast({ title: "No Selection", description: "Please select quotes to convert.", variant: "destructive" });
      return;
    }

    setIsBulkConverting(true);
    toast({ title: "Processing...", description: `Converting ${selectedQuoteIds.length} quote(s) to invoices.` });

    try {
      const result = await convertMultipleQuotesToInvoices(selectedQuoteIds);
      if (result.successCount > 0) {
        toast({ title: "Conversion Successful", description: `${result.successCount} quote(s) converted to invoices.` });
      }
      if (result.errorCount > 0) {
        toast({ title: "Conversion Partially Failed", description: `${result.errorCount} quote(s) could not be converted.`, variant: "destructive" });
      }
      // Refresh current page (quotes) and potentially redirect or notify about new invoices
      setQuotes(prev => prev.filter(q => !selectedQuoteIds.includes(q.id))); // Optimistic update or re-fetch
      router.push('/invoices'); // Navigate to invoices page to see new invoices
    } catch (error) {
      console.error("Error converting multiple quotes:", error);
      toast({ title: "Bulk Conversion Error", description: "An unexpected error occurred during bulk conversion.", variant: "destructive" });
    } finally {
      setIsBulkConverting(false);
      setRowSelection({});
    }
  };


  const getStatusVariant = (status: Quote['status']): "default" | "secondary" | "destructive" | "outline" => {
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
    { accessorKey: 'quoteNumber', header: 'Number', cell: (row: Quote) => row.quoteNumber, size: 120 },
    { accessorKey: 'customerName', header: 'Customer', cell: (row: Quote) => row.customerName || 'N/A', size: 200 },
    { accessorKey: 'issueDate', header: 'Issue Date', cell: (row: Quote) => format(new Date(row.issueDate), 'PP'), size: 120 },
    { accessorKey: 'expiryDate', header: 'Expiry Date', cell: (row: Quote) => format(new Date(row.expiryDate), 'PP'), size: 120 },
    { accessorKey: 'total', header: 'Total', cell: (row: Quote) => `$${row.total.toFixed(2)}`, size: 100 },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      cell: (row: Quote) => (
        <Badge variant={getStatusVariant(row.status)} className={row.status === 'Accepted' ? acceptedBadgeClass : ''}>
          {row.status}
        </Badge>
      ),
      size: 100
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: Quote) => (
        <div className="flex space-x-1">
          <QuotePreviewDialog 
            quote={row} 
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Preview Quote">
                <Eye className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/quotes/${row.id}`); }} title="Edit Quote">
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog 
            onConfirm={() => handleDeleteQuote(row.id)} 
            itemName={`quote ${row.quoteNumber}`}
            trigger={
               <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Quote">
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
        <AppHeader title="Quotes">
          <Skeleton className="h-10 w-36" />
        </AppHeader>
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Quotes</CardTitle>
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
      <AppHeader title="Quotes">
         {numSelected > 0 && (
          <>
            <Button onClick={handleBulkConvertToInvoices} disabled={isBulkConverting || isDownloading} variant="outline">
                <FileSignature className="mr-2 h-4 w-4" />
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
        <Link href="/quotes/new">
          <Button disabled={isBulkConverting || isDownloading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Quote
          </Button>
        </Link>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={quotes}
              onRowClick={(row) => router.push(`/quotes/${row.id}`)}
              noResultsMessage="No quotes found. Create your first quote!"
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

