
'use client'; // This utility will be used client-side

import React from 'react'; // Import React
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Invoice, Quote, Customer } from '@/types';
import { InvoicePreviewContent } from '@/components/invoice-preview-content';
import { QuotePreviewContent } from '@/components/quote-preview-content';
import { Toaster } from '@/components/ui/toaster'; // For toast notifications
import { toast } from '@/hooks/use-toast'; // For toast notifications

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function downloadPdfForDocument(doc: Invoice | Quote, customer?: Customer): Promise<void> {
  const hiddenContainer = document.createElement('div');
  hiddenContainer.id = `pdf-render-area-temp-${doc.id}`; // Unique ID for the temporary div
  hiddenContainer.style.position = 'fixed';
  hiddenContainer.style.left = '-9999px';
  hiddenContainer.style.top = '-9999px';
  hiddenContainer.style.width = '800px'; // A4-ish width, adjust as needed
  hiddenContainer.style.background = 'white'; // Ensures html2canvas captures background
  // Apply global CSS variables for theming, if necessary, by adding a class or inline styles
  // For simplicity, we assume Tailwind classes in PreviewContent components handle styling.
  document.body.appendChild(hiddenContainer);

  const root = ReactDOM.createRoot(hiddenContainer);
  const isInvoice = 'invoiceNumber' in doc;
  const PreviewComponent = isInvoice ? InvoicePreviewContent : QuotePreviewContent;
  const docNumber = isInvoice ? doc.invoiceNumber : doc.quoteNumber;
  const docType = isInvoice ? 'Invoice' : 'Quote';

  // Wrap PreviewComponent with a basic Theme provider if your components rely on context for styling
  // For now, we'll render directly. Ensure globals.css provides necessary base styles.
  // Include Toaster here if PreviewComponent uses useToast, though it's better if it doesn't directly.
  
  // Render the component into the hidden div
  // Use a promise to wait for the render to complete (using a timeout as a proxy for next tick)
  await new Promise<void>((resolveRender) => {
    root.render(
      React.createElement(
        React.StrictMode, // Using StrictMode for development checks
        null,
        React.createElement(PreviewComponent, { document: doc as any, customer: customer as any } as any)
      )
    );
    // Wait for the next tick for the DOM to update properly before capturing
    setTimeout(resolveRender, 100); // Small delay for rendering
  });

  try {
    const canvas = await html2canvas(hiddenContainer, { 
      scale: 2, // Improves quality
      useCORS: true, // If you have external images
      logging: false, // Reduce console noise
      // Ensure styles are loaded. If you have complex CSS-in-JS or async styles, this might need more handling.
    });
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions based on canvas content
    const pdfWidth = canvas.width;
    const pdfHeight = canvas.height;

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'pt', // Using points to match canvas dimensions
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${docType}_${docNumber}.pdf`);
    toast({ title: 'Success', description: `${docType} ${docNumber} downloaded.` });

  } catch (error) {
    console.error(`Error generating PDF for ${docType} ${docNumber}:`, error);
    toast({ title: 'Error', description: `Failed to generate PDF for ${docType} ${docNumber}.`, variant: 'destructive' });
  } finally {
    // Cleanup: Unmount the React component and remove the hidden div
    root.unmount();
    document.body.removeChild(hiddenContainer);
  }
}
