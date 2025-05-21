
'use client'; 

import React from 'react'; 
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Invoice, OrderForm, Customer } from '@/types';
import { InvoicePreviewContent } from '@/components/invoice-preview-content';
import { OrderFormPreviewContent } from '@/components/orderform-preview-content'; // Changed from QuotePreviewContent
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
    root.render(
      React.createElement(React.StrictMode, null, element)
    );
    // Allow time for rendering, especially if there are images or complex layouts
    setTimeout(resolveRender, 300); // Increased delay slightly
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
  
  root.unmount(); // Clean up React root
  return canvas;
}

function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, isFirstPage: boolean): void {
  const imgData = canvas.toDataURL('image/png');
  const imgProps = pdf.getImageProperties(imgData);
  
  const pdfPageWidth = pdf.internal.pageSize.getWidth();
  const pdfPageHeight = pdf.internal.pageSize.getHeight();
  
  const margin = 40; // pt
  const availableWidth = pdfPageWidth - (2 * margin);
  const availableHeight = pdfPageHeight - (2 * margin);

  let newImgWidth = imgProps.width / 2; // Assuming scale 2 from html2canvas
  let newImgHeight = imgProps.height / 2;

  if (newImgWidth > availableWidth) {
    newImgHeight = (newImgHeight * availableWidth) / newImgWidth;
    newImgWidth = availableWidth;
  }
  if (newImgHeight > availableHeight) { // Scale to fit height if it's still too tall
     // No change to width if height is the constraint
  }
  
  let yPosition = margin;
  let remainingImgHeight = newImgHeight;
  let currentImgPartY = 0;

  while (remainingImgHeight > 0) {
      if (!isFirstPage || yPosition !== margin) { // Add new page if not the first page or if content already added to first page
          pdf.addPage();
          yPosition = margin; // Reset yPosition for new page
      }
      
      const pageRemainingHeight = availableHeight - (yPosition - margin); // Height available on current PDF page
      const heightToDraw = Math.min(remainingImgHeight, pageRemainingHeight);

      // Create a temporary canvas to draw part of the image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgProps.width; // Use original canvas dimensions for slicing
      tempCanvas.height = (heightToDraw * 2); // Multiply by scale for source slicing
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
          tempCtx.drawImage(
              canvas, // source canvas
              0, // sx
              currentImgPartY * 2, // sy (multiply by scale)
              imgProps.width, // sWidth
              heightToDraw * 2, // sHeight (multiply by scale)
              0, // dx
              0, // dy
              imgProps.width, // dWidth
              heightToDraw * 2 // dHeight (multiply by scale)
          );
          const partImgData = tempCanvas.toDataURL('image/png');
          pdf.addImage(partImgData, 'PNG', margin, yPosition, newImgWidth, heightToDraw);
      }
      
      remainingImgHeight -= heightToDraw;
      currentImgPartY += heightToDraw;
      yPosition += heightToDraw + 10; // Add some spacing or prepare for next element
      if (remainingImgHeight > 0) isFirstPage = false; // Ensure next part is on a new page if it starts a new loop
  }
}


export async function downloadPdfForDocument(doc: Invoice | OrderForm, customer?: Customer): Promise<void> {
  const hiddenContainerId = `pdf-render-area-single-${doc.id}-${Math.random().toString(36).substring(7)}`;
  const hiddenContainer = document.createElement('div');
  hiddenContainer.id = hiddenContainerId;
  hiddenContainer.style.position = 'absolute'; // Changed from fixed to avoid viewport limits during capture
  hiddenContainer.style.left = '-9999px';
  hiddenContainer.style.top = '-9999px';
  hiddenContainer.style.width = '800px'; // A4-like width
  hiddenContainer.style.background = 'white'; 
  document.body.appendChild(hiddenContainer);

  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  let isFirstPdfPage = true;

  try {
    // 1. Render Cover Page if applicable
    if (doc.msaContent && doc.msaIncludesCoverPage) {
      const coverPageElement = React.createElement(CoverPageContent, { document: doc as any, customer: customer as any });
      const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
      addCanvasToPdf(pdf, coverCanvas, isFirstPdfPage);
      isFirstPdfPage = false;
    }

    // 2. Render MSA Content if applicable
    if (doc.msaContent) {
      const MsaContentWrapper = () => (
        <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none" 
             dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
      );
      const msaElement = React.createElement(MsaContentWrapper);
      const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
      addCanvasToPdf(pdf, msaCanvas, isFirstPdfPage);
      isFirstPdfPage = false;
    }
    
    // 3. Render Main Document Content
    const isInvoice = 'invoiceNumber' in doc;
    const PreviewComponent = isInvoice ? InvoicePreviewContent : OrderFormPreviewContent;
    const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
    const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
    addCanvasToPdf(pdf, mainDocCanvas, isFirstPdfPage);
    
    const docNumber = isInvoice ? doc.invoiceNumber : doc.orderFormNumber;
    const docType = isInvoice ? 'Invoice' : 'OrderForm';
    pdf.save(`${docType}_${docNumber}.pdf`);
    toast({ title: 'Success', description: `${docType} ${docNumber} PDF downloaded.` });

  } catch (error) {
    console.error(`Error generating PDF:`, error);
    toast({ title: 'Error', description: `Failed to generate PDF.`, variant: 'destructive' });
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
  let isFirstPdfPageOverall = true;

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
      
      // 1. Render Cover Page if applicable
      if (doc.msaContent && doc.msaIncludesCoverPage) {
        const coverPageElement = React.createElement(CoverPageContent, { document: doc as any, customer: customer as any });
        const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
        addCanvasToPdf(pdf, coverCanvas, isFirstPdfPageOverall);
        isFirstPdfPageOverall = false;
      }

      // 2. Render MSA Content if applicable
      if (doc.msaContent) {
        const MsaContentWrapper = () => (
          <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none" 
               dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
        );
        const msaElement = React.createElement(MsaContentWrapper);
        const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
        addCanvasToPdf(pdf, msaCanvas, isFirstPdfPageOverall);
        isFirstPdfPageOverall = false;
      }
      
      // 3. Render Main Document Content
      const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
      const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
      addCanvasToPdf(pdf, mainDocCanvas, isFirstPdfPageOverall);
      isFirstPdfPageOverall = false; // After the first document's main content, subsequent docs start on a new page

      toast({ title: 'Progress', description: `Added ${docType} ${docNumber} to PDF (${i + 1}/${docs.length}).` });
      await delay(100); 
    }

    pdf.save(combinedFileName);
    toast({ title: 'Success!', description: `${combinedFileName} downloaded.` });

  } catch (error) {
    console.error(`Error generating combined PDF:`, error);
    toast({ title: 'Error', description: `Failed to generate combined PDF. Please try downloading individually.`, variant: 'destructive' });
  } finally {
    const containerToRemove = document.getElementById(hiddenContainerId);
    if (containerToRemove) {
        document.body.removeChild(containerToRemove);
    }
  }
}
