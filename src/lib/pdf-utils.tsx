
'use client';

import React from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Invoice, OrderForm, Customer, CoverPageTemplate } from '@/types';
import { InvoicePreviewContent } from '@/components/invoice-preview-content';
import { OrderFormPreviewContent } from '@/components/orderform-preview-content';
import { CoverPageContent } from '@/components/cover-page-content';
import { fetchCoverPageTemplateById } from '@/lib/actions';
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
    // Ensure the component is fully rendered before resolving
    // This can be tricky with nested async operations like image loading or further data fetching
    // For components that might fetch data themselves (like PreviewContent fetching CoverPageTemplate),
    // this timeout needs to be sufficient.
    root.render(React.createElement(React.Fragment, null, element));
    setTimeout(resolveRender, 1200); // Increased delay
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
  hiddenContainer.innerHTML = '';
  return canvas;
}

function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, isFirstPageOfSegment: boolean): void {
  const A4_WIDTH_PT = 595.28;
  const A4_HEIGHT_PT = 841.89;
  const margin = 30;

  const contentWidthPt = A4_WIDTH_PT - 2 * margin;
  const contentHeightPt = A4_HEIGHT_PT - 2 * margin;

  const imgOriginalWidthPx = canvas.width;
  const imgOriginalHeightPx = canvas.height;
  
  let scaleRatio: number;
  if (imgOriginalWidthPx > contentWidthPt) {
      scaleRatio = contentWidthPt / imgOriginalWidthPx;
  } else {
      scaleRatio = 1; 
  }
  const finalContentWidthPt = Math.min(imgOriginalWidthPx * scaleRatio, contentWidthPt);

  let yOffsetInImagePx = 0;
  let internalIsFirstPageForThisCanvasChunk = isFirstPageOfSegment; // Controls if addPage is called for the *first chunk* of THIS canvas

  while (yOffsetInImagePx < imgOriginalHeightPx) {
    if (!internalIsFirstPageForThisCanvasChunk) { // Only add page if it's not the very first page of this segment AND not the first chunk
      pdf.addPage();
    }

    let sourceChunkHeightPx = Math.round(contentHeightPt / scaleRatio);
    
    if (yOffsetInImagePx + sourceChunkHeightPx > imgOriginalHeightPx) {
      sourceChunkHeightPx = imgOriginalHeightPx - yOffsetInImagePx;
    }
    if (sourceChunkHeightPx <= 0) break;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgOriginalWidthPx;
    tempCanvas.height = sourceChunkHeightPx;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      tempCtx.drawImage(
        canvas,
        0, yOffsetInImagePx,
        imgOriginalWidthPx, sourceChunkHeightPx,
        0, 0,
        imgOriginalWidthPx, sourceChunkHeightPx
      );
      const chunkImgData = tempCanvas.toDataURL('image/png');
      const destChunkHeightPt = sourceChunkHeightPx * scaleRatio;
      pdf.addImage(chunkImgData, 'PNG', margin, margin, finalContentWidthPt, destChunkHeightPt);
    }
    yOffsetInImagePx += sourceChunkHeightPx;
    internalIsFirstPageForThisCanvasChunk = false; // Subsequent chunks of this canvas are not the "first page of the segment"
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
  let isFirstPageOverall = true; // Track if this is the very first page added to the PDF

  try {
    toast({ title: 'Generating PDF...', description: 'Please wait while the document is being prepared.' });
    await delay(100); // Small initial delay

    // 1. Render Cover Page (if applicable)
    let coverPageTemplate: CoverPageTemplate | undefined = undefined;
    console.log(`[PDF Generation for Doc ID: ${doc.id}] Checking MSA content and cover page ID: ${doc.msaCoverPageTemplateId}`);
    if (doc.msaContent && doc.msaCoverPageTemplateId && doc.msaCoverPageTemplateId !== '') {
      try {
        coverPageTemplate = await fetchCoverPageTemplateById(doc.msaCoverPageTemplateId);
        console.log(`[PDF Generation for Doc ID: ${doc.id}] Fetched CoverPageTemplate: ${coverPageTemplate?.name}`);
      } catch (e) {
        console.error(`[PDF Generation for Doc ID: ${doc.id}] Error fetching cover page template:`, e);
      }
    }

    if (coverPageTemplate) {
      console.log(`[PDF Generation for Doc ID: ${doc.id}] Rendering Cover Page: ${coverPageTemplate.name}`);
      const coverPageElement = React.createElement(CoverPageContent, { document: doc, customer, template: coverPageTemplate });
      const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
      addCanvasToPdf(pdf, coverCanvas, true); // True: first page of this segment
      isFirstPageOverall = false;
    }

    // 2. Render MSA Content (if applicable)
    if (doc.msaContent) {
      if (!isFirstPageOverall) { // If cover page was rendered, add a new page for MSA
        pdf.addPage();
      }
      console.log(`[PDF Generation for Doc ID: ${doc.id}] Rendering MSA Content.`);
      const MsaContentWrapper = () => (
        <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none break-words"
             dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
      );
      const msaElement = React.createElement(MsaContentWrapper);
      const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
      addCanvasToPdf(pdf, msaCanvas, true); 
      isFirstPageOverall = false;
    }

    // 3. Render Main Document Content
    const isInvoice = 'invoiceNumber' in doc;
    const PreviewComponent = isInvoice ? InvoicePreviewContent : OrderFormPreviewContent;
    
    if (!isFirstPageOverall) { // If cover page OR MSA was rendered, add a new page for main content
      pdf.addPage();
    }
    console.log(`[PDF Generation for Doc ID: ${doc.id}] Rendering Main Document Content.`);
    // The PreviewComponent will internally fetch its own cover page template if needed for its live preview state,
    // but for PDF, we've already handled the cover page above.
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
  let isFirstDocumentInPdf = true; 

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
      
      let isFirstSegmentForThisDoc = true;

      if (!isFirstDocumentInPdf) { 
        pdf.addPage(); // Add page before starting a new document (unless it's the very first one)
      }

      // 1. Render Cover Page for current document
      let coverPageTemplate: CoverPageTemplate | undefined = undefined;
      if (doc.msaContent && doc.msaCoverPageTemplateId && doc.msaCoverPageTemplateId !== '') {
        try {
          coverPageTemplate = await fetchCoverPageTemplateById(doc.msaCoverPageTemplateId);
        } catch(e) { console.error("Error fetching cover page for combined PDF:", e); }
      }

      if (coverPageTemplate) {
        const coverPageElement = React.createElement(CoverPageContent, { document: doc, customer, template: coverPageTemplate });
        const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
        addCanvasToPdf(pdf, coverCanvas, true); // True: first page of this segment
        isFirstSegmentForThisDoc = false;
      }

      // 2. Render MSA Content for current document
      if (doc.msaContent) {
        if (!isFirstSegmentForThisDoc) { // If cover page was rendered for this doc, add a new page
          pdf.addPage();
        }
        const MsaContentWrapper = () => (
          <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none break-words"
               dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
        );
        const msaElement = React.createElement(MsaContentWrapper);
        const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
        addCanvasToPdf(pdf, msaCanvas, true);
        isFirstSegmentForThisDoc = false;
      }

      // 3. Render Main Document Content for current document
      if (!isFirstSegmentForThisDoc) { // If cover page OR MSA was rendered for this doc, add new page
         pdf.addPage();
      }
      const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
      const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
      addCanvasToPdf(pdf, mainDocCanvas, true);
      
      isFirstDocumentInPdf = false; // After processing the first document, subsequent ones will need a preceding addPage()
      toast({ title: 'Progress', description: `Added ${docType} ${docNumber} to PDF (${i + 1}/${docs.length}).` });
      await delay(700); // Increased delay between documents
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

    
