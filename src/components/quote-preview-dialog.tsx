
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
import { format } from 'date-fns';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadQuoteAsExcel } from '@/lib/actions';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
        const input = document.getElementById('quotePrintArea');
        if (!input) {
          toast({ title: 'Error', description: 'Preview content not found for PDF generation.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
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
  
  const customerToDisplay = customer || { name: quote.customerName, email: 'N/A', address: undefined };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Quote Preview: {quote.quoteNumber}</DialogTitle>
          <DialogDescription>Review the quote details below. PDF download will generate a PDF from this preview. Excel download provides a CSV file.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6">
          <div id="quotePrintArea" className="p-6 bg-card rounded-lg shadow-sm border print-area">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary">QUOTE</h1>
                <p className="text-muted-foreground">Quote #: {quote.quoteNumber}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold">InvoiceCraft Inc.</h2>
                <p className="text-sm text-muted-foreground">123 App Street, Suite 4B</p>
                <p className="text-sm text-muted-foreground">DevCity, ST 54321</p>
                <p className="text-sm text-muted-foreground">contact@invoicecraft.com</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-1 text-muted-foreground">QUOTE FOR:</h3>
                <p className="font-medium">{customerToDisplay.name}</p>
                {customerToDisplay.address && (
                  <>
                    <p className="text-sm">{customerToDisplay.address.street}</p>
                    <p className="text-sm">{customerToDisplay.address.city}, {customerToDisplay.address.state} {customerToDisplay.address.zip}</p>
                    <p className="text-sm">{customerToDisplay.address.country}</p>
                  </>
                )}
                <p className="text-sm">{customerToDisplay.email}</p>
              </div>
              <div className="text-left md:text-right">
                <p><span className="font-semibold text-muted-foreground">Issue Date:</span> {format(new Date(quote.issueDate), 'PPP')}</p>
                <p><span className="font-semibold text-muted-foreground">Expiry Date:</span> {format(new Date(quote.expiryDate), 'PPP')}</p>
                <p className="mt-2"><span className="font-semibold text-muted-foreground">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${quote.status === 'Accepted' ? 'bg-green-100 text-green-700' : quote.status === 'Declined' || quote.status === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{quote.status}</span></p>
              </div>
            </div>

            <div className="mb-8">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left font-semibold">Description</th>
                    <th className="p-2 text-right font-semibold">Quantity</th>
                    <th className="p-2 text-right font-semibold">Rate</th>
                    <th className="p-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-right">{item.quantity.toFixed(2)}</td>
                      <td className="p-2 text-right">${item.rate.toFixed(2)}</td>
                      <td className="p-2 text-right">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-8">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${quote.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({quote.taxRate}%):</span>
                  <span>${quote.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-lg">${quote.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {quote.termsAndConditions && (
              <div className="mb-8">
                <h3 className="font-semibold mb-2 text-muted-foreground">Terms & Conditions:</h3>
                <p className="text-sm whitespace-pre-wrap">{quote.termsAndConditions}</p>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground mt-8">
              <p>Thank you for considering our services!</p>
            </div>
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
             const printArea = document.getElementById('quotePrintArea');
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
