
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { FileText, Users, LogOut, FileSignature as OrderFormIcon, Edit3, LayoutDashboard, ClipboardList, FileCheck2, BookCopy, Archive, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppLogo = () => (
  <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1 text-lg font-semibold">
    <Image
      src="/images/revynox_logo_black.png"
      alt="Revynox Logo"
      width={120}
      height={30}
      className="dark:invert"
    />
  </Link>
);

const AppIcon = () => (
   <Image
      src="/images/revynox_logo_black.png"
      alt="Revynox Icon"
      width={28}
      height={28}
      className="dark:invert"
    />
);


export function AppSidebar() {
  const pathname = usePathname();

  const mainMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/orderforms', label: 'Order Forms', icon: OrderFormIcon },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
    { href: '/item-repository', label: 'Item Repository', icon: Archive },
  ];

  const brandingAndTemplatesMenuItems = [
    { href: '/branding', label: 'Branding & Numbering', icon: Edit3 },
    { href: '/templates/terms', label: 'T&C Templates', icon: ClipboardList },
    { href: '/templates/msa', label: 'MSA Templates', icon: FileCheck2 },
    { href: '/templates/coverpages', label: 'Cover Pages', icon: BookCopy },
  ];

  const settingsMenuItems = [
     // General settings can be added here if needed in the future
  ];

  const isActive = (href: string) => {
    // For exact matches or when the current path starts with the href followed by a '/' (for detail pages)
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b">
         <div className="flex h-14 items-center justify-start group-data-[collapsible=icon]:justify-center">
            <div className="group-data-[collapsible=icon]:hidden">
                 <AppLogo />
            </div>
            <div className="hidden group-data-[collapsible=icon]:block">
                <AppIcon />
            </div>
         </div>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.label}
                className={cn(
                  "justify-start",
                  {'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30': isActive(item.href) }
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

        <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                <span className="group-data-[collapsible=icon]:hidden">Branding &amp; Templates</span>
                <Edit3 className="hidden group-data-[collapsible=icon]:block h-5 w-5"/>
            </SidebarGroupLabel>
            <SidebarMenu>
                {brandingAndTemplatesMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.label}
                        className={cn(
                        "justify-start",
                        {'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30': isActive(item.href) }
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
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          {/* General Settings can be added here if needed */}
          {/* Example:
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="General Settings" className="justify-start">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          */}
          <SidebarMenuItem>
            <Link href="/login">
              <SidebarMenuButton tooltip="Logout" className="justify-start w-full">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

AppSidebar.displayName = "AppSidebar";

