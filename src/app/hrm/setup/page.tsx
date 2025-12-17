'use client';

import { useMemo, Suspense } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">HRM System Setup</h1>
            <p className="text-sm text-muted-foreground">Configure organizational structure and hierarchy</p>
          </div>
          <SmoothTab items={tabs} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
