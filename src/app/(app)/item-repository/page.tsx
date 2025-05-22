
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2, PackageSearch, ExternalLink, Briefcase } from 'lucide-react';
import type { RepositoryItem, OrderForm } from '@/types';
import { getAllRepositoryItems, removeRepositoryItem, getAllOrderForms } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { getCurrencySymbol } from '@/lib/currency-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface LinkedOrderFormInfo {
  id: string; // OrderForm ID
  orderFormNumber: string;
  customerName?: string;
  issueDate: Date;
}
interface RepositoryItemWithLinkedOrderForms extends RepositoryItem {
  linkedOrderForms: LinkedOrderFormInfo[];
}
interface ProcessedVendorGroup {
  vendorName: string;
  items: RepositoryItemWithLinkedOrderForms[];
}

const NO_VENDOR_GROUP_NAME = "Items without a Default Vendor";

export default function ItemRepositoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  
  const [repositoryItems, setRepositoryItems] = React.useState<RepositoryItem[]>([]);
  const [orderForms, setOrderForms] = React.useState<OrderForm[]>([]);
  const [processedData, setProcessedData] = React.useState<ProcessedVendorGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [repoItemsData, orderFormsData] = await Promise.all([
          getAllRepositoryItems(),
          getAllOrderForms()
        ]);
        setRepositoryItems(repoItemsData);
        setOrderForms(orderFormsData);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch repository or order form data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]);

  React.useEffect(() => {
    if (repositoryItems.length === 0 && orderForms.length === 0 && loading) return;

    const vendorMap = new Map<string, RepositoryItemWithLinkedOrderForms[]>();

    repositoryItems.forEach(repoItem => {
      const linkedOrderForms: LinkedOrderFormInfo[] = [];
      orderForms.forEach(orderForm => {
        if (orderForm.items.some(ofItem => ofItem.description.toLowerCase() === repoItem.name.toLowerCase())) {
          linkedOrderForms.push({
            id: orderForm.id,
            orderFormNumber: orderForm.orderFormNumber,
            customerName: orderForm.customerName,
            issueDate: new Date(orderForm.issueDate),
          });
        }
      });

      const itemWithLinks: RepositoryItemWithLinkedOrderForms = { ...repoItem, linkedOrderForms };
      const vendorKey = repoItem.defaultVendorName || NO_VENDOR_GROUP_NAME;

      if (!vendorMap.has(vendorKey)) {
        vendorMap.set(vendorKey, []);
      }
      vendorMap.get(vendorKey)!.push(itemWithLinks);
    });
    
    const groupedData: ProcessedVendorGroup[] = [];
    // Ensure "Items without a Default Vendor" appears first if it exists
    if (vendorMap.has(NO_VENDOR_GROUP_NAME)) {
      groupedData.push({ vendorName: NO_VENDOR_GROUP_NAME, items: vendorMap.get(NO_VENDOR_GROUP_NAME)! });
      vendorMap.delete(NO_VENDOR_GROUP_NAME);
    }
    // Add other vendors, sorted alphabetically
    const sortedVendorKeys = Array.from(vendorMap.keys()).sort((a, b) => a.localeCompare(b));
    sortedVendorKeys.forEach(vendorKey => {
      groupedData.push({ vendorName: vendorKey, items: vendorMap.get(vendorKey)! });
    });
    
    setProcessedData(groupedData);

  }, [repositoryItems, orderForms, loading]);


  const handleDeleteItem = async (id: string) => {
    try {
      await removeRepositoryItem(id);
      // Refetch or update local state for repositoryItems
      setRepositoryItems(prev => prev.filter(item => item.id !== id));
      // The processedData will recompute in the useEffect
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

  const filteredProcessedData = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return processedData;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    
    return processedData.map(group => {
      const filteredItems = group.items.filter(item =>
        item.name.toLowerCase().includes(lowercasedFilter) ||
        (item.defaultVendorName && item.defaultVendorName.toLowerCase().includes(lowercasedFilter)) ||
        (item.customerName && item.customerName.toLowerCase().includes(lowercasedFilter))
      );
      // Only include the group if it matches the search term or has items that match
      if (group.vendorName.toLowerCase().includes(lowercasedFilter) || filteredItems.length > 0) {
        return { ...group, items: filteredItems };
      }
      return null;
    }).filter(group => group !== null && group.items.length > 0) as ProcessedVendorGroup[];

  }, [processedData, searchTerm]);

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
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-1" />
              <Skeleton className="h-4 w-full mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-10 w-1/3" /> {/* Accordion Trigger */}
                  <Skeleton className="h-20 w-full" /> {/* Accordion Content with items */}
                </div>
              ))}
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
            placeholder="Filter by vendor, item, or customer..."
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
            <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary"/> Item Repository</CardTitle>
            <CardDescription>
              This repository stores default values for items/services, grouped by vendor. Items can be global defaults or customer-specific if created/updated via an Order Form.
              <strong className="block mt-1">Note: Values shown are defaults from the repository. Editing items here modifies these defaults.</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProcessedData.length === 0 && !loading ? (
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
              <Accordion type="multiple" className="w-full">
                {filteredProcessedData.map((group) => (
                  <AccordionItem value={group.vendorName} key={group.vendorName}>
                    <AccordionTrigger className="text-lg font-medium hover:bg-muted/50 px-4 rounded-md">
                      {group.vendorName} ({group.items.length})
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-0">
                      <div className="space-y-3 pl-4 pr-2">
                        {group.items.map(item => (
                          <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 pt-4 px-4">
                              <CardTitle className="text-base flex justify-between items-center">
                                <span>{item.name}</span>
                                <div className="flex space-x-1">
                                  <Button variant="ghost" size="icon" title="Edit Item" onClick={() => router.push(`/item-repository/${item.id}/edit`)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <DeleteConfirmationDialog
                                    onConfirm={() => handleDeleteItem(item.id)}
                                    itemName={`repository item "${item.name}"${item.customerName ? ` for ${item.customerName}` : ''}`}
                                    trigger={
                                      <Button variant="ghost" size="icon" title="Delete Item">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    }
                                  />
                                </div>
                              </CardTitle>
                              {item.customerName && <CardDescription className="text-xs">Customer: {item.customerName}</CardDescription>}
                            </CardHeader>
                            <CardContent className="text-sm px-4 pb-4 space-y-1">
                              <p>Default Rate: {getCurrencySymbol(item.currencyCode)}{item.defaultRate?.toFixed(2) || 'N/A'}</p>
                              <p>Default Procurement Price: {getCurrencySymbol(item.currencyCode)}{item.defaultProcurementPrice?.toFixed(2) || 'N/A'}</p>
                              {item.linkedOrderForms.length > 0 && (
                                <div className="pt-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Used in Order Forms:</p>
                                  <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto text-xs">
                                    {item.linkedOrderForms.map(of => (
                                      <li key={of.id}>
                                        <Link href={`/orderforms/${of.id}`} className="text-primary hover:underline inline-flex items-center gap-1">
                                          {of.orderFormNumber} ({of.customerName || 'N/A'}, {format(of.issueDate, 'PP')}) <ExternalLink className="h-3 w-3"/>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
