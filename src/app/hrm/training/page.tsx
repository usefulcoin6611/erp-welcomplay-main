'use client'

import { useMemo, lazy, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

const TrainingListTab = lazy(() =>
  import('@/components/hrm-training').then((mod) => ({ default: mod.TrainingListTab }))
)
const TrainerTab = lazy(() => import('@/components/hrm-training').then((mod) => ({ default: mod.TrainerTab })))

const preloadTab = {
  'training-list': () => import('@/components/hrm-training'),
  trainer: () => import('@/components/hrm-training'),
}

const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

function TabContentWithCache({
  tabId,
  Component,
  cache,
}: {
  tabId: string
  Component: React.ComponentType
  cache: { [key: string]: React.ReactNode }
}) {
  if (!cache[tabId]) {
    cache[tabId] = <Component />
  }
  return <>{cache[tabId]}</>
}

export default function TrainingSetupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'training-list'
  const tabContentCache = useRef<{ [key: string]: React.ReactNode }>({})

  const trainingTabs = useMemo(
    () => [
      {
        id: 'training-list',
        title: 'Training List',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache
              tabId="training-list"
              Component={TrainingListTab}
              cache={tabContentCache.current}
            />
          </Suspense>
        ),
      },
      {
        id: 'trainer',
        title: 'Trainer',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="trainer" Component={TrainerTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
    ],
    []
  )

  const handleTabChange = (tabId: string) => {
    router.push(`/hrm/training?tab=${tabId}`, { scroll: false })
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <SmoothTab
              items={trainingTabs}
              value={activeTab}
              defaultTabId={activeTab}
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
              onChange={handleTabChange}
              onTabPreload={(tabId) => {
                const preload = preloadTab[tabId as keyof typeof preloadTab]
                if (preload) preload()
              }}
            />
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
