
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
import type { CoverPageTemplate, Invoice, Customer } from '@/types'; // Assuming Invoice/Customer might be needed for CoverPageContent
import { CoverPageContent } from '@/components/cover-page-content';
import { format } from 'date-fns';

interface CoverPageTemplatePreviewDialogProps {
  template: CoverPageTemplate;
  trigger: ReactNode;
}

export function CoverPageTemplatePreviewDialog({ template, trigger }: CoverPageTemplatePreviewDialogProps) {
  // Create minimal mock document and customer data for previewing the template
  const mockDocument: Partial<Invoice> = {
    issueDate: new Date(),
    // Add any other fields CoverPageContent might expect from a 'document'
  };
  const mockCustomer: Partial<Customer> = {
    name: 'Valued Client (Preview)',
    // Add any other fields CoverPageContent might expect from a 'customer'
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Cover Page Preview: {template.name}</DialogTitle>
          <DialogDescription>
            This is a preview of how the cover page template &quot;{template.title || template.name}&quot; might look.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6 border rounded-md">
          <CoverPageContent 
            document={mockDocument as Invoice} // Cast as per CoverPageContent expectation
            customer={mockCustomer as Customer} // Cast as per CoverPageContent expectation
            template={template} 
          />
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

CoverPageTemplatePreviewDialog.displayName = "CoverPageTemplatePreviewDialog";
