
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { PlusCircle, Edit, Eye, Trash2 } from 'lucide-react';
import type { Customer } from '@/types';
import { getAllCustomers, removeCustomer } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomersPage() {
  const router = useRouter();
  const pathname = usePathname(); // Added
  const { toast } = useToast();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllCustomers();
        setCustomers(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch customers.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]); // Added pathname to dependency array

  const handleDeleteCustomer = async (id: string) => {
    try {
      await removeCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({ title: "Success", description: "Customer deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete customer.", variant: "destructive" });
    }
  };

  const columns = [
    { accessorKey: 'name', header: 'Name', cell: (row: Customer) => row.name },
    { accessorKey: 'email', header: 'Email', cell: (row: Customer) => row.email },
    { accessorKey: 'phone', header: 'Phone', cell: (row: Customer) => row.phone || 'N/A' },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: Customer) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/customers/${row.id}/edit`); }} title="Edit Customer">
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog 
            onConfirm={() => handleDeleteCustomer(row.id)} 
            itemName={row.name}
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Customer">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        </div>
      ),
    },
  ];
  
  if (loading) {
    return (
      <>
        <AppHeader title="Customers">
          <Link href="/customers/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </Link>
        </AppHeader>
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
          </Button>
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
