
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2, BookCopy, LayoutGrid, ListFilter, Eye } from 'lucide-react';
import type { CoverPageTemplate } from '@/types';
import { getAllCoverPageTemplates, removeCoverPageTemplate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Image from 'next/image';
import { CoverPageTemplatePreviewDialog } from '@/components/coverpage-template-preview-dialog';

export default function CoverPageTemplatesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [templates, setTemplates] = React.useState<CoverPageTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<'card' | 'list'>('card');

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllCoverPageTemplates();
        setTemplates(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch Cover Page templates.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]);

  const handleDeleteTemplate = async (id: string) => {
    try {
      await removeCoverPageTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: "Success", description: "Cover Page Template deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete template.", variant: "destructive" });
    }
  };
  
  const columns = [
    { accessorKey: 'name', header: 'Name', cell: (row: CoverPageTemplate) => row.name },
    { accessorKey: 'title', header: 'Cover Page Title', cell: (row: CoverPageTemplate) => row.title || 'N/A' },
    { 
      accessorKey: 'createdAt', 
      header: 'Created At', 
      cell: (row: CoverPageTemplate) => format(new Date(row.createdAt), 'PP') 
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: CoverPageTemplate) => (
        <div className="flex space-x-1">
          <CoverPageTemplatePreviewDialog
            template={row}
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Preview Template">
                <Eye className="h-4 w-4" />
              </Button>
            }
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); router.push(`/templates/coverpages/${row.id}/edit`); }} 
            title="Edit Template"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog 
            onConfirm={() => handleDeleteTemplate(row.id)} 
            itemName={`cover page template "${row.name}"`}
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Template">
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
        <AppHeader title="Cover Page Templates">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-10 w-44" />
          </div>
        </AppHeader>
        <main className="flex-1 p-4 md:p-6">
           <div className={`grid grid-cols-1 ${viewMode === 'card' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''} gap-6`}>
            {[...Array(viewMode === 'card' ? 3 : 5)].map((_, i) => (
              viewMode === 'card' ? (
                <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4 mb-1" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-10 w-1/2" /></CardContent><CardFooter className="flex justify-end gap-2"><Skeleton className="h-9 w-9" /><Skeleton className="h-9 w-9" /></CardFooter></Card>
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
      <AppHeader title="Cover Page Templates">
         <div className="flex items-center gap-2">
           <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')} title="Card View"><LayoutGrid className="h-4 w-4" /></Button>
           <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} title="List View"><ListFilter className="h-4 w-4" /></Button>
           <Link href="/templates/coverpages/new"><Button><PlusCircle className="mr-2 h-4 w-4" /> Create Cover Page</Button></Link>
        </div>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <BookCopy className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Cover Page Templates Yet</h2>
            <p className="text-muted-foreground mb-4">Design reusable cover pages for your documents.</p>
            <Link href="/templates/coverpages/new"><Button><PlusCircle className="mr-2 h-4 w-4" /> Create Your First Cover Page</Button></Link>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <CoverPageTemplatePreviewDialog
                key={template.id}
                template={template}
                trigger={
                  <Card className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="truncate" title={template.name}>{template.name}</CardTitle>
                      <CardDescription>Created: {format(new Date(template.createdAt), 'PP')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                      <p className="text-sm text-muted-foreground">Title: <span className="font-medium text-foreground">{template.title || "N/A"}</span></p>
                      <div className="flex flex-wrap gap-2 items-center">
                        {template.companyLogoEnabled && template.companyLogoUrl && (<Image src={template.companyLogoUrl} alt="Company Logo" width={60} height={20} className="object-contain border rounded-sm p-0.5 bg-muted/30" data-ai-hint="company logo"/>)}
                        {template.clientLogoEnabled && template.clientLogoUrl && (<Image src={template.clientLogoUrl} alt="Client Logo" width={50} height={18} className="object-contain border rounded-sm p-0.5 bg-muted/30" data-ai-hint="client logo"/>)}
                      </div>
                      {(template.additionalImage1Enabled || template.additionalImage2Enabled) && (
                        <p className="text-xs text-muted-foreground pt-1">
                          {template.additionalImage1Enabled && "Image 1 Enabled"}
                          {template.additionalImage1Enabled && template.additionalImage2Enabled && " / "}
                          {template.additionalImage2Enabled && "Image 2 Enabled"}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/templates/coverpages/${template.id}/edit`);}} title="Edit Template"><Edit className="h-4 w-4" /></Button>
                      <DeleteConfirmationDialog onConfirm={() => handleDeleteTemplate(template.id)} itemName={`cover page template "${template.name}"`}
                        trigger={<Button variant="ghost" size="icon" title="Delete Template" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                      />
                    </CardFooter>
                  </Card>
                }
              />
            ))}
          </div>
        ) : (
           <Card>
            <CardHeader><CardTitle>All Cover Page Templates</CardTitle></CardHeader>
            <CardContent><DataTable columns={columns} data={templates} onRowClick={(row) => router.push(`/templates/coverpages/${row.id}/edit`)} noResultsMessage="No Cover Page templates found." /></CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
