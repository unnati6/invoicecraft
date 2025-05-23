
'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileSignature } from 'lucide-react';

export default function SelectDocumentForSignaturePage() {
  // In a real app, you'd fetch and list actual invoices and order forms
  // For this prototype, we'll use mock links.
  const mockDocuments = [
    { id: 'inv_1', type: 'invoice', number: 'INV-001', customer: 'Alice Wonderland' },
    { id: 'of_1', type: 'orderform', number: 'OF-001', customer: 'Alice Wonderland' },
    { id: 'inv_2', type: 'invoice', number: 'INV-002', customer: 'Bob The Builder' },
  ];

  return (
    <>
      <AppHeader title="Select Document for E-Signature" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Choose a Document</CardTitle>
            <CardDescription>
              Select an existing Invoice or Order Form to prepare for e-signature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              In a fully implemented version, this page would list your finalized documents available for sending.
              Below are simulated links for demonstration purposes:
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockDocuments.map((doc) => (
                <Card key={`${doc.type}-${doc.id}`} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      {doc.type === 'invoice' ? <FileText className="mr-2 h-5 w-5 text-primary" /> : <FileSignature className="mr-2 h-5 w-5 text-primary" />}
                      {doc.number}
                    </CardTitle>
                    <CardDescription>For: {doc.customer}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-xs text-muted-foreground">
                      Click below to configure this {doc.type === 'invoice' ? 'invoice' : 'order form'} for e-signature.
                    </p>
                  </CardContent>
                  <div className="p-4 border-t">
                    <Link href={`/e-signature/configure/${doc.type}/${doc.id}`}>
                      <Button className="w-full">
                        Configure {doc.type === 'invoice' ? 'Invoice' : 'Order Form'}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
