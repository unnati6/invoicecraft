
'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { CustomerForm } from '@/components/customer-form';
import type { CustomerFormData } from '@/lib/schemas';
import { fetchCustomerById, saveCustomer, getAllInvoices, markInvoiceAsPaid } from '@/lib/actions'; // Added getAllInvoices, markInvoiceAsPaid
import { useToast } from '@/hooks/use-toast';
import type { Customer, Invoice } from '@/types'; // Added Invoice type
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added Card components
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Added Table components
import { CheckSquare, FileText } from 'lucide-react'; // Added CheckSquare, FileText
import { format } from 'date-fns';
import { getCurrencySymbol } from '@/lib/currency-utils';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { toast } = useToast();
  
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [customerInvoices, setCustomerInvoices] = React.useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = React.useState(true);
  const [isMarkingPaid, setIsMarkingPaid] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (customerId) {
      async function loadCustomer() {
        setLoading(true);
        try {
          const data = await fetchCustomerById(customerId);
          if (data) {
            setCustomer(data);
          } else {
            toast({ title: "Error", description: "Customer not found.", variant: "destructive" });
            router.push('/customers');
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch customer details.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      loadCustomer();
    }
  }, [customerId, router, toast]);

  React.useEffect(() => {
    async function loadCustomerInvoices() {
        if (customerId && customer) { // Ensure customer is loaded before fetching their invoices
            setIsLoadingInvoices(true);
            try {
                // In a real app, you'd query invoices by customerId directly from the DB
                const allInvoices = await getAllInvoices(); 
                const filteredInvoices = allInvoices.filter(inv => inv.customerId === customerId);
                setCustomerInvoices(filteredInvoices);
            } catch (error) {
                toast({ title: "Error", description: "Failed to fetch customer invoices.", variant: "destructive" });
            } finally {
                setIsLoadingInvoices(false);
            }
        }
    }
    loadCustomerInvoices();
  }, [customerId, customer, toast]); // Depend on customer being loaded

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      const updatedCustomer = await saveCustomer(data, customerId);
      if (updatedCustomer) {
        setCustomer(updatedCustomer); // Update local state with returned data
        toast({ title: "Success", description: "Customer updated successfully." });
        // router.push('/customers'); // Option: or stay on page
      } else {
        toast({ title: "Error", description: "Failed to update customer.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkInvoicePaidOnCustomerPage = async (invoiceId: string) => {
    setIsMarkingPaid(invoiceId);
    try {
        const updatedInvoice = await markInvoiceAsPaid(invoiceId);
        if (updatedInvoice) {
            setCustomerInvoices(prevInvoices =>
                prevInvoices.map(inv =>
                    inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv
                )
            );
            toast({ title: "Success", description: `Invoice ${updatedInvoice.invoiceNumber} marked as paid.`});
        } else {
            toast({ title: "Error", description: "Failed to mark invoice as paid.", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
        setIsMarkingPaid(null);
    }
  };

  const pendingInvoices = customerInvoices.filter(
    (inv) => inv.status === 'Sent' || inv.status === 'Overdue'
  );


  if (loading) {
    return (
      <>
        <AppHeader title="Edit Customer" showBackButton />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <CardSkeleton />
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
        </main>
      </>
    );
  }

  if (!customer) {
    return (
        <>
         <AppHeader title="Error" showBackButton />
         <main className="flex-1 p-4 md:p-6 text-center">Customer not found.</main>
        </>
    );
  }

  return (
    <>
      <AppHeader title={`Edit Customer: ${customer.name}`} showBackButton />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <CustomerForm onSubmit={handleSubmit} initialData={customer} isSubmitting={isSubmitting} />

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-muted-foreground"/> Pending Invoices</CardTitle>
                <CardDescription>Invoices for {customer.name} that are Sent or Overdue.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingInvoices ? (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : pendingInvoices.length > 0 ? (
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
                            {pendingInvoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{format(new Date(invoice.dueDate), 'PP')}</TableCell>
                                    <TableCell>{getCurrencySymbol(invoice.currencyCode)}{invoice.total.toFixed(2)}</TableCell>
                                    <TableCell>{invoice.status}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleMarkInvoicePaidOnCustomerPage(invoice.id)}
                                            disabled={isMarkingPaid === invoice.id}
                                        >
                                            <CheckSquare className="mr-2 h-4 w-4"/> {isMarkingPaid === invoice.id ? "Processing..." : "Mark as Paid"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground">No pending invoices for this customer.</p>
                )}
            </CardContent>
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
