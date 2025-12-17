'use client';

import { lazy, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SmoothTab } from '@/components/ui/smooth-tab';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/language-switcher';

// Lazy load tab components
const preloadTab = {
  award: () => import('@/components/hrm-admin').then((mod) => mod.AwardTab),
  transfer: () => import('@/components/hrm-admin').then((mod) => mod.TransferTab),
  resignation: () => import('@/components/hrm-admin').then((mod) => mod.ResignationTab),
  travel: () => import('@/components/hrm-admin').then((mod) => mod.TravelTab),
  promotion: () => import('@/components/hrm-admin').then((mod) => mod.PromotionTab),
  complaints: () => import('@/components/hrm-admin').then((mod) => mod.ComplaintsTab),
  warning: () => import('@/components/hrm-admin').then((mod) => mod.WarningTab),
  termination: () => import('@/components/hrm-admin').then((mod) => mod.TerminationTab),
  announcement: () => import('@/components/hrm-admin').then((mod) => mod.AnnouncementTab),
  holidays: () => import('@/components/hrm-admin').then((mod) => mod.HolidaysTab),
};

const AwardTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.AwardTab })));
const TransferTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.TransferTab })));
const ResignationTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.ResignationTab })));
const TravelTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.TravelTab })));
const PromotionTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.PromotionTab })));
const ComplaintsTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.ComplaintsTab })));
const WarningTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.WarningTab })));
const TerminationTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.TerminationTab })));
const AnnouncementTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.AnnouncementTab })));
const HolidaysTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.HolidaysTab })));

export default function HRAdminSetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'award';

  const adminTabs = useMemo(
    () => [
      {
        id: 'award',
        title: 'Award',
        content: <AwardTab />,
      },
      {
        id: 'transfer',
        title: 'Transfer',
        content: <TransferTab />,
      },
      {
        id: 'resignation',
        title: 'Resignation',
        content: <ResignationTab />,
      },
      {
        id: 'travel',
        title: 'Travel',
        content: <TravelTab />,
      },
      {
        id: 'promotion',
        title: 'Promotion',
        content: <PromotionTab />,
      },
      {
        id: 'complaints',
        title: 'Complaints',
        content: <ComplaintsTab />,
      },
      {
        id: 'warning',
        title: 'Warning',
        content: <WarningTab />,
      },
      {
        id: 'termination',
        title: 'Termination',
        content: <TerminationTab />,
      },
      {
        id: 'announcement',
        title: 'Announcement',
        content: <AnnouncementTab />,
      },
      {
        id: 'holidays',
        title: 'Holidays',
        content: <HolidaysTab />,
      },
    ],
    []
  );

  const handleTabChange = (tabId: string) => {
    router.push(`?tab=${tabId}`);
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">HR Admin Setup</h1>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <SmoothTab
              items={adminTabs}
              defaultTabId={activeTab}
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
              onChange={handleTabChange}
              onTabPreload={(tabId) => {
                // Preload tab component on hover for instant switching
                if (preloadTab[tabId as keyof typeof preloadTab]) {
                  preloadTab[tabId as keyof typeof preloadTab]();
                }
              }}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
