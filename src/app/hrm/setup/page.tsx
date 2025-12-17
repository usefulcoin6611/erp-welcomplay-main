'use client';

import { useMemo, Suspense } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/language-switcher';
import { SmoothTab } from '@/components/ui/smooth-tab';
import { Skeleton } from '@/components/ui/skeleton';
import { lazy } from 'react';

// Lazy load tab components
const BranchTab = lazy(() => import('@/components/hrm-setup/branch-tab'));
const DepartmentTab = lazy(() => import('@/components/hrm-setup/department-tab'));
const DesignationTab = lazy(() => import('@/components/hrm-setup/designation-tab'));

export default function HRMSystemSetupPage() {
  const tabs = useMemo(
    () => [
      {
        id: 'branch',
        title: 'Branch',
        content: (
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <BranchTab />
          </Suspense>
        ),
      },
      {
        id: 'department',
        title: 'Department',
        content: (
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <DepartmentTab />
          </Suspense>
        ),
      },
      {
        id: 'designation',
        title: 'Designation',
        content: (
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <DesignationTab />
          </Suspense>
        ),
      },
    ],
    []
  );

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <h1 className="text-base font-medium">HRM System Setup</h1>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <SmoothTab 
              items={tabs}
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
