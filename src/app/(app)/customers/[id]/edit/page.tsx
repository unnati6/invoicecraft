'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { CustomerForm } from '@/components/customer-form';
import type { CustomerFormData } from '@/lib/schemas';
import {
  fetchCustomerById,
  getAllInvoices,
  markInvoiceAsPaid,
  saveCustomer,
  removeCustomer
} from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Customer, Invoice } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getCurrencySymbol } from '@/lib/currency-utils';
import Link from 'next/link';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { toast } = useToast();

  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isCustomerDeleted, setIsCustomerDeleted] = React.useState(false); // यह ट्रैक करेगा कि ग्राहक डिलीट हो गया है या नहीं

  const [customerInvoices, setCustomerInvoices] = React.useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = React.useState(true);
  const [isMarkingPaid, setIsMarkingPaid] = React.useState<string | null>(null);
  const [totalPaidByCustomer, setTotalPaidByCustomer] = React.useState(0);

  // ग्राहक डेटा लोड करने के लिए useEffect
  React.useEffect(() => {
    // यदि ग्राहक को इस सत्र में डिलीट कर दिया गया है, तो कोई API कॉल न करें
    if (isCustomerDeleted) {
        console.log("DEBUG: Customer is marked as deleted, skipping customer fetch.");
     
        setCustomer(null);
        setCustomerInvoices([]);
        setLoading(false);
        return;
    }

    if (!customerId) {
        console.log("DEBUG: customerId is null/undefined, redirecting.");
        router.push('/dashboard/customers');
        return;
    }

    async function loadCustomer() {
      setLoading(true);
      try {
        const data = await fetchCustomerById(customerId);
        if (data) {
          setCustomer(data);
        } else {
            console.log("DEBUG: Customer not found via API, redirecting.");
          toast({ title: "Error", description: "Customer not found.", variant: "destructive" });
          router.push('/dashboard/customers');
          return;
        }
      } catch (error) {
        console.error("Error fetching customer details:", error);
        toast({ title: "Error", description: "Failed to fetch customer details.", variant: "destructive" });
        router.push('/dashboard/customers');
        return;
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, [customerId, router, toast, isCustomerDeleted]); // isCustomerDeleted को डिपेंडेंसी में रखें

  // ग्राहक के इनवॉइस लोड करने के लिए useEffect
  React.useEffect(() => {
    if (isCustomerDeleted) { // यदि ग्राहक को डिलीट कर दिया गया है, तो इनवॉइस लोड न करें
        console.log("DEBUG: Customer is marked as deleted, skipping invoice fetch.");
        setIsLoadingInvoices(false); // इनवॉइस लोडिंग खत्म
        return;
    }
    async function loadCustomerInvoices() {
      if (customerId && customer) { // customer मौजूद होने पर ही इनवॉइस लोड करें
        setIsLoadingInvoices(true);
        try {
          const allInvoices = await getAllInvoices();
          const filteredInvoices = allInvoices.filter(inv => inv.customerId === customerId);
          setCustomerInvoices(filteredInvoices);

          const paidTotal = filteredInvoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + inv.total, 0);
          setTotalPaidByCustomer(paidTotal);

        } catch (error) {
          console.error("Error fetching customer invoices:", error);
          toast({ title: "Error", description: "Failed to fetch customer invoices.", variant: "destructive" });
        } finally {
          setIsLoadingInvoices(false);
        }
      }
    }
    if (customer && customerId) {
      loadCustomerInvoices();
    }
  }, [customerId, customer, toast, isCustomerDeleted]);


  const handleSubmit = async (data: CustomerFormData) => {
    if (isCustomerDeleted) {
      toast({ title: "Error", description: "Cannot update a deleted customer.", variant: "destructive" });
      return;
    }
    try {
      const updatedCustomer = await saveCustomer(data, customerId);
      if (updatedCustomer) {
        setCustomer(updatedCustomer);
        toast({ title: "Success", description: "Customer updated successfully." });
        router.push('/customers')
        
      } else {
        toast({ title: "Error", description: "Failed to update customer. No data returned.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast({ title: "Error", description: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}.`, variant: "destructive" });
    }
  };

  const handleMarkInvoicePaidOnCustomerPage = async (invoiceId: string) => {
    if (isCustomerDeleted) {
      toast({ title: "Error", description: "Cannot update invoices for a deleted customer.", variant: "destructive" });
      return;
    }
    setIsMarkingPaid(invoiceId);
    try {
      const updatedInvoice = await markInvoiceAsPaid(invoiceId);
      if (updatedInvoice) {
        const newInvoices = customerInvoices.map(inv =>
          inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv
        );
        setCustomerInvoices(newInvoices);

        const paidTotal = newInvoices
          .filter(inv => inv.status === 'Paid')
          .reduce((sum, inv) => sum + inv.total, 0);
        setTotalPaidByCustomer(paidTotal);

        toast({ title: "Success", description: `Invoice ${updatedInvoice.invoiceNumber} marked as paid.` });
      } else {
        toast({ title: "Error", description: "Failed to mark invoice as paid.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast({ title: "Error", description: "An unexpected error occurred while marking invoice as paid.", variant: "destructive" });
    } finally {
      setIsMarkingPaid(null);
    }
  };

  
  // ग्राहक हटाने के लिए हैंडलर
  const handleDeleteCustomer = async () => {
    if (!customer || isDeleting || isCustomerDeleted) return; // यदि ग्राहक पहले से डिलीट हो गया है तो कुछ न करें

    if (window.confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
      setIsDeleting(true); // डिलीटिंग स्थिति सेट करें
      try {
        const success = await removeCustomer(customerId); // actions.ts से removeCustomer को कॉल करें
        if (success) {
          toast({ title: "Success", description: `${customer.name} deleted successfully.` });
          setIsCustomerDeleted(true); // <<-- ग्राहक के डिलीट होने का स्टेट सेट करें
          setCustomer(null); // ग्राहक डेटा को हटा दें ताकि UI अपडेट हो
          setCustomerInvoices([]); // इनवॉइस भी हटा दें
          setTotalPaidByCustomer(0); // कुल भुगतान रीसेट करें
        router.push('/customers'); // <<-- रीडायरेक्ट यहाँ से हटा दिया गया है
        } else {
          toast({ title: "Error", description: `Failed to delete ${customer.name}.`, variant: "destructive" });
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast({ title: "Error", description: "An unexpected error occurred during deletion.", variant: "destructive" });
      } finally {
        setIsDeleting(false); // डिलीटिंग स्थिति रीसेट करें
      }
    }
  };

  const getStatusVariant = (status: Invoice['status']): "default" | "secondary" | "destructive" | "outline" | "status-overdue" => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Sent': return 'destructive';
      case 'Overdue': return 'status-overdue';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };

  // <<-- यदि ग्राहक को डिलीट कर दिया गया है तो कस्टम UI दिखाएं
  if (isCustomerDeleted) {
    return (
      <>
        <AppHeader title="Customer Deleted" showBackButton={true} /> {/* आप यहां बैक बटन दिखा सकते हैं */}
        <main className="flex-1 p-4 md:p-6 text-center space-y-4">
          <p className="text-lg font-semibold text-green-600">Customer was successfully deleted!</p>
          <p className="text-muted-foreground">This customer record no longer exists.</p>
          <div className="flex justify-center">
            <Button onClick={() => router.push('/dashboard/customers')}>Go to Customer List</Button>
          </div>
        </main>
      </>
    );
  }

  // लोडिंग स्केलेटन
  if (loading) {
    return (
      <>
        <AppHeader title="Edit Customer" showBackButton />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <CardSkeleton />
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
            <CardFooter><Skeleton className="h-8 w-1/4" /></CardFooter>
          </Card>
        </main>
      </>
    );
  }

  // यदि customer ऑब्जेक्ट मौजूद नहीं है (और डिलीटेड नहीं है, लेकिन लोड नहीं हो पाया,
  // तो useEffect में `router.push` इसे संभाल लेगा।)
  if (!customer) {
    return (
      <>
        <AppHeader title="Error" showBackButton />
        <main className="flex-1 p-4 md:p-6 text-center">Customer not found. Redirecting...</main>
      </>
    );
  }

  return (
    <>
      {/* AppHeader में handleDeleteCustomer को onDelete प्रॉप के रूप में पास करें */}
      <AppHeader
        title={`Edit Customer: ${customer.name}`}
        showBackButton
      
        onDelete={handleDeleteCustomer} // <<-- यह वह जगह है जहाँ handleDeleteCustomer को पास किया जाता है
      />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <CustomerForm formAction={handleSubmit} initialData={customer} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-muted-foreground" /> Invoices for {customer.name}</CardTitle>
            <CardDescription>All invoices associated with this customer.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInvoices ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : customerInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerInvoices.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link href={`/dashboard/invoices/${invoice.id}`} className="text-primary hover:underline flex items-center">
                          {invoice.invoiceNumber} <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.dueDate ? format(new Date(invoice.dueDate), 'PP') : 'N/A'}</TableCell>
                      <TableCell>{getCurrencySymbol(invoice.currencyCode)}{invoice.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(invoice.status)} className={invoice.status === 'Paid' ? 'bg-primary text-primary-foreground hover:bg-primary/80' : ''}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.status !== 'Paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkInvoicePaidOnCustomerPage(invoice.id)}
                            disabled={isMarkingPaid === invoice.id}
                          >
                            {isMarkingPaid === invoice.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                              </>
                            ) : (
                              <>
                                <CheckSquare className="mr-2 h-4 w-4" /> Mark as Paid
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No invoices found for this customer.</p>
            )}
          </CardContent>
          <CardFooter className="justify-end font-medium text-lg">
            Total Amount Paid by Customer: {getCurrencySymbol(customer.currency)}{totalPaidByCustomer.toFixed(2)}
          </CardFooter>
        </Card>
      </main>
    </>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-4 border p-6 rounded-lg shadow">
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-1/3 mt-4" />
    </div>
  );
}