
'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Added
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
import { Download, Printer, FileSpreadsheet, FileSignature } from 'lucide-react'; // Added FileSignature
import { useToast } from '@/hooks/use-toast';
import { downloadInvoiceAsExcel, fetchCustomerById, fetchCoverPageTemplateById } from '@/lib/actions';
import { useState, useEffect } from 'react';
import { downloadPdfForDocument } from '@/lib/pdf-utils';
import { InvoicePreviewContent } from './invoice-preview-content';

interface InvoicePreviewDialogProps {
  invoice: Invoice;
  customer?: Customer;
  trigger: ReactNode;
}

export function InvoicePreviewDialog({ invoice: initialInvoice, customer: initialCustomer, trigger }: InvoicePreviewDialogProps) {
  const router = useRouter(); // Added
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
      if (invoice.customerId && (!customer || customer.id !== invoice.customerId)) {
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
      } else if (!invoice.customerId) {
        setCustomer(undefined); // Clear customer if invoice has no customerId
        setIsLoadingCustomer(false);
      } else {
        setIsLoadingCustomer(false); // Already have the correct customer or no customerId
      }
    };
    loadCustomerDetails();
  }, [invoice.customerId, customer, toast]);

  useEffect(() => {
    const loadCoverPageTemplate = async () => {
      if (invoice.msaContent && invoice.msaCoverPageTemplateId) {
        setIsLoadingCoverPage(true);
        console.log(`[InvoicePreviewDialog] Attempting to fetch cover page template ID: ${invoice.msaCoverPageTemplateId} for invoice ${invoice.id}`);
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
        console.log(`[InvoicePreviewDialog] No msaCoverPageTemplateId or no msaContent for invoice ${invoice.id}. ID: ${invoice.msaCoverPageTemplateId}, HasMSA: ${!!invoice.msaContent}`);
        setCoverPageTemplate(undefined);
        setIsLoadingCoverPage(false);
      }
    };

    loadCoverPageTemplate();
  }, [invoice.id, invoice.msaContent, invoice.msaCoverPageTemplateId]);


  const handleDownload = async (type: 'pdf' | 'excel') => {
    const setLoading = type === 'pdf' ? setIsDownloadingPdf : setIsDownloadingExcel;
    const fileNameBase = `Invoice_${invoice.invoiceNumber}`;

    setLoading(true);
    toast({ title: 'Processing...', description: `Generating ${type === 'pdf' ? 'PDF' : 'CSV (Excel Content)'}...` });
    
    try {
      if (type === 'pdf') {
        await downloadPdfForDocument(invoice, customer);
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

  const handleFinalizeForSignature = () => {
    if (invoice.id) {
      router.push(`/e-signature/configure/invoice/${invoice.id}`);
    } else {
      toast({ title: "Error", description: "Invoice ID is missing, cannot proceed.", variant: "destructive" });
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
            <div id={`invoicePrintAreaDialog-${invoice.id}`}>
              <InvoicePreviewContent document={invoice} customer={customer} coverPageTemplate={coverPageTemplate} />
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="sm:justify-start gap-2 pt-4">
          <Button 
            onClick={handleFinalizeForSignature} 
            disabled={isDownloadingPdf || isDownloadingExcel || isLoadingCustomer || isLoadingCoverPage || invoice.status === 'Draft'}
            className="bg-primary hover:bg-primary/90"
          >
            <FileSignature className="mr-2 h-4 w-4" /> Finalize for Signature
          </Button>
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
