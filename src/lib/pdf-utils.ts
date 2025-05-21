
'use client'; 

import React from 'react'; 
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Invoice, Quote, Customer } from '@/types';
import { InvoicePreviewContent } from '@/components/invoice-preview-content';
import { QuotePreviewContent } from '@/components/quote-preview-content';
import { toast } from '@/hooks/use-toast'; 

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function downloadPdfForDocument(doc: Invoice | Quote, customer?: Customer): Promise<void> {
  const hiddenContainerId = `pdf-render-area-temp-${doc.id}-${Math.random().toString(36).substring(2,7)}`;
  const hiddenContainer = document.createElement('div');
  hiddenContainer.id = hiddenContainerId;
  hiddenContainer.style.position = 'fixed';
  hiddenContainer.style.left = '-9999px';
  hiddenContainer.style.top = '-9999px';
  hiddenContainer.style.width = '800px'; 
  hiddenContainer.style.background = 'white'; 
  document.body.appendChild(hiddenContainer);

  const root = ReactDOM.createRoot(hiddenContainer);
  const isInvoice = 'invoiceNumber' in doc;
  const PreviewComponent = isInvoice ? InvoicePreviewContent : QuotePreviewContent;
  const docNumber = isInvoice ? doc.invoiceNumber : doc.quoteNumber;
  const docType = isInvoice ? 'Invoice' : 'Quote';
  
  await new Promise<void>((resolveRender) => {
    root.render(
      React.createElement(
        React.StrictMode, 
        null,
        React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any)
      )
    );
    setTimeout(resolveRender, 100); 
  });

  try {
    const canvas = await html2canvas(hiddenContainer, { 
      scale: 2, 
      useCORS: true, 
      logging: false, 
    });
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = canvas.width;
    const pdfHeight = canvas.height;

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'pt', 
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${docType}_${docNumber}.pdf`);
    toast({ title: 'Success', description: `${docType} ${docNumber} PDF downloaded.` });

  } catch (error) {
    console.error(`Error generating PDF for ${docType} ${docNumber}:`, error);
    toast({ title: 'Error', description: `Failed to generate PDF for ${docType} ${docNumber}.`, variant: 'destructive' });
  } finally {
    root.unmount();
    if (document.getElementById(hiddenContainerId)) {
        document.body.removeChild(document.getElementById(hiddenContainerId)!);
    }
  }
}


export async function downloadMultipleDocumentsAsSinglePdf(
  docs: (Invoice | Quote)[],
  customers: (Customer | undefined)[], 
  combinedFileName: string
): Promise<void> {
  if (docs.length === 0) {
    toast({ title: "No documents", description: "No documents selected for combined PDF.", variant: "destructive" });
    return;
  }

  const pdf = new jsPDF({
    orientation: 'p', 
    unit: 'pt',
    format: 'a4' // Use a standard format for consistency
  });
  let isFirstPage = true;

  const hiddenContainerId = `pdf-render-area-combined-temp-${Math.random().toString(36).substring(2,7)}`;
  const hiddenContainer = document.createElement('div');
  hiddenContainer.id = hiddenContainerId;
  hiddenContainer.style.position = 'fixed';
  hiddenContainer.style.left = '-9999px'; 
  hiddenContainer.style.top = '-9999px';
  hiddenContainer.style.width = '800px'; 
  hiddenContainer.style.background = 'white';
  document.body.appendChild(hiddenContainer);
  
  const root = ReactDOM.createRoot(hiddenContainer);

  toast({ title: 'Processing...', description: `Generating combined PDF for ${docs.length} documents... This may take a moment.` });

  try {
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const customer = customers[i]; 
      const isInvoice = 'invoiceNumber' in doc;
      const PreviewComponent = isInvoice ? InvoicePreviewContent : QuotePreviewContent;
      const docType = isInvoice ? 'Invoice' : 'Quote';
      const docNumber = isInvoice ? (doc as Invoice).invoiceNumber : (doc as Quote).quoteNumber;


      await new Promise<void>((resolveRender) => {
        root.render(
          React.createElement(
            React.StrictMode,
            null,
            React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any)
          )
        );
        setTimeout(resolveRender, 150); 
      });

      const canvas = await html2canvas(hiddenContainer, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 40; // 20pt margin on each side/top/bottom
      const availableWidth = pdfPageWidth - (2 * margin);
      const availableHeight = pdfPageHeight - (2 * margin);

      let newImgWidth = imgProps.width;
      let newImgHeight = imgProps.height;
      
      // Scale to fit width
      if (newImgWidth > availableWidth) {
        newImgHeight = (newImgHeight * availableWidth) / newImgWidth;
        newImgWidth = availableWidth;
      }
      // Scale to fit height (if still too tall)
      if (newImgHeight > availableHeight) {
        newImgWidth = (newImgWidth * availableHeight) / newImgHeight;
        newImgHeight = availableHeight;
      }
      
      if (!isFirstPage) {
        pdf.addPage();
      } else {
        isFirstPage = false;
      }

      const xOffset = (pdfPageWidth - newImgWidth) / 2;
      const yOffset = (pdfPageHeight - newImgHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, newImgWidth, newImgHeight);
      toast({ title: 'Progress', description: `Added ${docType} ${docNumber} to PDF (${i + 1}/${docs.length}).` });
       await delay(100); // Small delay to allow UI to update toast
    }

    pdf.save(combinedFileName);
    toast({ title: 'Success!', description: `${combinedFileName} downloaded.` });

  } catch (error) {
    console.error(`Error generating combined PDF:`, error);
    toast({ title: 'Error', description: `Failed to generate combined PDF. Please try downloading individually.`, variant: 'destructive' });
  } finally {
    root.unmount();
    if (document.getElementById(hiddenContainerId)) {
        document.body.removeChild(document.getElementById(hiddenContainerId)!);
    }
  }
}

