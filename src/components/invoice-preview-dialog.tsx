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
import type { Invoice, Customer } from '@/types';
import { format } from 'date-fns';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadInvoiceAsPDF, downloadInvoiceAsExcel } from '@/lib/actions'; // Assuming actions.ts exists
import { useState } from 'react';

interface InvoicePreviewDialogProps {
  invoice: Invoice;
  customer?: Customer; // Optional, if you fetch customer details separately
  trigger: ReactNode;
}

export function InvoicePreviewDialog({ invoice, customer, trigger }: InvoicePreviewDialogProps) {
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    toast({ title: 'Processing...', description: 'Generating PDF...' });
    // Simulate API call
    const result = await downloadInvoiceAsPDF(invoice.id);
    if (result.success) {
      toast({ title: 'Success!', description: result.message });
      // In a real app, you would trigger a download here, e.g. window.open(result.url) or similar.
      // For mock, we can just log.
      console.log(`Mock Download: ${result.fileName}`);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsDownloadingPdf(false);
  };

  const handleDownloadExcel = async () => {
    setIsDownloadingExcel(true);
    toast({ title: 'Processing...', description: 'Generating Excel...' });
    const result = await downloadInvoiceAsExcel(invoice.id);
    if (result.success) {
      toast({ title: 'Success!', description: result.message });
      console.log(`Mock Download: ${result.fileName}`);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsDownloadingExcel(false);
  };
  
  const customerToDisplay = customer || { name: invoice.customerName, email: 'N/A', address: undefined };


  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Invoice Preview: {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>Review the invoice details below.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6"> {/* Added p-1 pr-6 for scrollbar spacing */}
          <div className="p-6 bg-card rounded-lg shadow-sm border print-area">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
                <p className="text-muted-foreground">Invoice #: {invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                {/* Your Company Details Here - Placeholder */}
                <h2 className="text-xl font-semibold">InvoiceCraft Inc.</h2>
                <p className="text-sm text-muted-foreground">123 App Street, Suite 4B</p>
                <p className="text-sm text-muted-foreground">DevCity, ST 54321</p>
                <p className="text-sm text-muted-foreground">contact@invoicecraft.com</p>
              </div>
            </div>

            {/* Bill To and Dates */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-1 text-muted-foreground">BILL TO:</h3>
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
                <p><span className="font-semibold text-muted-foreground">Issue Date:</span> {format(new Date(invoice.issueDate), 'PPP')}</p>
                <p><span className="font-semibold text-muted-foreground">Due Date:</span> {format(new Date(invoice.dueDate), 'PPP')}</p>
                <p className="mt-2"><span className="font-semibold text-muted-foreground">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : invoice.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{invoice.status}</span></p>
              </div>
            </div>

            {/* Items Table */}
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
                  {invoice.items.map((item) => (
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

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span>
                  <span>${invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-lg">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            {invoice.termsAndConditions && (
              <div className="mb-8">
                <h3 className="font-semibold mb-2 text-muted-foreground">Terms & Conditions:</h3>
                <p className="text-sm whitespace-pre-wrap">{invoice.termsAndConditions}</p>
              </div>
            )}

            {/* Footer Note */}
            <div className="text-center text-sm text-muted-foreground mt-8">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-start gap-2 pt-4">
          <Button onClick={handleDownloadPDF} disabled={isDownloadingPdf}>
            <Download className="mr-2 h-4 w-4" /> {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
          </Button>
          <Button onClick={handleDownloadExcel} variant="outline" disabled={isDownloadingExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> {isDownloadingExcel ? 'Downloading...' : 'Download Excel'}
          </Button>
          <Button variant="outline" onClick={() => window.print()}> {/* Basic print */}
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

