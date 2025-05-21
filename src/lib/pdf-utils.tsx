
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
    // StrictMode can sometimes cause double rendering or other subtle issues with external libraries
    // For this specific utility that's manually creating and unmounting roots for off-screen rendering,
    // we can try rendering directly without StrictMode to see if it simplifies interactions.
    root.render(element);
    // Allow time for rendering, especially if there are images or complex layouts
    setTimeout(resolveRender, 300); // Adjust delay if needed
  });

  const canvas = await html2canvas(hiddenContainer, {
    scale: 2, // Higher scale for better PDF quality
    useCORS: true, // Important if images are from external sources
    logging: false, // Suppress html2canvas console logs
    width: hiddenContainer.scrollWidth, // Explicitly set width
    height: hiddenContainer.scrollHeight, // Explicitly set height
    windowWidth: hiddenContainer.scrollWidth, // Match window width to content width
    windowHeight: hiddenContainer.scrollHeight, // Match window height to content height
  });

  root.unmount(); // Clean up React root
  return canvas;
}

function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, isFirstPage: boolean): void {
  const imgData = canvas.toDataURL('image/png');
  const imgProps = pdf.getImageProperties(imgData);

  const pdfPageWidth = pdf.internal.pageSize.getWidth();
  const pdfPageHeight = pdf.internal.pageSize.getHeight();

  const margin = 40; // pt, adjust as needed
  const availableWidth = pdfPageWidth - (2 * margin);
  const availableHeight = pdfPageHeight - (2 * margin);

  // Scale image to fit available width while maintaining aspect ratio
  let newImgWidth = imgProps.width / 2; // Assuming scale 2 from html2canvas
  let newImgHeight = imgProps.height / 2;

  if (newImgWidth > availableWidth) {
    newImgHeight = (newImgHeight * availableWidth) / newImgWidth;
    newImgWidth = availableWidth;
  }
  
  // Now, handle splitting the image across multiple pages if its height exceeds availableHeight
  let yPosition = margin; // Initial y position on the current PDF page
  let remainingImgHeight = newImgHeight; // Height of the image part yet to be drawn
  let currentImgPartY = 0; // Y-coordinate of the top of the current image part being sliced

  while (remainingImgHeight > 0) {
      if (!isFirstPage) { // Add new page if not the first page of this canvas
          pdf.addPage();
          yPosition = margin; // Reset yPosition for new page
      }
      
      const pageRemainingHeight = availableHeight - (yPosition - margin); // Height available on current PDF page from current yPosition
      const heightToDrawOnThisPdfPage = Math.min(remainingImgHeight, pageRemainingHeight > 0 ? pageRemainingHeight : availableHeight);

      // Create a temporary canvas to draw part of the image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgProps.width; // Source canvas width
      tempCanvas.height = heightToDrawOnThisPdfPage * 2; // Source slice height (scaled back up)
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
          tempCtx.drawImage(
              canvas, // source canvas
              0, // sx (source x)
              currentImgPartY * 2, // sy (source y, scaled back up)
              imgProps.width, // sWidth (source width)
              heightToDrawOnThisPdfPage * 2, // sHeight (source height, scaled back up)
              0, // dx (destination x on tempCanvas)
              0, // dy (destination y on tempCanvas)
              imgProps.width, // dWidth (destination width on tempCanvas)
              heightToDrawOnThisPdfPage * 2 // dHeight (destination height on tempCanvas, scaled back up)
          );
          const partImgData = tempCanvas.toDataURL('image/png');
          pdf.addImage(partImgData, 'PNG', margin, yPosition, newImgWidth, heightToDrawOnThisPdfPage);
      }
      
      remainingImgHeight -= heightToDrawOnThisPdfPage;
      currentImgPartY += heightToDrawOnThisPdfPage;
      yPosition += heightToDrawOnThisPdfPage; 
      
      if (remainingImgHeight > 0) {
        isFirstPage = false; // Mark that subsequent parts of this canvas are not the first on their PDF page
      }
  }
}


export async function downloadPdfForDocument(doc: Invoice | OrderForm, customer?: Customer): Promise<void> {
  const hiddenContainerId = `pdf-render-area-single-${doc.id}-${Math.random().toString(36).substring(7)}`;
  const hiddenContainer = document.createElement('div');
  hiddenContainer.id = hiddenContainerId;
  hiddenContainer.style.position = 'absolute';
  hiddenContainer.style.left = '-9999px';
  hiddenContainer.style.top = '-9999px';
  hiddenContainer.style.width = '800px'; // A4-like width for rendering consistency
  hiddenContainer.style.background = 'white'; // Ensure background is white for canvas capture
  document.body.appendChild(hiddenContainer);

  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  let isFirstPdfPageForThisDocument = true;

  try {
    // 1. Render Cover Page if applicable
    if (doc.msaContent && doc.msaIncludesCoverPage) {
      const coverPageElement = React.createElement(CoverPageContent, { document: doc as any, customer: customer as any });
      const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
      addCanvasToPdf(pdf, coverCanvas, isFirstPdfPageForThisDocument);
      isFirstPdfPageForThisDocument = false;
    }

    // 2. Render MSA Content if applicable
    if (doc.msaContent) {
      const MsaContentWrapper = () => (
        <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none"
             dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
      );
      const msaElement = React.createElement(MsaContentWrapper);
      const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
      addCanvasToPdf(pdf, msaCanvas, isFirstPdfPageForThisDocument);
      isFirstPdfPageForThisDocument = false;
    }

    // 3. Render Main Document Content
    const isInvoice = 'invoiceNumber' in doc;
    const PreviewComponent = isInvoice ? InvoicePreviewContent : OrderFormPreviewContent;
    const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
    const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
    addCanvasToPdf(pdf, mainDocCanvas, isFirstPdfPageForThisDocument);

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
  let isFirstPdfPageOverall = true;

  const hiddenContainerId = `pdf-render-area-combined-${Math.random().toString(36).substring(7)}`;
  const hiddenContainer = document.createElement('div');
  hiddenContainer.id = hiddenContainerId;
  hiddenContainer.style.position = 'absolute';
  hiddenContainer.style.left = '-9999px';
  hiddenContainer.style.top = '-9999px';
  hiddenContainer.style.width = '800px'; // Consistent rendering width
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
        isFirstPdfPageOverall = false; // Only the very first page of the combined PDF is "first"
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
      isFirstPdfPageOverall = false;

      toast({ title: 'Progress', description: `Added ${docType} ${docNumber} to PDF (${i + 1}/${docs.length}).` });
      await delay(200); // Increased delay slightly for potentially complex renders
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
    