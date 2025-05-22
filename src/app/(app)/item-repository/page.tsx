
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2, PackageSearch, LayoutGrid, ListFilter, Eye } from 'lucide-react';
import type { RepositoryItem } from '@/types';
import { getAllRepositoryItems, removeRepositoryItem } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { getCurrencySymbol } from '@/lib/currency-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as ShadDialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog'; // Added DialogTrigger
import { ScrollArea } from '@/components/ui/scroll-area';

interface RepositoryItemPreviewDialogProps {
  item: RepositoryItem;
  trigger: React.ReactNode;
}

function RepositoryItemPreviewDialog({ item, trigger }: RepositoryItemPreviewDialogProps) {
  const currencySymbol = getCurrencySymbol(item.currencyCode);
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preview: {item.name}</DialogTitle>
          {item.customerName && <ShadDialogDescription>Customer Specific: {item.customerName}</ShadDialogDescription>}
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-4">
            <div className="space-y-2 text-sm">
                <p><strong>Default Rate:</strong> {currencySymbol}{item.defaultRate?.toFixed(2) || 'N/A'}</p>
                <p><strong>Default Procurement Price:</strong> {currencySymbol}{item.defaultProcurementPrice?.toFixed(2) || 'N/A'}</p>
                <p><strong>Default Vendor Name:</strong> {item.defaultVendorName || 'N/A'}</p>
                <p><strong>Default Currency:</strong> {item.currencyCode || 'N/A'}</p>
                <p><strong>Created At:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function ItemRepositoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  
  const [repositoryItems, setRepositoryItems] = React.useState<RepositoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'card' | 'list'>('card');

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const repoItemsData = await getAllRepositoryItems();
        setRepositoryItems(repoItemsData);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch repository items.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]);

  const handleDeleteItem = async (id: string) => {
    try {
      await removeRepositoryItem(id);
      setRepositoryItems(prev => prev.filter(item => item.id !== id));
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
      return repositoryItems;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return repositoryItems.filter(item =>
      item.name.toLowerCase().includes(lowercasedFilter) ||
      (item.defaultVendorName && item.defaultVendorName.toLowerCase().includes(lowercasedFilter)) ||
      (item.customerName && item.customerName.toLowerCase().includes(lowercasedFilter))
    );
  }, [repositoryItems, searchTerm]);

  const columns = [
    { accessorKey: 'name', header: 'Name', cell: (row: RepositoryItem) => row.name, size: 200 },
    { accessorKey: 'customerName', header: 'Customer Name', cell: (row: RepositoryItem) => row.customerName || 'N/A', size: 150 },
    { accessorKey: 'defaultRate', header: 'Default Rate', cell: (row: RepositoryItem) => `${getCurrencySymbol(row.currencyCode)}${row.defaultRate?.toFixed(2) || 'N/A'}`, size: 120 },
    { accessorKey: 'defaultProcurementPrice', header: 'Proc. Price', cell: (row: RepositoryItem) => `${getCurrencySymbol(row.currencyCode)}${row.defaultProcurementPrice?.toFixed(2) || 'N/A'}`, size: 120 },
    { accessorKey: 'defaultVendorName', header: 'Default Vendor', cell: (row: RepositoryItem) => row.defaultVendorName || 'N/A', size: 150 },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: RepositoryItem) => (
        <div className="flex space-x-1">
          <RepositoryItemPreviewDialog
            item={row}
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Preview Item">
                <Eye className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" title="Edit Item" onClick={(e) => { e.stopPropagation(); router.push(`/item-repository/${row.id}/edit`); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog
            onConfirm={() => handleDeleteItem(row.id)}
            itemName={`repository item "${row.name}"`}
            trigger={
              <Button variant="ghost" size="icon" title="Delete Item" onClick={(e) => e.stopPropagation()}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        </div>
      ),
      size: 150
    },
  ];

  if (loading) {
    return (
      <>
        <AppHeader title="Item Repository">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-64" /> {/* Filter */}
            <Skeleton className="h-9 w-9" /> {/* View toggle */}
            <Skeleton className="h-9 w-9" /> {/* View toggle */}
            <Skeleton className="h-10 w-36" /> {/* Add button */}
          </div>
        </AppHeader>
        <main className="flex-1 p-6 space-y-6">
          <div className={`grid grid-cols-1 ${viewMode === 'card' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''} gap-6`}>
            {[...Array(viewMode === 'card' ? 4 : 5)].map((_, i) => (
              viewMode === 'card' ? (
                <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4 mb-1" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/2" /></CardContent><CardFooter className="flex justify-end gap-2"><Skeleton className="h-9 w-9" /><Skeleton className="h-9 w-9" /><Skeleton className="h-9 w-9" /></CardFooter></Card>
              ) : (
                <Skeleton key={i} className="h-12 w-full" />
              )
            ))}
          </div>
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
          <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')} title="Card View"><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} title="List View"><ListFilter className="h-4 w-4" /></Button>
          <Button onClick={handleAddNewItem} title="Adding items directly requires a dedicated form (not yet implemented). Items are auto-created/updated via Order Forms.">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {filteredItems.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {searchTerm ? "No Matching Items Found" : "No Items in Repository"}
            </h2>
            <p className="text-muted-foreground mb-4 max-w-md">
              {searchTerm ? `Your search for "${searchTerm}" did not match any items.` : "Items added or updated via Order Forms will appear here. You can also add global default items (form not yet implemented)."}
            </p>
            <Button onClick={handleAddNewItem} title="Adding items directly requires a dedicated form (not yet implemented).">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Default Item
            </Button>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
               <RepositoryItemPreviewDialog
                key={item.id}
                item={item}
                trigger={
                  <Card className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 pt-4 px-4">
                      <CardTitle className="text-base truncate" title={item.name}>{item.name}</CardTitle>
                      {item.customerName && <CardDescription className="text-xs">Customer: {item.customerName}</CardDescription>}
                    </CardHeader>
                    <CardContent className="text-sm px-4 pb-2 space-y-1 flex-grow">
                      <p>Rate: {getCurrencySymbol(item.currencyCode)}{item.defaultRate?.toFixed(2) || 'N/A'}</p>
                      <p>Proc. Price: {getCurrencySymbol(item.currencyCode)}{item.defaultProcurementPrice?.toFixed(2) || 'N/A'}</p>
                      <p>Vendor: {item.defaultVendorName || 'N/A'}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-1 border-t pt-3 mt-auto">
                       <Button variant="ghost" size="icon" title="Edit Item" onClick={(e) => { e.stopPropagation(); router.push(`/item-repository/${item.id}/edit`); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteConfirmationDialog
                        onConfirm={() => handleDeleteItem(item.id)}
                        itemName={`repository item "${item.name}"`}
                        trigger={
                          <Button variant="ghost" size="icon" title="Delete Item" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        }
                      />
                    </CardFooter>
                  </Card>
                }
              />
            ))}
          </div>
        ) : ( // List View
          <Card>
            <CardHeader>
              <CardTitle>All Repository Items</CardTitle>
              <CardDescription>
                Manage default values for items/services. These can be global or customer-specific (updated via Order Forms).
                <strong className="block mt-1">Note: Values shown are defaults. Editing items here requires a dedicated form (not yet implemented).</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredItems}
                onRowClick={(row) => router.push(`/item-repository/${row.id}/edit`)}
                noResultsMessage={searchTerm ? `No items match your filter "${searchTerm}".` : "No items found."}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
    
