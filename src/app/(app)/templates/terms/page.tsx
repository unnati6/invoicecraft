
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
// DataTable import removed
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2, FileText } from 'lucide-react';
import type { TermsTemplate } from '@/types';
import { getAllTermsTemplates, removeTermsTemplate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TermsTemplatesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [templates, setTemplates] = React.useState<TermsTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllTermsTemplates();
        setTemplates(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch T&C templates.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, pathname]);

  const handleDeleteTemplate = async (id: string) => {
    try {
      await removeTermsTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: "Success", description: "Template deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete template.", variant: "destructive" });
    }
  };
  
  if (loading) {
    return (
      <>
        <AppHeader title="T&C Templates">
          <Link href="/templates/terms/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </Link>
        </AppHeader>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="T&C Templates">
        <Link href="/templates/terms/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </Link>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6">
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate" title={template.name}>{template.name}</CardTitle>
                  <CardDescription>
                    Created: {format(new Date(template.createdAt), 'PP')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow relative">
                  <ScrollArea className="h-48 w-full rounded-md border bg-muted/20 p-3 relative">
                    <div className="prose prose-sm max-w-none">
                       <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                         {template.content || "*No content*"}
                       </ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.push(`/templates/terms/${template.id}/edit`)} 
                    title="Edit Template"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <DeleteConfirmationDialog 
                    onConfirm={() => handleDeleteTemplate(template.id)} 
                    itemName={`template "${template.name}"`}
                    trigger={
                      <Button variant="ghost" size="icon" title="Delete Template">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    }
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Templates Yet</h2>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first reusable terms and conditions template.
            </p>
            <Link href="/templates/terms/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Template
              </Button>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

