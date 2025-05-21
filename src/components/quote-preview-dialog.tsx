
'use client';

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
import type { Quote, Customer } from '@/types';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadQuoteAsExcel } from '@/lib/actions';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QuotePreviewContent } from './quote-preview-content'; // Import the content component

interface QuotePreviewDialogProps {
  quote: Quote;
  customer?: Customer;
  trigger: ReactNode;
}

export function QuotePreviewDialog({ quote, customer, trigger }: QuotePreviewDialogProps) {
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  const handleDownload = async (type: 'pdf' | 'excel') => {
    const setLoading = type === 'pdf' ? setIsDownloadingPdf : setIsDownloadingExcel;
    const fileNameBase = `Quote_${quote.quoteNumber}`;

    setLoading(true);
    toast({ title: 'Processing...', description: `Generating ${type === 'pdf' ? 'PDF' : 'CSV (Excel Content)'}...` });
    
    try {
      if (type === 'pdf') {
        const input = document.getElementById('quotePrintAreaDialog'); // Use a unique ID for the dialog's print area
        if (!input) {
          toast({ title: 'Error', description: 'Preview content not found for PDF generation.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        // Ensure content is fully rendered
        await new Promise(resolve => setTimeout(resolve, 200));

        const canvas = await html2canvas(input, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        
        const pdfWidth = canvas.width;
        const pdfHeight = canvas.height;
        
        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
          unit: 'pt',
          format: [pdfWidth, pdfHeight]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileNameBase}.pdf`);
        toast({ title: 'Success!', description: `${fileNameBase}.pdf downloaded.` });

      } else if (type === 'excel') {
        const result = await downloadQuoteAsExcel(quote.id);
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
  
  // Prepare customer data for the QuotePreviewContent component
  const customerToDisplay = customer || { 
    name: quote.customerName || 'N/A', 
    email: 'N/A', 
    address: undefined 
  };
   if (customer) { // Ensure full customer details are used if provided
    customerToDisplay.name = customer.name;
    customerToDisplay.email = customer.email;
    customerToDisplay.address = customer.address;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Quote Preview: {quote.quoteNumber}</DialogTitle>
          <DialogDescription>Review the quote details below. PDF download will generate a PDF from this preview. Excel download provides a CSV file.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6">
          {/* Use the QuotePreviewContent component here */}
           <div id="quotePrintAreaDialog"> {/* Unique ID for html2canvas targeting within dialog */}
            <QuotePreviewContent document={quote} customer={customerToDisplay} />
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-start gap-2 pt-4">
          <Button onClick={() => handleDownload('pdf')} disabled={isDownloadingPdf}>
            <Download className="mr-2 h-4 w-4" /> {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
          </Button>
          <Button onClick={() => handleDownload('excel')} variant="outline" disabled={isDownloadingExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> {isDownloadingExcel ? 'Downloading...' : 'Download Excel'}
          </Button>
          <Button variant="outline" onClick={() => {
             const printArea = document.getElementById('quotePrintAreaDialog');
             if (printArea) {
                const printWindow = window.open('', '_blank');
                printWindow?.document.write('<html><head><title>Print Quote</title>');
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
          }}>
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

QuotePreviewDialog.displayName = "QuotePreviewDialog";
