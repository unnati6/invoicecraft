
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
import type { TermsTemplate } from '@/types';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface TermsTemplatePreviewDialogProps {
  template: TermsTemplate;
  trigger: ReactNode;
}

export function TermsTemplatePreviewDialog({ template, trigger }: TermsTemplatePreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Template Preview: {template.name}</DialogTitle>
          <DialogDescription>
            This is a preview of the terms and conditions template &quot;{template.name}&quot;.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6 border rounded-md">
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

TermsTemplatePreviewDialog.displayName = "TermsTemplatePreviewDialog";
