
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewQuotePage() {
  return (
    <>
      <AppHeader title="Create New Quote" showBackButton />
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>New Quote</CardTitle>
            <CardDescription>
              This is where the form to create a new quote will be. This functionality is planned for a future update.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The quote creation form and related features (like saving and listing quotes) will be implemented here.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
