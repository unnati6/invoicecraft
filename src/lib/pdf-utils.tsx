
'use client';

import React from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Invoice, OrderForm, Customer, CoverPageTemplate } from '@/types';
import { InvoicePreviewContent } from '@/components/invoice-preview-content';
import { OrderFormPreviewContent } from '@/components/orderform-preview-content';
import { CoverPageContent } from '@/components/cover-page-content';
import { fetchCoverPageTemplateById } from '@/lib/actions'; // To fetch cover page template details
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
    root.render(React.createElement(React.Fragment, null, element)); // Ensure element is wrapped if not already
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

  root.unmount(); // Ensure React unmounts the component
  hiddenContainer.innerHTML = ''; // Clear the container manually as well
  return canvas;
}


function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, isFirstContentPageForThisDocument: boolean): void {
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
      if (!isFirstContentPageForThisDocument || !isFirstSegmentOfCanvas) {
          pdf.addPage();
          yPosition = margin;
      }
      // If it is the first content page AND the first segment, it means it's the very first piece of content being added to the PDF
      // or the first piece of content for a new document in a combined PDF.
      // In this case, we don't add a new page if it's also the very first actual PDF page.

      const pageRemainingHeight = availableHeight - (isFirstSegmentOfCanvas ? 0 : (yPosition - margin));
      const heightToDrawOnThisPdfPage = Math.min(remainingImgHeight, pageRemainingHeight > 0 ? pageRemainingHeight : availableHeight);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgProps.width; // Use original canvas width for source
      tempCanvas.height = heightToDrawOnThisPdfPage * 2; // Use original canvas resolution for source segment
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
          tempCtx.drawImage(
              canvas, 
              0, 
              currentImgPartY * 2, // Source Y from original high-res canvas
              imgProps.width, 
              heightToDrawOnThisPdfPage * 2, // Source Height from original high-res canvas
              0, 
              0, 
              imgProps.width, 
              heightToDrawOnThisPdfPage * 2 // Destination Height on temp canvas
          );
          const partImgData = tempCanvas.toDataURL('image/png');
          pdf.addImage(partImgData, 'PNG', margin, yPosition, newImgWidth, heightToDrawOnThisPdfPage);
      }
      
      remainingImgHeight -= heightToDrawOnThisPdfPage;
      currentImgPartY += heightToDrawOnThisPdfPage;
      yPosition += heightToDrawOnThisPdfPage; 
      
      isFirstSegmentOfCanvas = false;
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
  let isFirstContentPageForThisDocument = true;

  try {
    let coverPageTemplate: CoverPageTemplate | undefined = undefined;
    if (doc.msaContent && doc.msaCoverPageTemplateId) {
      coverPageTemplate = await fetchCoverPageTemplateById(doc.msaCoverPageTemplateId);
    }
    
    if (coverPageTemplate) {
      const coverPageElement = React.createElement(CoverPageContent, { document: doc, customer, template: coverPageTemplate });
      const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
      addCanvasToPdf(pdf, coverCanvas, isFirstContentPageForThisDocument);
      isFirstContentPageForThisDocument = false;
    }

    if (doc.msaContent) {
      const MsaContentWrapper = () => (
        <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none"
             dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
      );
      const msaElement = React.createElement(MsaContentWrapper);
      const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
      addCanvasToPdf(pdf, msaCanvas, isFirstContentPageForThisDocument);
      isFirstContentPageForThisDocument = false;
    }
    
    const isInvoice = 'invoiceNumber' in doc;
    const PreviewComponent = isInvoice ? InvoicePreviewContent : OrderFormPreviewContent;
    const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
    const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
    addCanvasToPdf(pdf, mainDocCanvas, isFirstContentPageForThisDocument);
    
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
  let isFirstContentPageForThisDocument = true; // This will reset for each document's content

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
      
      isFirstContentPageForThisDocument = true; // Reset for each new document in the combined PDF

      let coverPageTemplate: CoverPageTemplate | undefined = undefined;
      if (doc.msaContent && doc.msaCoverPageTemplateId) {
        coverPageTemplate = await fetchCoverPageTemplateById(doc.msaCoverPageTemplateId);
      }

      if (coverPageTemplate) {
        if (i > 0) pdf.addPage(); // Add page break before new document's cover page unless it's the very first
        const coverPageElement = React.createElement(CoverPageContent, { document: doc, customer, template: coverPageTemplate });
        const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
        addCanvasToPdf(pdf, coverCanvas, true); // Always true for a cover page (starts its own flow)
        isFirstContentPageForThisDocument = false;
      }

      if (doc.msaContent) {
        const MsaContentWrapper = () => (
          <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none"
               dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
        );
        const msaElement = React.createElement(MsaContentWrapper);
        const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
        addCanvasToPdf(pdf, msaCanvas, isFirstContentPageForThisDocument);
        isFirstContentPageForThisDocument = false;
      }
      
      const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
      const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
      addCanvasToPdf(pdf, mainDocCanvas, isFirstContentPageForThisDocument);

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
