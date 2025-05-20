'use client';

import type { ReactNode } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  title: string;
  children?: ReactNode;
  showBackButton?: boolean;
}

export function AppHeader({ title, children, showBackButton = false }: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {children}
      </div>
    </header>
  );
}

AppHeader.displayName = "AppHeader";
