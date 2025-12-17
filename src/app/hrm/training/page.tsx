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
            <h1 className="text-base font-medium">Training Setup</h1>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
