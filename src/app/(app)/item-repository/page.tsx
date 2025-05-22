
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2, PackageSearch } from 'lucide-react';
import type { RepositoryItem } from '@/types';
import { getAllRepositoryItems, removeRepositoryItem } from '@/lib/actions'; // Removed fetchRepositoryItemById as it's not used here
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { getCurrencySymbol } from '@/lib/currency-utils';

export default function ItemRepositoryPage() {
  const { toast } = useToast();
  const router = useRouter(); // Added router
  const pathname = usePathname(); // Added pathname
  const [items, setItems] = React.useState<RepositoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllRepositoryItems();
        setItems(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch repository items.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]); // Added pathname to dependency array

  const handleDeleteItem = async (id: string) => {
    try {
      await removeRepositoryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      toast({ title: "Success", description: "Repository item deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
    }
  };

  const handleAddNewItem = () => {
     toast({
      title: "Feature Not Implemented",
      description: "Adding new repository items requires a dedicated form which is not yet built.",
      variant: "warning",
      duration: 5000,
     });
  };

  const filteredItems = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(lowercasedFilter) ||
      (item.defaultVendorName && item.defaultVendorName.toLowerCase().includes(lowercasedFilter)) ||
      (item.customerName && item.customerName.toLowerCase().includes(lowercasedFilter)) // Changed from clientName
    );
  }, [items, searchTerm]);

  const columns = [
    { accessorKey: 'name', header: 'Item Name / Description', cell: (row: RepositoryItem) => row.name },
    {
      accessorKey: 'customerName', // Changed from clientName
      header: 'Customer Name',
      cell: (row: RepositoryItem) => row.customerName || 'N/A' // Changed from clientName
    },
    {
      accessorKey: 'defaultRate',
      header: 'Default Selling Rate',
      cell: (row: RepositoryItem) => row.defaultRate !== undefined ? `${getCurrencySymbol(row.currencyCode)}${row.defaultRate.toFixed(2)}` : 'N/A'
    },
    {
      accessorKey: 'defaultProcurementPrice',
      header: 'Default Procurement Price',
      cell: (row: RepositoryItem) => row.defaultProcurementPrice !== undefined ? `${getCurrencySymbol(row.currencyCode)}${row.defaultProcurementPrice.toFixed(2)}` : 'N/A'
    },
    {
      accessorKey: 'defaultVendorName',
      header: 'Default Vendor Name',
      cell: (row: RepositoryItem) => row.defaultVendorName || 'N/A'
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: (row: RepositoryItem) => format(new Date(row.createdAt), 'PP')
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: RepositoryItem) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" title="Edit Item" onClick={() => router.push(`/item-repository/${row.id}/edit`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog
            onConfirm={() => handleDeleteItem(row.id)}
            itemName={`repository item "${row.name}"${row.customerName ? ` for ${row.customerName}` : ''}`} // Changed from clientName
            trigger={
              <Button variant="ghost" size="icon" title="Delete Item">
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
        <AppHeader title="Item Repository">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-36" />
          </div>
        </AppHeader>
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Repository Items</CardTitle>
              <CardDescription>
                This repository stores default values for items/services. Items can be global defaults, or they can become customer-specific if their details are updated/created via an Order Form.
                <strong className="block mt-1">Note: Values shown here are the defaults stored in the repository. They are updated by changes on Order Forms for matching item names (creating new customer-specific items if needed). Editing items here directly modifies these defaults.</strong>
              </CardDescription>
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
      <AppHeader title="Item Repository">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Filter by item, vendor, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-64"
          />
          <Button onClick={handleAddNewItem} title="Add New Global Item (Form Not Implemented)">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Repository Items</CardTitle>
            <CardDescription>
              This repository stores default values for items/services. Items can be global defaults, or they can become customer-specific if their details are updated/created via an Order Form.
              <strong className="block mt-1">Note: Values shown here are the defaults stored in the repository. They are updated by changes on Order Forms for matching item names (creating new customer-specific items if needed). Editing items here directly modifies these defaults.</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-[30vh] text-center">
                <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">{searchTerm ? "No Matching Items Found" : "No Items in Repository"}</h2>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? `Your search for "${searchTerm}" did not match any items.` : "Items will appear here as they are added or used in Order Forms."}
                </p>
                 <Button onClick={handleAddNewItem} title="Add New Global Item (Form Not Implemented)">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Global Default Item
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredItems}
                noResultsMessage={searchTerm ? `No items match your filter "${searchTerm}".` : "No items found in the repository."}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
