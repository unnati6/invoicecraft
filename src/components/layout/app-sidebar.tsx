'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { FileText, Users, Settings, LogOut, HomeIcon } from 'lucide-react'; // Using HomeIcon as a generic app icon
import { cn } from '@/lib/utils';

const AppLogo = () => (
  <Link href="/invoices" className="flex items-center gap-2 px-2 py-1 text-lg font-semibold text-primary">
    <HomeIcon className="h-7 w-7 text-primary" />
    <span>InvoiceCraft</span>
  </Link>
);


export function AppSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/customers', label: 'Customers', icon: Users },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b">
         <div className="flex h-14 items-center justify-center group-data-[collapsible=icon]:justify-center">
            <div className="group-data-[collapsible=icon]:hidden">
                 <AppLogo />
            </div>
            <div className="hidden group-data-[collapsible=icon]:block">
                <HomeIcon className="h-7 w-7 text-primary" />
            </div>
         </div>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
                className={cn(
                  "justify-start",
                  {'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30': pathname.startsWith(item.href)}
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" className="justify-start">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" className="justify-start">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

AppSidebar.displayName = "AppSidebar";
