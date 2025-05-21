
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
import { PlusCircle, Edit, Eye, Trash2, FileText as QuoteIcon, Download } from 'lucide-react'; // Added Download
import type { Quote, Customer } from '@/types';
import { getAllQuotes, removeQuote, fetchCustomerById } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { QuotePreviewDialog } from '@/components/quote-preview-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { downloadPdfForDocument } from '@/lib/pdf-utils'; // Added

export default function QuotesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [quotes, setQuotes] = React.useState<Quote[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = React.useState(false);

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
  
  const handleDownloadSelectedPdfs = async () => {
    const selectedIds = Object.entries(rowSelection)
      .filter(([_,isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedIds.length === 0) {
      toast({ title: "No Selection", description: "Please select quotes to download.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    toast({ title: "Processing PDFs...", description: `Preparing ${selectedIds.length} quote(s) for download.` });

    for (const id of selectedIds) {
      const quote = quotes.find(q => q.id === id);
      if (quote) {
        try {
          let customer: Customer | undefined = undefined;
          if (quote.customerId) {
             customer = await fetchCustomerById(quote.customerId);
          }
          await downloadPdfForDocument(quote, customer);
           if (selectedIds.length > 1) await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error("Error downloading PDF for quote:", quote.quoteNumber, error);
          toast({ title: "Download Error", description: `Failed to download PDF for ${quote.quoteNumber}.`, variant: "destructive" });
        }
      }
    }
    setIsDownloading(false);
    setRowSelection({}); 
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


  const columns: any[] = [ // Type any for simplicity with dynamic selection column
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
          <Link href="/quotes/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Quote
            </Button>
          </Link>
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
          <Button onClick={handleDownloadSelectedPdfs} disabled={isDownloading} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? `Downloading ${numSelected}...` : `Download ${numSelected} PDF(s)`}
          </Button>
        )}
        <Link href="/quotes/new">
          <Button>
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
