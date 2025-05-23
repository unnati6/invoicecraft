
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Users, Mail, MessageSquare, FilePenLine } from 'lucide-react';
import type { Invoice, OrderForm, Customer } from '@/types'; // Assuming types might be needed
import { fetchInvoiceById, fetchOrderFormById, fetchCustomerById } from '@/lib/actions'; // Assuming actions exist
import { Skeleton } from '@/components/ui/skeleton';

interface Recipient {
  id: string;
  name: string;
  email: string;
}

export default function ConfigureSignatureRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const documentType = params.documentType as string;
  const documentId = params.documentId as string;

  const [documentInfo, setDocumentInfo] = React.useState<string | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = React.useState(true);

  const [recipients, setRecipients] = React.useState<Recipient[]>([]);
  const [currentRecipient, setCurrentRecipient] = React.useState({ name: '', email: '' });
  const [emailSubject, setEmailSubject] = React.useState('');
  const [emailMessage, setEmailMessage] = React.useState('');

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
          setEmailSubject(`Signature Request for ${docNumber}`);
          setEmailMessage(`Please review and sign the attached document: ${docNumber}.\n\nThank you!`);
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


  const handleAddRecipient = () => {
    if (currentRecipient.name.trim() && currentRecipient.email.trim()) {
      if (!/\S+@\S+\.\S+/.test(currentRecipient.email)) {
        toast({ title: "Invalid Email", description: "Please enter a valid email address for the recipient.", variant: "destructive" });
        return;
      }
      setRecipients([...recipients, { ...currentRecipient, id: Date.now().toString() }]);
      setCurrentRecipient({ name: '', email: '' }); // Reset input fields
    } else {
      toast({ title: "Missing Information", description: "Please enter both name and email for the recipient.", variant: "destructive" });
    }
  };

  const handleRemoveRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const handleNext = () => {
    if (recipients.length === 0) {
      toast({ title: "No Recipients", description: "Please add at least one recipient.", variant: "destructive" });
      return;
    }
    if (!emailSubject.trim() || !emailMessage.trim()) {
       toast({ title: "Missing Email Details", description: "Please provide an email subject and message.", variant: "destructive" });
      return;
    }
    // In a real app, this would proceed to the field placement step.
    toast({
      title: "Next Step: Define Fields (Prototype)",
      description: "The UI for placing signature fields (drag & drop) is a complex feature planned for future development. For now, imagine you'd place fields for each recipient.",
      duration: 7000,
      variant: "warning"
    });
  };

  const pageTitle = isLoadingDocument
    ? "Loading Document..."
    : documentInfo || "Configure E-Signature Request";

  return (
    <>
      <AppHeader title={pageTitle} showBackButton />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {isLoadingDocument ? (
          <Card><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        ) : !documentInfo || documentInfo === 'Document not found.' || documentInfo === 'Error loading document.' ? (
           <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>{documentInfo}</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Recipients</CardTitle>
                  <CardDescription>Add who needs to sign or receive a copy of this document.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input 
                        id="recipientName" 
                        placeholder="e.g. Jane Doe" 
                        value={currentRecipient.name}
                        onChange={(e) => setCurrentRecipient({ ...currentRecipient, name: e.target.value })}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="recipientEmail">Recipient Email</Label>
                      <Input 
                        id="recipientEmail" 
                        type="email" 
                        placeholder="e.g. jane.doe@example.com"
                        value={currentRecipient.email}
                        onChange={(e) => setCurrentRecipient({ ...currentRecipient, email: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddRecipient} className="sm:self-end mt-4 sm:mt-0">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Recipient
                    </Button>
                  </div>
                  {recipients.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="text-sm font-medium text-muted-foreground">Added Recipients:</h4>
                      <ul className="space-y-2">
                        {recipients.map(r => (
                          <li key={r.id} className="flex justify-between items-center p-2 border rounded-md bg-muted/50">
                            <div>
                              <p className="font-medium text-sm">{r.name}</p>
                              <p className="text-xs text-muted-foreground">{r.email}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveRecipient(r.id)} title="Remove recipient">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Mail className="mr-2 h-5 w-5 text-primary" /> Email Message</CardTitle>
                  <CardDescription>Customize the email sent to recipients with the document.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="emailSubject">Subject</Label>
                    <Input 
                      id="emailSubject" 
                      placeholder="e.g. Signature Request for Agreement #123"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailMessage">Message</Label>
                    <Textarea 
                      id="emailMessage" 
                      placeholder="Enter your message to the recipients..."
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={5}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center"><FilePenLine className="mr-2 h-5 w-5 text-primary"/> Document Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{documentInfo}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recipients: {recipients.length}
                  </p>
                   <p className="text-xs text-muted-foreground mt-2">
                    This is a prototype. No actual emails will be sent.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleNext} className="w-full">
                    Next: Define Fields (Prototype)
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
