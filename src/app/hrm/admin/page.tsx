'use client';

import { lazy, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SmoothTab } from '@/components/ui/smooth-tab';

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
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
      </SidebarInset>
    </SidebarProvider>
  );
}
