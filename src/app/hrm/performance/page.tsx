'use client'

import { useMemo, lazy, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { LanguageSwitcher } from '@/components/language-switcher'

// Lazy load tab components for better performance
const IndicatorTab = lazy(() => import('@/components/hrm-performance').then(m => ({ default: m.IndicatorTab })))
const AppraisalTab = lazy(() => import('@/components/hrm-performance').then(m => ({ default: m.AppraisalTab })))
const GoalTrackingTab = lazy(() => import('@/components/hrm-performance').then(m => ({ default: m.GoalTrackingTab })))

// Preload tab modules on hover/focus
const preloadTab = {
  'indicator': () => import('@/components/hrm-performance'),
  'appraisal': () => import('@/components/hrm-performance'),
  'goal-tracking': () => import('@/components/hrm-performance'),
}

// Loading fallback component
const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

// Wrapper component for tab content caching
function TabContentWithCache({ 
  tabId, 
  Component, 
  cache 
}: { 
  tabId: string
  Component: React.ComponentType
  cache: {[key: string]: React.ReactNode}
}) {
  if (!cache[tabId]) {
    cache[tabId] = <Component />
  }
  return <>{cache[tabId]}</>
}

export default function PerformanceSetupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default to 'indicator'
  const activeTab = searchParams.get('tab') || 'indicator'

  // Cache for tab content (to avoid Suspense fallback after first load)
  const tabContentCache = useRef<{[key: string]: React.ReactNode}>({})

  // Memoize performance tabs with lazy-loaded components wrapped in Suspense
  const performanceTabs = useMemo(() => [
    {
      id: 'indicator',
      title: 'Indicator',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="indicator" Component={IndicatorTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'appraisal',
      title: 'Appraisal',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="appraisal" Component={AppraisalTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'goal-tracking',
      title: 'Goal Tracking',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="goal-tracking" Component={GoalTrackingTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
  ], [])

  const handleTabChange = (tabId: string) => {
    // Update URL with new tab parameter
    router.push(`/hrm/performance?tab=${tabId}`, { scroll: false })
  }

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
            <h1 className="text-base font-medium">Performance Setup</h1>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <SmoothTab
              items={performanceTabs}
              defaultTabId={activeTab}
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
              onChange={handleTabChange}
              onTabPreload={(tabId) => {
                // Preload tab component on hover for instant switching
                if (preloadTab[tabId as keyof typeof preloadTab]) {
                  preloadTab[tabId as keyof typeof preloadTab]()
                }
              }}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
