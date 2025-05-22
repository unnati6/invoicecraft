
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
import type { MsaTemplate, CoverPageTemplate, Invoice } from '@/types'; // Added Invoice for mock document
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { CoverPageContent } from '@/components/cover-page-content';
import { format } from 'date-fns';

interface MsaTemplatePreviewDialogProps {
  template: MsaTemplate;
  coverPageTemplate?: CoverPageTemplate | null;
  trigger: ReactNode;
}

export function MsaTemplatePreviewDialog({ template, coverPageTemplate, trigger }: MsaTemplatePreviewDialogProps) {
  // Create minimal mock document and customer data for previewing the cover page
  const mockDocument: Partial<Invoice> = { // Using Invoice as a base for document structure
    invoiceNumber: 'MSA-PREVIEW',
    issueDate: new Date(),
    // Add any other fields CoverPageContent might expect from a 'document'
  };
  const mockCustomer = {
    name: 'Valued Client (Preview)',
    // Add any other fields CoverPageContent might expect from a 'customer'
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>MSA Template Preview: {template.name}</DialogTitle>
          <DialogDescription>
            This is a preview of the MSA template &quot;{template.name}&quot;.
            {coverPageTemplate && ` It includes the cover page "${coverPageTemplate.name}".`}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6 border rounded-md">
          {coverPageTemplate && (
            <>
              <CoverPageContent 
                document={mockDocument as Invoice} 
                customer={mockCustomer as any} 
                template={coverPageTemplate} 
              />
              <hr className="my-4 border-border" />
            </>
          )}
          <div className="prose prose-sm max-w-none p-4 bg-background"> {/* Added bg-background for consistent preview */}
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{template.content || "*No content*"}</ReactMarkdown>
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

MsaTemplatePreviewDialog.displayName = "MsaTemplatePreviewDialog";
