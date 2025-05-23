
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Signature, CalendarDays, User, Mail, Building, Briefcase, Send, ListChecks } from 'lucide-react';
import type { Invoice, OrderForm, Customer } from '@/types';
import { fetchInvoiceById, fetchOrderFormById, fetchCustomerById } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface PlacedField {
  id: string;
  type: string;
  recipientName: string;
  pageNumber?: number; // For future use
  x?: number; // For future use
  y?: number; // For future use
}

// Mock recipients - in a real app, this would come from the previous configuration step
const mockRecipients = [
  { id: 'signer_1', name: 'Alice Signer', email: 'alice@example.com', role: 'Signer' },
  { id: 'approver_1', name: 'Bob Approver', email: 'bob@example.com', role: 'Approver' },
];

const fieldTypes = [
  { id: 'signature', name: 'Signature', icon: Signature },
  { id: 'dateSigned', name: 'Date Signed', icon: CalendarDays },
  { id: 'fullName', name: 'Full Name', icon: User },
  { id: 'email', name: 'Email Address', icon: Mail },
  { id: 'company', name: 'Company', icon: Building },
  { id: 'title', name: 'Title', icon: Briefcase },
];

export default function PlaceSignatureFieldsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const documentType = params.documentType as string;
  const documentId = params.documentId as string;

  const [documentInfo, setDocumentInfo] = React.useState<string | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = React.useState(true);
  const [selectedRecipientId, setSelectedRecipientId] = React.useState<string>(mockRecipients[0]?.id || '');
  const [placedFields, setPlacedFields] = React.useState<PlacedField[]>([]);

  React.useEffect(() => {
    async function loadDocumentInfo() {
      setIsLoadingDocument(true);
      let docNumber = '';
      let customerName = 'N/A';
      try {
        if (documentType === 'invoice' && documentId) {
          const invoice = await fetchInvoiceById(documentId as string);
          if (invoice) {
            docNumber = invoice.invoiceNumber;
            if (invoice.customerId) {
              const customer = await fetchCustomerById(invoice.customerId);
              customerName = customer?.name || 'N/A';
            }
          }
        } else if (documentType === 'orderform' && documentId) {
          const orderForm = await fetchOrderFormById(documentId as string);
          if (orderForm) {
            docNumber = orderForm.orderFormNumber;
             if (orderForm.customerId) {
              const customer = await fetchCustomerById(orderForm.customerId);
              customerName = customer?.name || 'N/A';
            }
          }
        }
        if (docNumber) {
          setDocumentInfo(`${documentType === 'invoice' ? 'Invoice' : 'Order Form'} #${docNumber} for ${customerName}`);
        } else {
          setDocumentInfo('Document not found.');
          toast({ title: "Error", description: "Could not load document details.", variant: "destructive" });
        }
      } catch (error) {
        setDocumentInfo('Error loading document.');
        toast({ title: "Error", description: "Failed to fetch document information.", variant: "destructive" });
      } finally {
        setIsLoadingDocument(false);
      }
    }
    if (documentType && documentId) {
      loadDocumentInfo();
    }
  }, [documentType, documentId, toast]);

  const handleAddField = (fieldType: string, fieldName: string) => {
    const recipient = mockRecipients.find(r => r.id === selectedRecipientId);
    if (!recipient) {
      toast({ title: "No Recipient", description: "Please select a recipient.", variant: "destructive" });
      return;
    }
    const newField: PlacedField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      recipientName: recipient.name,
    };
    setPlacedFields(prev => [...prev, newField]);
    toast({
      title: "Field Added (Conceptual)",
      description: `${fieldName} field added for ${recipient.name}. Drag & drop not implemented in prototype.`,
      variant: "default"
    });
  };

  const handleSendForSignature = () => {
    if (placedFields.length === 0) {
      toast({ title: "No Fields Placed", description: "Please add at least one signature field.", variant: "destructive" });
      return;
    }
    // In a real app, this would trigger backend processing
    toast({
      title: "Prototype: Sent for Signature",
      description: "In a real application, this would send the document with placed fields to recipients.",
      variant: "warning",
      duration: 5000,
    });
    router.push('/dashboard'); // Redirect to dashboard after "sending"
  };

  const pageTitle = isLoadingDocument
    ? "Loading Document..."
    : documentInfo || "Place Signature Fields";

  if (isLoadingDocument) {
    return (
      <>
        <AppHeader title="Loading..." showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><Skeleton className="w-full h-[70vh]"/></div>
            <div className="lg:col-span-1"><Skeleton className="w-full h-[70vh]" /></div>
          </div>
        </main>
      </>
    );
  }
  
  if (!documentInfo || documentInfo === 'Document not found.' || documentInfo === 'Error loading document.') {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6">
          <Card><CardHeader><CardTitle>Error Loading Document</CardTitle></CardHeader><CardContent><p>{documentInfo}</p></CardContent></Card>
        </main>
      </>
    );
  }


  return (
    <>
      <AppHeader title={pageTitle} showBackButton />
      <main className="flex flex-1 flex-col p-4 md:p-6">
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-muted/30 rounded-lg border flex items-center justify-center overflow-hidden min-h-[calc(100vh-12rem)]">
            {/* Placeholder for document preview. In a real app, this would be an iframe or a rendered PDF/image. */}
            <Image 
              src="https://placehold.co/800x1100.png?text=Document+Preview+(Drag+Fields+Here)" 
              alt="Document Preview" 
              width={600} 
              height={825}
              className="object-contain shadow-lg"
              data-ai-hint="document page"
            />
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20"> {/* top-16 (header) + p-4 (main padding) */}
              <CardHeader>
                <CardTitle>Signature Fields</CardTitle>
                <CardDescription>Select a recipient, then click a field type to add it to the document (conceptually).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
                <div className="space-y-1">
                  <label htmlFor="recipient" className="text-sm font-medium">Recipient</label>
                  <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
                    <SelectTrigger id="recipient">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRecipients.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name} ({r.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Field Palette</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {fieldTypes.map(field => (
                      <Button
                        key={field.id}
                        variant="outline"
                        className="flex flex-col h-auto p-3 items-center justify-center space-y-1 text-xs"
                        onClick={() => handleAddField(field.id, field.name)}
                      >
                        <field.icon className="h-5 w-5 mb-1 text-primary" />
                        <span>{field.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {placedFields.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center">
                        <ListChecks className="mr-2 h-4 w-4"/> Conceptually Placed Fields
                    </h4>
                    <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground pl-2">
                      {placedFields.map(pf => (
                        <li key={pf.id}>{pf.type} for {pf.recipientName}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </CardContent>
              <CardFooter>
                <Button 
                    onClick={handleSendForSignature} 
                    className="w-full"
                    disabled={placedFields.length === 0}
                >
                  <Send className="mr-2 h-4 w-4" /> Send for Signature (Prototype)
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
