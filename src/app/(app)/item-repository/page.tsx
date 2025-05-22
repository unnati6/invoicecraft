
'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2, PackageSearch } from 'lucide-react';
import type { RepositoryItem } from '@/types';
import { getAllRepositoryItems, removeRepositoryItem } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { getCurrencySymbol } from '@/lib/currency-utils';
// Placeholder: Form for adding/editing items will be a separate component
// import { RepositoryItemForm } from '@/components/repository-item-form'; 

export default function ItemRepositoryPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<RepositoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingItem, setEditingItem] = React.useState<RepositoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

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
  }, [toast]);

  const handleDeleteItem = async (id: string) => {
    try {
      await removeRepositoryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      toast({ title: "Success", description: "Repository item deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
    }
  };

  const handleEditItem = (item: RepositoryItem) => {
    // For now, we'll just log. A modal or separate edit page would be needed.
    console.log("Editing item (UI not implemented yet):", item);
    toast({ title: "Note", description: "Edit functionality for repository items is not fully implemented in this view." });
    // setEditingItem(item);
    // setIsFormOpen(true);
  };

  const handleAddNewItem = () => {
     console.log("Adding new item (UI not implemented yet)");
     toast({ title: "Note", description: "Form for adding new repository items is not yet implemented." });
    // setEditingItem(null);
    // setIsFormOpen(true);
  }

  // const handleFormSubmit = async (data: RepositoryItemFormData) => {
  //   // Logic for saving/updating item via saveRepositoryItem action
  //   // Then refetch or update local state
  //   setIsFormOpen(false);
  //   setEditingItem(null);
  //   // Re-fetch items list
  //   const updatedItems = await getAllRepositoryItems();
  //   setItems(updatedItems);
  // };

  const columns = [
    { accessorKey: 'name', header: 'Item Name / Description', cell: (row: RepositoryItem) => row.name },
    { 
      accessorKey: 'defaultRate', 
      header: 'Default Rate', 
      cell: (row: RepositoryItem) => row.defaultRate !== undefined ? `${getCurrencySymbol()}${row.defaultRate.toFixed(2)}` : 'N/A' 
      // Assuming a global default currency symbol for now, or adapt to store currency with item
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
          <Button variant="ghost" size="icon" onClick={() => handleEditItem(row)} title="Edit Item">
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog 
            onConfirm={() => handleDeleteItem(row.id)} 
            itemName={`item "${row.name}"`}
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
          <Skeleton className="h-10 w-36" />
        </AppHeader>
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Repository Items</CardTitle>
              <CardDescription>Manage your predefined items and services.</CardDescription>
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
        {/* For now, a simple button. Later, this could open a modal form. */}
        <Button onClick={handleAddNewItem}> 
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Repository Items</CardTitle>
            <CardDescription>Manage your predefined items, services, and their default rates.</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[30vh] text-center">
                <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Items in Repository</h2>
                <p className="text-muted-foreground mb-4">Add items to quickly use them in your invoices and order forms.</p>
                <Button onClick={handleAddNewItem}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Item
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={items}
                // onRowClick={(row) => handleEditItem(row)} // Optional: click row to edit
                noResultsMessage="No items found. Add your first item to the repository!"
              />
            )}
          </CardContent>
        </Card>
        {/* Placeholder for Form Modal/Drawer - To be implemented later
        {isFormOpen && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
              </DialogHeader>
              <RepositoryItemForm 
                initialData={editingItem} 
                onSubmit={handleFormSubmit} 
                onCancel={() => { setIsFormOpen(false); setEditingItem(null); }}
              />
            </DialogContent>
          </Dialog>
        )}
        */}
      </main>
    </>
  );
}
