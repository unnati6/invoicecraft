
'use client';

import * as React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { CustomerForm } from '@/components/customer-form';
import type { CustomerFormData } from '@/lib/schemas';
import { fetchCustomerById, getAllInvoices, markInvoiceAsPaid, saveCustomer } from '@/lib/actions'; // Reverted to use saveCustomer
import { useToast } from '@/hooks/use-toast';
import type { Customer, Invoice } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { getCurrencySymbol } from '@/lib/currency-utils';
import Link from 'next/link';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { toast } = useToast();
  const pathname = usePathname();
  
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [customerInvoices, setCustomerInvoices] = React.useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = React.useState(true);
  const [isMarkingPaid, setIsMarkingPaid] = React.useState<string | null>(null);
  const [totalPaidByCustomer, setTotalPaidByCustomer] = React.useState(0);

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
  }, [customerId, router, toast, pathname]);

  React.useEffect(() => {
    async function loadCustomerInvoices() {
        if (customerId && customer) {
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
                toast({ title: "Error", description: "Failed to fetch customer invoices.", variant: "destructive" });
            } finally {
                setIsLoadingInvoices(false);
            }
        }
    }
    if (customer) { 
        loadCustomerInvoices();
    }
  }, [customerId, customer, toast, pathname]);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      const updatedCustomer = await saveCustomer(data, customerId); // Use saveCustomer
      if (updatedCustomer) {
        setCustomer(updatedCustomer);
        toast({ title: "Success", description: "Customer updated successfully." });
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
            const newInvoices = customerInvoices.map(inv =>
                inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv
            );
            setCustomerInvoices(newInvoices);
            
            const paidTotal = newInvoices
                .filter(inv => inv.status === 'Paid')
                .reduce((sum, inv) => sum + inv.total, 0);
            setTotalPaidByCustomer(paidTotal);

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

  const getStatusVariant = (status: Invoice['status']): "default" | "secondary" | "destructive" | "outline" | "status-overdue" => {
    switch (status) {
      case 'Paid': return 'default'; 
      case 'Sent': return 'destructive'; 
      case 'Overdue': return 'status-overdue'; 
      case 'Draft': return 'outline'; 
      default: return 'outline';
    }
  };


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
                <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-muted-foreground"/> Invoices for {customer.name}</CardTitle>
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
                                        <Link href={`/invoices/${invoice.id}`} className="text-primary hover:underline flex items-center">
                                            {invoice.invoiceNumber} <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </TableCell>
                                    <TableCell>{format(new Date(invoice.dueDate), 'PP')}</TableCell>
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
                                                <CheckSquare className="mr-2 h-4 w-4"/> {isMarkingPaid === invoice.id ? "Processing..." : "Mark as Paid"}
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
    