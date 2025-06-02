
'use client'; // Mark as a Client Component

import * as React from 'react'; // Import React
import Link from 'next/link';
import { useRouter as ClientRouter, usePathname } from 'next/navigation'; // Added usePathname
import { AppHeader } from '@/components/layout/app-header';
import { Button as ShadCNButton } from '@/components/ui/button'; // Aliased to avoid conflict if Button is used elsewhere
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmationDialog as ClientDeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2 as ClientTrash2Icon } from 'lucide-react';
import type { Customer } from '@/types';
import { getAllCustomers, removeCustomer as ClientRemoveCustomerAction } from '@/lib/actions';
import { useToast as ClientUseToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Added Skeleton

// DeleteCustomerButton can remain here as the whole file is now client-side
function DeleteCustomerButton({ customerId, customerName, onDeleted }: { customerId: string; customerName: string; onDeleted: () => void }) {
  const { toast } = ClientUseToast();
  // No need for ClientRouter here as router.refresh() is not ideal from a deeply nested component
  // Re-fetching data in the parent (CustomersPage) is better.

  const handleDelete = async () => {
    try {
      const success = await ClientRemoveCustomerAction(customerId);
      if (success) {
        toast({ title: "Success", description: `${customerName} deleted successfully.` });
        onDeleted(); // Call the callback to trigger data re-fetch in parent
      } else {
        toast({ title: "Error", description: `Failed to delete ${customerName}.`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to delete ${customerName}.`, variant: "destructive" });
    }
  };

  return (
    <ClientDeleteConfirmationDialog
      onConfirm={handleDelete}
      itemName={customerName}
      trigger={
        <ShadCNButton variant="ghost" size="icon" onClick={(e) => { e.stopPropagation()}} title="Delete Customer">
          <ClientTrash2Icon className="h-4 w-4 text-destructive" />
        </ShadCNButton>
      }
    />
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = ClientUseToast(); // Use toast from parent scope if needed for page-level errors
  const pathname = usePathname(); // For re-fetching data on navigation
  const router = ClientRouter(); // For navigating on row click

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch customers.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers, pathname]); // Add pathname to re-fetch on navigation

  const columns = [
    { accessorKey: 'name', header: 'Name', cell: (row: Customer) => row.name },
    { accessorKey: 'email', header: 'Email', cell: (row: Customer) => row.email },
    { accessorKey: 'phone', header: 'Phone', cell: (row: Customer) => row.phone || 'N/A' },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: Customer) => (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Link href={`/customers/${row.id}/edit`}  >
            <ShadCNButton variant="ghost" size="icon" title="Edit Customer" onClick={(e) => e.stopPropagation()}> 
              <Edit className="h-4 w-4" />
            </ShadCNButton>
          </Link>
          <DeleteCustomerButton customerId={row.id} customerName={row.name} onDeleted={fetchCustomers} />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <AppHeader title="Customers">
          <ShadCNButton disabled><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</ShadCNButton>
        </AppHeader>
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>All Customers</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Customers">
        <Link href="/customers/new">
          <ShadCNButton>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
          </ShadCNButton>
        </Link>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={customers}
              onRowClick={(row) => router.push(`/customers/${row.id}/edit`)}
              noResultsMessage="No customers found. Add your first customer!"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
