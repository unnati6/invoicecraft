
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
  // Use a promise to ensure rendering is complete before capturing
  await new Promise<void>((resolveRender) => {
    root.render(React.createElement(React.Fragment, null, element));
    // Increased timeout slightly to ensure complex layouts render
    setTimeout(resolveRender, 500); 
  });

  const canvas = await html2canvas(hiddenContainer, {
    scale: 2, // Higher scale for better PDF quality
    useCORS: true,
    logging: false,
    width: hiddenContainer.scrollWidth, // Capture the actual scroll width
    height: hiddenContainer.scrollHeight, // Capture the actual scroll height
    windowWidth: hiddenContainer.scrollWidth,
    windowHeight: hiddenContainer.scrollHeight,
  });

  root.unmount(); 
  hiddenContainer.innerHTML = ''; 
  return canvas;
}

function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, isFirstPageOfDocumentSegment: boolean): void {
  const A4_WIDTH_PT = 595.28;
  const A4_HEIGHT_PT = 841.89;
  const margin = 30; // Margin in points

  const contentWidthPt = A4_WIDTH_PT - 2 * margin;
  const contentHeightPt = A4_HEIGHT_PT - 2 * margin;

  const imgOriginalWidthPx = canvas.width;  // This is already scaled by html2canvas e.g. 800px * 2 = 1600px
  const imgOriginalHeightPx = canvas.height; // e.g. H * 2

  // Calculate the scale ratio to fit the image width (at its capture resolution) to the PDF content width
  const scaleRatio = contentWidthPt / imgOriginalWidthPx;
  
  let yOffsetInImagePx = 0; // Tracks the Y offset in the original large image (in its original pixels)
  let isFirstPageForThisCanvas = true;

  while (yOffsetInImagePx < imgOriginalHeightPx) {
    if (!isFirstPageOfDocumentSegment && !isFirstPageForThisCanvas) { 
      // Add new page if it's not the very first page of this specific document segment (cover/msa/main)
      // AND it's not the first page we are creating for this specific canvas.
      pdf.addPage();
    } else if (isFirstPageOfDocumentSegment && !isFirstPageForThisCanvas) {
      // This means it's a subsequent page for the *first segment* of a document (e.g. page 2 of cover page)
      pdf.addPage();
    } else if (!isFirstPageOfDocumentSegment && isFirstPageForThisCanvas) {
      // This means it's the *first page* of a *subsequent segment* (e.g. first page of MSA after cover page)
      // A page break should have been added by the calling function if needed.
    }
    
    // Determine how much of the original image height (in pixels) corresponds to one PDF page content height
    let sourceChunkHeightPx = Math.round(contentHeightPt / scaleRatio);
    
    if (yOffsetInImagePx + sourceChunkHeightPx > imgOriginalHeightPx) {
      sourceChunkHeightPx = imgOriginalHeightPx - yOffsetInImagePx; // Last chunk
    }

    if (sourceChunkHeightPx <= 0) break; 

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgOriginalWidthPx;
    tempCanvas.height = sourceChunkHeightPx;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      tempCtx.drawImage(
        canvas,
        0, yOffsetInImagePx,             // Source X, Y (from original large canvas)
        imgOriginalWidthPx, sourceChunkHeightPx, // Source W, H
        0, 0,                           // Destination X, Y (on temp canvas)
        imgOriginalWidthPx, sourceChunkHeightPx  // Destination W, H
      );

      const chunkImgData = tempCanvas.toDataURL('image/png');
      // The height of this chunk when placed in the PDF, respecting the scaleRatio
      const destChunkHeightPt = sourceChunkHeightPx * scaleRatio; 

      pdf.addImage(
        chunkImgData,
        'PNG',
        margin, // X position on PDF page
        margin, // Y position on PDF page
        contentWidthPt, // Width on PDF page (fits the content area)
        destChunkHeightPt // Height on PDF page
      );
    }
    yOffsetInImagePx += sourceChunkHeightPx;
    isFirstPageForThisCanvas = false; 
  }
}


export async function downloadPdfForDocument(doc: Invoice | OrderForm, customer?: Customer): Promise<void> {
  const hiddenContainerId = `pdf-render-area-single-${doc.id}-${Math.random().toString(36).substring(7)}`;
  const hiddenContainer = document.createElement('div');
  hiddenContainer.id = hiddenContainerId;
  hiddenContainer.style.position = 'absolute';
  hiddenContainer.style.left = '-9999px';
  hiddenContainer.style.top = '-9999px';
  hiddenContainer.style.width = '800px'; // Consistent width for rendering
  hiddenContainer.style.background = 'white'; 
  document.body.appendChild(hiddenContainer);

  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  let isFirstSegmentBeingAddedToPdf = true;

  try {
    toast({ title: 'Generating PDF...', description: 'Please wait while the document is being prepared.' });
    await delay(100); // Short delay for toast to appear

    let coverPageTemplate: CoverPageTemplate | undefined = undefined;
    if (doc.msaContent && doc.msaCoverPageTemplateId) {
      coverPageTemplate = await fetchCoverPageTemplateById(doc.msaCoverPageTemplateId);
    }
    
    if (coverPageTemplate) {
      // No pdf.addPage() here if it's the very first thing
      const coverPageElement = React.createElement(CoverPageContent, { document: doc, customer, template: coverPageTemplate });
      const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
      addCanvasToPdf(pdf, coverCanvas, true); // true indicates it's the first page of its segment
      isFirstSegmentBeingAddedToPdf = false;
    }

    if (doc.msaContent) {
      if (!isFirstSegmentBeingAddedToPdf) pdf.addPage();
      const MsaContentWrapper = () => (
        <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none break-words"
             dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
      );
      const msaElement = React.createElement(MsaContentWrapper);
      const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
      addCanvasToPdf(pdf, msaCanvas, true);
      isFirstSegmentBeingAddedToPdf = false;
    }
    
    const isInvoice = 'invoiceNumber' in doc;
    const PreviewComponent = isInvoice ? InvoicePreviewContent : OrderFormPreviewContent;
    if (!isFirstSegmentBeingAddedToPdf) pdf.addPage();
    const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
    const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
    addCanvasToPdf(pdf, mainDocCanvas, true);
    
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
      
      let isFirstSegmentForThisDocument = true;

      if (i > 0) { // Add a page break before starting a new document, unless it's the very first one
        pdf.addPage();
      }

      let coverPageTemplate: CoverPageTemplate | undefined = undefined;
      if (doc.msaContent && doc.msaCoverPageTemplateId) {
        coverPageTemplate = await fetchCoverPageTemplateById(doc.msaCoverPageTemplateId);
      }

      if (coverPageTemplate) {
        // If i > 0 (not first doc) AND isFirstSegmentForThisDocument, a page break was already added.
        // If i == 0 (first doc) AND isFirstSegmentForThisDocument, no page break needed yet.
        const coverPageElement = React.createElement(CoverPageContent, { document: doc, customer, template: coverPageTemplate });
        const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
        addCanvasToPdf(pdf, coverCanvas, true); 
        isFirstSegmentForThisDocument = false;
      }

      if (doc.msaContent) {
        if (!isFirstSegmentForThisDocument) pdf.addPage();
        const MsaContentWrapper = () => (
          <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none break-words"
               dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
        );
        const msaElement = React.createElement(MsaContentWrapper);
        const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
        addCanvasToPdf(pdf, msaCanvas, true);
        isFirstSegmentForThisDocument = false;
      }
      
      if (!isFirstSegmentForThisDocument) pdf.addPage();
      const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
      const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
      addCanvasToPdf(pdf, mainDocCanvas, true);

      toast({ title: 'Progress', description: `Added ${docType} ${docNumber} to PDF (${i + 1}/${docs.length}).` });
      await delay(300); // Increased delay for stability with multiple complex renders
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
