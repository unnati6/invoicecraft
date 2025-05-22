
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
    root.render(React.createElement(React.Fragment, null, element));
    setTimeout(resolveRender, 500);
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

function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement): void {
  const A4_WIDTH_PT = 595.28;
  const A4_HEIGHT_PT = 841.89;
  const margin = 30;

  const contentWidthPt = A4_WIDTH_PT - 2 * margin;
  const contentHeightPt = A4_HEIGHT_PT - 2 * margin;

  const imgOriginalWidthPx = canvas.width;
  const imgOriginalHeightPx = canvas.height;
  const scaleRatio = contentWidthPt / imgOriginalWidthPx;

  let yOffsetInImagePx = 0;
  let isFirstPageForThisCanvas = true;

  while (yOffsetInImagePx < imgOriginalHeightPx) {
    if (!isFirstPageForThisCanvas) {
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
      pdf.addImage(chunkImgData, 'PNG', margin, margin, contentWidthPt, destChunkHeightPt);
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
  hiddenContainer.style.width = '800px';
  hiddenContainer.style.background = 'white';
  document.body.appendChild(hiddenContainer);

  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  let pageAddedForSegments = false; // Track if a page has been added between segments

  try {
    toast({ title: 'Generating PDF...', description: 'Please wait while the document is being prepared.' });
    await delay(100);

    let coverPageTemplate: CoverPageTemplate | undefined = undefined;
    if (doc.msaContent && doc.msaCoverPageTemplateId) {
      coverPageTemplate = await fetchCoverPageTemplateById(doc.msaCoverPageTemplateId);
    }

    if (coverPageTemplate) {
      const coverPageElement = React.createElement(CoverPageContent, { document: doc, customer, template: coverPageTemplate });
      const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
      addCanvasToPdf(pdf, coverCanvas);
      pageAddedForSegments = true;
    }

    if (doc.msaContent) {
      if (pageAddedForSegments) { // Add a new page only if a cover page was rendered
        pdf.addPage();
      }
      const MsaContentWrapper = () => (
        <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none break-words"
             dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
      );
      const msaElement = React.createElement(MsaContentWrapper);
      const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
      addCanvasToPdf(pdf, msaCanvas);
      pageAddedForSegments = true;
    }

    const isInvoice = 'invoiceNumber' in doc;
    const PreviewComponent = isInvoice ? InvoicePreviewContent : OrderFormPreviewContent;
    if (pageAddedForSegments) { // Add a new page if cover or MSA was rendered
       pdf.addPage();
    }
    const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
    const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
    addCanvasToPdf(pdf, mainDocCanvas);

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
      
      let pageAddedForSegments = false;

      if (i > 0) { // Add page break before starting a new document (unless it's the first)
        pdf.addPage();
      }

      let coverPageTemplate: CoverPageTemplate | undefined = undefined;
      if (doc.msaContent && doc.msaCoverPageTemplateId) {
        coverPageTemplate = await fetchCoverPageTemplateById(doc.msaCoverPageTemplateId);
      }

      if (coverPageTemplate) {
        const coverPageElement = React.createElement(CoverPageContent, { document: doc, customer, template: coverPageTemplate });
        const coverCanvas = await renderAndCapture(coverPageElement, hiddenContainerId);
        addCanvasToPdf(pdf, coverCanvas);
        pageAddedForSegments = true;
      }

      if (doc.msaContent) {
        if (pageAddedForSegments) {
          pdf.addPage();
        }
        const MsaContentWrapper = () => (
          <div className="p-6 bg-card text-foreground font-sans text-sm prose prose-sm max-w-none break-words"
               dangerouslySetInnerHTML={{ __html: doc.msaContent || "" }} />
        );
        const msaElement = React.createElement(MsaContentWrapper);
        const msaCanvas = await renderAndCapture(msaElement, hiddenContainerId);
        addCanvasToPdf(pdf, msaCanvas);
        pageAddedForSegments = true;
      }

      if (pageAddedForSegments) {
         pdf.addPage();
      }
      const mainDocElement = React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any);
      const mainDocCanvas = await renderAndCapture(mainDocElement, hiddenContainerId);
      addCanvasToPdf(pdf, mainDocCanvas);

      toast({ title: 'Progress', description: `Added ${docType} ${docNumber} to PDF (${i + 1}/${docs.length}).` });
      await delay(300);
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

    