
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
import { FileText, Users, Settings, LogOut, FileSignature as OrderFormIcon, Image as ImageIconLucide, LayoutDashboard, ClipboardList, FileCheck2, BookCopy } from 'lucide-react'; 
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
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/orderforms', label: 'Order Forms', icon: OrderFormIcon },
    { href: '/customers', label: 'Customers', icon: Users },
  ];

  const templateMenuItems = [
    { href: '/templates/terms', label: 'T&C Templates', icon: ClipboardList },
    { href: '/templates/msa', label: 'MSA Templates', icon: FileCheck2 },
    { href: '/templates/coverpages', label: 'Cover Pages', icon: BookCopy },
  ];

  const settingsMenuItems = [
     { href: '/branding', label: 'Branding', icon: ImageIconLucide },
  ];

  const isActive = (href: string) => {
    // Exact match for dashboard or specific template pages to avoid highlighting parent "Templates" group
    if (href === '/dashboard' || href === '/templates/terms' || href === '/templates/msa' || href === '/templates/coverpages') {
        return pathname === href || pathname.startsWith(href + '/');
    }
    // StartsWith for other main sections like /invoices, /customers
    return pathname.startsWith(href);
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
                <span className="group-data-[collapsible=icon]:hidden">Templates</span>
                <ClipboardList className="hidden group-data-[collapsible=icon]:block h-5 w-5"/>
            </SidebarGroupLabel>
            <SidebarMenu>
                {templateMenuItems.map((item) => (
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
          {settingsMenuItems.map((item) => (
             <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.label}
                className={cn(
                  "justify-start",
                  {'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30': isActive(item.href)}
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings (General)" className="justify-start">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
