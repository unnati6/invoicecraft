
'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Invoice, Customer, CoverPageTemplate } from '@/types';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadInvoiceAsExcel, fetchCustomerById, fetchCoverPageTemplateById } from '@/lib/actions';
import { useState, useEffect } from 'react';
import { downloadPdfForDocument } from '@/lib/pdf-utils'; // Updated import for consistency
import { InvoicePreviewContent } from './invoice-preview-content';

interface InvoicePreviewDialogProps {
  invoice: Invoice;
  customer?: Customer;
  trigger: ReactNode;
}

export function InvoicePreviewDialog({ invoice: initialInvoice, customer: initialCustomer, trigger }: InvoicePreviewDialogProps) {
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [customer, setCustomer] = useState<Customer | undefined>(initialCustomer);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [coverPageTemplate, setCoverPageTemplate] = useState<CoverPageTemplate | undefined>(undefined);
  const [isLoadingCoverPage, setIsLoadingCoverPage] = useState(false);

  useEffect(() => {
    setInvoice(initialInvoice);
    setCustomer(initialCustomer);
  }, [initialInvoice, initialCustomer]);

  useEffect(() => {
    const loadCustomerDetails = async () => {
      if (invoice.customerId && !customer) {
        setIsLoadingCustomer(true);
        try {
          const fetchedCustomer = await fetchCustomerById(invoice.customerId);
          setCustomer(fetchedCustomer);
        } catch (error) {
          console.error("Failed to fetch customer for preview dialog:", error);
          toast({ title: "Error", description: "Could not load customer details for preview.", variant: "destructive" });
        } finally {
          setIsLoadingCustomer(false);
        }
      }
    };

    if (invoice.customerId && (!customer || customer.id !== invoice.customerId)) {
        loadCustomerDetails();
    }
  }, [invoice.customerId, customer, toast]);

  useEffect(() => {
    const loadCoverPageTemplate = async () => {
      if (invoice.msaCoverPageTemplateId) {
        setIsLoadingCoverPage(true);
        console.log(`[InvoicePreviewDialog] Attempting to fetch cover page template ID: ${invoice.msaCoverPageTemplateId}`);
        try {
          const cpt = await fetchCoverPageTemplateById(invoice.msaCoverPageTemplateId);
          setCoverPageTemplate(cpt);
          console.log(`[InvoicePreviewDialog] Fetched cover page template: ${cpt ? cpt.name : 'Not found'}`);
        } catch (error) {
          console.error("Failed to fetch cover page template for dialog:", error);
          setCoverPageTemplate(undefined);
        } finally {
          setIsLoadingCoverPage(false);
        }
      } else {
        setCoverPageTemplate(undefined);
        setIsLoadingCoverPage(false);
         console.log(`[InvoicePreviewDialog] No msaCoverPageTemplateId for invoice ${invoice.id}`);
      }
    };

    loadCoverPageTemplate();
  }, [invoice.id, invoice.msaCoverPageTemplateId]);


  const handleDownload = async (type: 'pdf' | 'excel') => {
    const setLoading = type === 'pdf' ? setIsDownloadingPdf : setIsDownloadingExcel;
    const fileNameBase = `Invoice_${invoice.invoiceNumber}`;

    setLoading(true);
    toast({ title: 'Processing...', description: `Generating ${type === 'pdf' ? 'PDF' : 'CSV (Excel Content)'}...` });
    
    try {
      if (type === 'pdf') {
        await downloadPdfForDocument(invoice, customer); // Use the utility
      } else if (type === 'excel') {
        const result = await downloadInvoiceAsExcel(invoice.id);
        if (result.success && result.fileData && result.mimeType && result.fileName) {
          const dataUri = `data:${result.mimeType};base64,${result.fileData}`;
          const link = document.createElement('a');
          link.href = dataUri;
          link.download = result.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast({ title: 'Success!', description: `${result.fileName} downloaded.` });
        } else {
          toast({ title: 'Error', description: result.message || `Failed to generate CSV.`, variant: 'destructive' });
        }
      }
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      toast({ title: 'Error', description: `An unexpected error occurred while generating the file.`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Invoice Preview: {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>Review the invoice details below. PDF download will generate a PDF from this preview. Excel download provides a CSV file.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6">
          {(isLoadingCustomer || isLoadingCoverPage) ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading preview data...</p>
            </div>
          ) : (
            <div id={`invoicePrintAreaDialog-${invoice.id}`}> {/* Unique ID for PDF generation target */}
              <InvoicePreviewContent document={invoice} customer={customer} coverPageTemplate={coverPageTemplate} />
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="sm:justify-start gap-2 pt-4">
          <Button onClick={() => handleDownload('pdf')} disabled={isDownloadingPdf || isLoadingCustomer || isLoadingCoverPage}>
            <Download className="mr-2 h-4 w-4" /> {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
          </Button>
          <Button onClick={() => handleDownload('excel')} variant="outline" disabled={isDownloadingExcel || isLoadingCustomer || isLoadingCoverPage}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> {isDownloadingExcel ? 'Downloading...' : 'Download Excel'}
          </Button>
          <Button variant="outline" onClick={() => {
             const printArea = document.getElementById(`invoicePrintAreaDialog-${invoice.id}`);
             if (printArea) {
                const printWindow = window.open('', '_blank');
                printWindow?.document.write('<html><head><title>Print Invoice</title>');
                const styles = Array.from(document.styleSheets)
                    .map(styleSheet => {
                        try {
                            return Array.from(styleSheet.cssRules)
                                .map(rule => rule.cssText)
                                .join('');
                        } catch (e) {
                            return '';
                        }
                    })
                    .join('');
                printWindow?.document.write(`<style>${styles}</style>`);
                printWindow?.document.write('</head><body>');
                printWindow?.document.write(printArea.innerHTML);
                printWindow?.document.write('</body></html>');
                printWindow?.document.close();
                printWindow?.print();
             }
          }}
          disabled={isLoadingCustomer || isLoadingCoverPage}
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="sm:ml-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

InvoicePreviewDialog.displayName = "InvoicePreviewDialog";
