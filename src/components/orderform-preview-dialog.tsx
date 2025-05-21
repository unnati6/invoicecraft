
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
import type { OrderForm, Customer } from '@/types';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadOrderFormAsExcel, fetchCustomerById } from '@/lib/actions';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OrderFormPreviewContent } from './orderform-preview-content'; // Changed

interface OrderFormPreviewDialogProps {
  orderForm: OrderForm; // Changed
  customer?: Customer;
  trigger: ReactNode;
}

export function OrderFormPreviewDialog({ orderForm: initialOrderForm, customer: initialCustomer, trigger }: OrderFormPreviewDialogProps) { // Changed
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>(initialOrderForm); // Changed
  const [customer, setCustomer] = useState<Customer | undefined>(initialCustomer);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  useEffect(() => {
    setOrderForm(initialOrderForm); // Changed
    setCustomer(initialCustomer);
  }, [initialOrderForm, initialCustomer]); // Changed

  useEffect(() => {
    const loadCustomerDetails = async () => {
      if (orderForm.customerId && !customer) { // Changed
        setIsLoadingCustomer(true);
        try {
          const fetchedCustomer = await fetchCustomerById(orderForm.customerId); // Changed
          setCustomer(fetchedCustomer);
        } catch (error) {
          console.error("Failed to fetch customer for preview dialog:", error);
          toast({ title: "Error", description: "Could not load customer details for preview.", variant: "destructive" });
        } finally {
          setIsLoadingCustomer(false);
        }
      }
    };
    if (orderForm.customerId && !customer) { // Changed
        loadCustomerDetails();
    }
  }, [orderForm.customerId, customer, toast]); // Changed

  const handleDownload = async (type: 'pdf' | 'excel') => {
    const setLoading = type === 'pdf' ? setIsDownloadingPdf : setIsDownloadingExcel;
    const fileNameBase = `OrderForm_${orderForm.orderFormNumber}`; // Changed

    setLoading(true);
    toast({ title: 'Processing...', description: `Generating ${type === 'pdf' ? 'PDF' : 'CSV (Excel Content)'}...` });
    
    try {
      if (type === 'pdf') {
        const input = document.getElementById('orderFormPrintAreaDialog');  // Changed
        if (!input) {
          toast({ title: 'Error', description: 'Preview content not found for PDF generation.', variant: 'destructive' });
          setLoading(false);
          return;
        }
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
        const result = await downloadOrderFormAsExcel(orderForm.id); // Changed
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
          <DialogTitle>Order Form Preview: {orderForm.orderFormNumber}</DialogTitle> {/* Changed */}
          <DialogDescription>Review the order form details below. PDF download will generate a PDF from this preview. Excel download provides a CSV file.</DialogDescription> {/* Changed */}
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6">
           {isLoadingCustomer ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading customer details...</p>
            </div>
           ) : (
           <div id="orderFormPrintAreaDialog">  {/* Changed */}
            <OrderFormPreviewContent document={orderForm} customer={customer} /> {/* Changed */}
          </div>
          )}
        </ScrollArea>
        <DialogFooter className="sm:justify-start gap-2 pt-4">
          <Button onClick={() => handleDownload('pdf')} disabled={isDownloadingPdf || isLoadingCustomer}>
            <Download className="mr-2 h-4 w-4" /> {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
          </Button>
          <Button onClick={() => handleDownload('excel')} variant="outline" disabled={isDownloadingExcel || isLoadingCustomer}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> {isDownloadingExcel ? 'Downloading...' : 'Download Excel'}
          </Button>
          <Button variant="outline" onClick={() => {
             const printArea = document.getElementById('orderFormPrintAreaDialog'); // Changed
             if (printArea) {
                const printWindow = window.open('', '_blank');
                printWindow?.document.write('<html><head><title>Print Order Form</title>'); // Changed
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
          disabled={isLoadingCustomer}
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

OrderFormPreviewDialog.displayName = "OrderFormPreviewDialog";
