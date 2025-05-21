
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { TermsTemplate } from '@/types';
import { getAllTermsTemplates, removeTermsTemplate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

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

  const columns = [
    { accessorKey: 'name', header: 'Template Name', cell: (row: TermsTemplate) => row.name },
    { 
      accessorKey: 'createdAt', 
      header: 'Created At', 
      cell: (row: TermsTemplate) => format(new Date(row.createdAt), 'PPp'),
      size: 200
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: TermsTemplate) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/templates/terms/${row.id}/edit`); }} title="Edit Template">
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog 
            onConfirm={() => handleDeleteTemplate(row.id)} 
            itemName={`template "${row.name}"`}
            trigger={
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} title="Delete Template">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        </div>
      ),
      size: 120
    },
  ];
  
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
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All T&C Templates</CardTitle>
              <CardDescription>Manage your reusable terms and conditions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
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
      <AppHeader title="T&C Templates">
        <Link href="/templates/terms/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </Link>
      </AppHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All T&C Templates</CardTitle>
            <CardDescription>Manage your reusable terms and conditions.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={templates}
              onRowClick={(row) => router.push(`/templates/terms/${row.id}/edit`)} 
              noResultsMessage="No templates found. Create your first T&C template!"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
