'use client';

import { lazy, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SmoothTab } from '@/components/ui/smooth-tab';

// Lazy load tab components
const preloadTab = {
  'training-list': () => import('@/components/hrm-training').then((mod) => mod.TrainingListTab),
  trainer: () => import('@/components/hrm-training').then((mod) => mod.TrainerTab),
};

const TrainingListTab = lazy(() =>
  import('@/components/hrm-training').then((mod) => ({ default: mod.TrainingListTab }))
);
const TrainerTab = lazy(() => import('@/components/hrm-training').then((mod) => ({ default: mod.TrainerTab })));

export default function TrainingSetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'training-list';

  const trainingTabs = useMemo(
    () => [
      {
        id: 'training-list',
        title: 'Training List',
        content: <TrainingListTab />,
      },
      {
        id: 'trainer',
        title: 'Trainer',
        content: <TrainerTab />,
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
            items={trainingTabs}
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
