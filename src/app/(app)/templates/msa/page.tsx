
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2, FileCheck2, LayoutGrid, ListFilter, Link2, Link2Off } from 'lucide-react';
import type { MsaTemplate, CoverPageTemplate } from '@/types';
import { getAllMsaTemplates, removeMsaTemplate, getAllCoverPageTemplates, linkCoverPageToMsa } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MsaTemplatesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [templates, setTemplates] = React.useState<MsaTemplate[]>([]);
  const [coverPages, setCoverPages] = React.useState<CoverPageTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<'card' | 'list'>('card');
  const [linkingCoverPage, setLinkingCoverPage] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [msaData, coverPageData] = await Promise.all([
          getAllMsaTemplates(),
          getAllCoverPageTemplates(),
        ]);
        setTemplates(msaData);
        setCoverPages(coverPageData);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch MSA templates or Cover Pages.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]);

  const handleDeleteTemplate = async (id: string) => {
    try {
      await removeMsaTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: "Success", description: "MSA Template deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete MSA template.", variant: "destructive" });
    }
  };

  const handleLinkCoverPage = async (msaTemplateId: string, coverPageTemplateId: string | null) => {
    setLinkingCoverPage(msaTemplateId);
    try {
      const updatedMsa = await linkCoverPageToMsa(msaTemplateId, coverPageTemplateId);
      if (updatedMsa) {
        setTemplates(prev => prev.map(t => t.id === msaTemplateId ? updatedMsa : t));
        toast({ title: "Success", description: `Cover Page ${coverPageTemplateId ? 'linked' : 'unlinked'} successfully.` });
      } else {
        toast({ title: "Error", description: "Failed to update MSA template.", variant: "destructive"});
      }
    } catch (error) {
       toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive"});
    } finally {
      setLinkingCoverPage(null);
    }
  };
  
  const getCoverPageName = (coverPageId?: string) => {
    if (!coverPageId) return "None";
    return coverPages.find(cp => cp.id === coverPageId)?.name || "Unknown";
  };

  const columns = [
    { accessorKey: 'name', header: 'Name', cell: (row: MsaTemplate) => row.name },
    { 
      accessorKey: 'coverPageTemplateId', 
      header: 'Cover Page', 
      cell: (row: MsaTemplate) => getCoverPageName(row.coverPageTemplateId)
    },
    { 
      accessorKey: 'createdAt', 
      header: 'Created At', 
      cell: (row: MsaTemplate) => format(new Date(row.createdAt), 'PP') 
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: MsaTemplate) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/templates/msa/${row.id}/edit`); }} title="Edit Template">
            <Edit className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Link Cover Page" disabled={linkingCoverPage === row.id} onClick={(e) => e.stopPropagation()}>
                {linkingCoverPage === row.id ? <Link2Off className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={() => handleLinkCoverPage(row.id, null)} disabled={!row.coverPageTemplateId}>
                None (Unlink Cover Page)
              </DropdownMenuItem>
              {coverPages.length > 0 && <DropdownMenuSeparator />}
              {coverPages.map(cp => (
                <DropdownMenuItem key={cp.id} onSelect={() => handleLinkCoverPage(row.id, cp.id)} disabled={row.coverPageTemplateId === cp.id}>
                  {cp.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteConfirmationDialog 
            onConfirm={() => handleDeleteTemplate(row.id)} 
            itemName={`MSA template "${row.name}"`}
            trigger={<Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Template"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
          />
        </div>
      ),
    },
  ];
  
  if (loading) {
    return (
      <>
        <AppHeader title="MSA Templates">
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
                <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4 mb-1" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent><CardFooter className="flex justify-end gap-2"><Skeleton className="h-9 w-9" /><Skeleton className="h-9 w-9" /></CardFooter></Card>
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
      <AppHeader title="MSA Templates">
        <div className="flex items-center gap-2">
           <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')} title="Card View"><LayoutGrid className="h-4 w-4" /></Button>
           <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} title="List View"><ListFilter className="h-4 w-4" /></Button>
           <Link href="/templates/msa/new"><Button><PlusCircle className="mr-2 h-4 w-4" /> Create MSA Template</Button></Link>
        </div>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <FileCheck2 className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No MSA Templates Yet</h2>
            <p className="text-muted-foreground mb-4">Create your first reusable Master Service Agreement template.</p>
            <Link href="/templates/msa/new"><Button><PlusCircle className="mr-2 h-4 w-4" /> Create Your First MSA Template</Button></Link>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate" title={template.name}>{template.name}</CardTitle>
                  <CardDescription>Created: {format(new Date(template.createdAt), 'PP')}</CardDescription>
                  <CardDescription>Cover Page: {getCoverPageName(template.coverPageTemplateId)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow relative">
                  <ScrollArea className="h-48 w-full rounded-md border bg-muted/20 p-3 relative">
                    <div className="prose prose-sm max-w-none"><ReactMarkdown rehypePlugins={[rehypeRaw]}>{template.content || "*No content*"}</ReactMarkdown></div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
                  <Button variant="ghost" size="icon" onClick={() => router.push(`/templates/msa/${template.id}/edit`)} title="Edit MSA Template"><Edit className="h-4 w-4" /></Button>
                  <DeleteConfirmationDialog onConfirm={() => handleDeleteTemplate(template.id)} itemName={`MSA template "${template.name}"`}
                    trigger={<Button variant="ghost" size="icon" title="Delete MSA Template"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
           <Card>
            <CardHeader><CardTitle>All MSA Templates</CardTitle></CardHeader>
            <CardContent><DataTable columns={columns} data={templates} onRowClick={(row) => router.push(`/templates/msa/${row.id}/edit`)} noResultsMessage="No MSA templates found." /></CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
