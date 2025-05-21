
'use client';

import React from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Invoice, OrderForm, Customer } from '@/types';
import { InvoicePreviewContent } from '@/components/invoice-preview-content';
import { OrderFormPreviewContent } from '@/components/orderform-preview-content';
import { CoverPageContent } from '@/components/cover-page-content';
import { toast } from '@/hooks/use-toast';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function renderAndCapture(
  element: React.ReactElement,
  hiddenContainerId: string
): Promise<HTMLCanvasElement> {
  const hiddenContainer = document.getElementById(hiddenContainerId);
  if (!hiddenContainer) {
    throw new Error(`Hidden container ${hiddenContainerId} not found`);
  }

  const root = ReactDOM.createRoot(hiddenContainer);
  await new Promise<void>((resolveRender) => {
    root.render(element);
    setTimeout(resolveRender, 300); 
  });

  const canvas = await html2canvas(hiddenContainer, {
    scale: 2,
    useCORS: true,
    logging: false,
    width: hiddenContainer.scrollWidth,
    height: hiddenContainer.scrollHeight,
    windowWidth: hiddenContainer.scrollWidth,
    windowHeight: hiddenContainer.scrollHeight,
  });

  root.unmount();
  return canvas;
}

function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, isFirstPageForThisCanvasElement: boolean): void {
  const imgData = canvas.toDataURL('image/png');
  const imgProps = pdf.getImageProperties(imgData);

  const pdfPageWidth = pdf.internal.pageSize.getWidth();
  const pdfPageHeight = pdf.internal.pageSize.getHeight();

  const margin = 40; 
  const availableWidth = pdfPageWidth - (2 * margin);
  const availableHeight = pdfPageHeight - (2 * margin);

  let newImgWidth = imgProps.width / 2; 
  let newImgHeight = imgProps.height / 2;

  if (newImgWidth > availableWidth) {
    newImgHeight = (newImgHeight * availableWidth) / newImgWidth;
    newImgWidth = availableWidth;
  }
  
  let yPosition = margin;
  let remainingImgHeight = newImgHeight;
  let currentImgPartY = 0;

  let isFirstSegmentOfCanvas = true;

  while (remainingImgHeight > 0) {
      if (!isFirstPageForThisCanvasElement && !isFirstSegmentOfCanvas) { 
          pdf.addPage();
          yPosition = margin;
      } else if (isFirstPageForThisCanvasElement && !isFirstSegmentOfCanvas){
          pdf.addPage();
          yPosition = margin;
      } else if (!isFirstPageForThisCanvasElement && isFirstSegmentOfCanvas) {
          // This means it's the start of a new document (e.g. MSA or main content)
          // but not the very first page of the entire PDF.
          // It should start on a new page.
          pdf.addPage();
          yPosition = margin;
      }


      const pageRemainingHeight = availableHeight - (isFirstSegmentOfCanvas && isFirstPageForThisCanvasElement ? 0 : (yPosition - margin));
      const heightToDrawOnThisPdfPage = Math.min(remainingImgHeight, pageRemainingHeight > 0 ? pageRemainingHeight : availableHeight);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgProps.width;
      tempCanvas.height = heightToDrawOnThisPdfPage * 2;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
          tempCtx.drawImage(
              canvas, 
              0, 
              currentImgPartY * 2, 
              imgProps.width, 
              heightToDrawOnThisPdfPage * 2, 
              0, 
              0, 
              imgProps.width, 
              heightToDrawOnThisPdfPage * 2 
          );
          const partImgData = tempCanvas.toDataURL('image/png');
          pdf.addImage(partImgData, 'PNG', margin, yPosition, newImgWidth, heightToDrawOnThisPdfPage);
      }
      
      remainingImgHeight -= heightToDrawOnThisPdfPage;
      currentImgPartY += heightToDrawOnThisPdfPage;
      yPosition += heightToDrawOnThisPdfPage; 
      
      isFirstSegmentOfCanvas = false; // Subsequent parts of this canvas are not the first segment
  }
}


export async function downloadPdfForDocument(doc: Invoice | OrderForm, customer?: Customer): Promise<void> {
  const hiddenContainerId = `pdf-render-area-single-${doc.id}-${Math.random().toString(36).substring(7)}`;
  const hiddenContainer = document.createElement('div');
  hiddenContainer.id = hiddenContainerId;
  hiddenContainer.style.position = 'absolute';
  hiddenContainer.style.left = '-9999px';
  hiddenContainer.style.top = '-9999px';
  hiddenContainer.style.width = '800px'; 
  hiddenContainer.style.background = 'white'; 
  document.body.appendChild(hiddenContainer);

  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  let isFirstElementBeingAddedToPdf = true;

  try {
    if (doc.msaContent && doc.msaIncludesCoverPage) {
      const coverPageElement = React.createElement(CoverPageContent, { document: doc as any, customer: customer as any });
      const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
      addCanvasToPdf(pdf, coverCanvas, isFirstElementBeingAddedToPdf);
      isFirstElementBeingAddedToPdf = false;
    }

    if (doc.msaContent) {
      const MsaContentWrapper = () => (
        <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none"
             dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
      );
      const msaElement = React.createElement(MsaContentWrapper);
      const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
      addCanvasToPdf(pdf, msaCanvas, isFirstElementBeingAddedToPdf);
      isFirstElementBeingAddedToPdf = false;
    }
    
    const isInvoice = 'invoiceNumber' in doc;
    const PreviewComponent = isInvoice ? InvoicePreviewContent : OrderFormPreviewContent;
    const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
    const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
    addCanvasToPdf(pdf, mainDocCanvas, isFirstElementBeingAddedToPdf);
    
    const docNumber = isInvoice ? doc.invoiceNumber : doc.orderFormNumber;
    const docType = isInvoice ? 'Invoice' : 'OrderForm';
    pdf.save(`${docType}_${docNumber}.pdf`);
    toast({ title: 'Success', description: `${docType} ${docNumber} PDF downloaded.` });

  } catch (error) {
    console.error(`Error generating PDF:`, error);
    toast({ title: 'Error', description: `Failed to generate PDF. ${error instanceof Error ? error.message : ''}`, variant: 'destructive' });
  } finally {
    const containerToRemove = document.getElementById(hiddenContainerId);
    if (containerToRemove) {
        document.body.removeChild(containerToRemove);
    }
  }
}


export async function downloadMultipleDocumentsAsSinglePdf(
  docs: (Invoice | OrderForm)[],
  customers: (Customer | undefined)[],
  combinedFileName: string
): Promise<void> {
  if (docs.length === 0) {
    toast({ title: "No documents", description: "No documents selected for combined PDF.", variant: "destructive" });
    return;
  }

  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  let isFirstElementBeingAddedToPdf = true;

  const hiddenContainerId = `pdf-render-area-combined-${Math.random().toString(36).substring(7)}`;
  const hiddenContainer = document.createElement('div');
  hiddenContainer.id = hiddenContainerId;
  hiddenContainer.style.position = 'absolute';
  hiddenContainer.style.left = '-9999px';
  hiddenContainer.style.top = '-9999px';
  hiddenContainer.style.width = '800px'; 
  hiddenContainer.style.background = 'white';
  document.body.appendChild(hiddenContainer);
  
  toast({ title: 'Processing...', description: `Generating combined PDF for ${docs.length} documents... This may take a moment.` });

  try {
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const customer = customers[i];
      const isInvoice = 'invoiceNumber' in doc;
      const PreviewComponent = isInvoice ? InvoicePreviewContent : OrderFormPreviewContent;
      const docType = isInvoice ? 'Invoice' : 'OrderForm';
      const docNumber = isInvoice ? (doc as Invoice).invoiceNumber : (doc as OrderForm).orderFormNumber;
      
      if (doc.msaContent && doc.msaIncludesCoverPage) {
        const coverPageElement = React.createElement(CoverPageContent, { document: doc as any, customer: customer as any });
        const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
        addCanvasToPdf(pdf, coverCanvas, isFirstElementBeingAddedToPdf);
        isFirstElementBeingAddedToPdf = false; 
      }

      if (doc.msaContent) {
        const MsaContentWrapper = () => (
          <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none"
               dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
        );
        const msaElement = React.createElement(MsaContentWrapper);
        const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
        addCanvasToPdf(pdf, msaCanvas, isFirstElementBeingAddedToPdf);
        isFirstElementBeingAddedToPdf = false;
      }
      
      const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
      const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
      addCanvasToPdf(pdf, mainDocCanvas, isFirstElementBeingAddedToPdf);
      isFirstElementBeingAddedToPdf = false;

      toast({ title: 'Progress', description: `Added ${docType} ${docNumber} to PDF (${i + 1}/${docs.length}).` });
      await delay(200); 
    }

    pdf.save(combinedFileName);
    toast({ title: 'Success!', description: `${combinedFileName} downloaded.` });

  } catch (error) {
    console.error(`Error generating combined PDF:`, error);
    toast({ title: 'Error', description: `Failed to generate combined PDF. ${error instanceof Error ? error.message : ''}`, variant: 'destructive' });
  } finally {
    const containerToRemove = document.getElementById(hiddenContainerId);
    if (containerToRemove) {
        document.body.removeChild(containerToRemove);
    }
  }
}
