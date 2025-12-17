'use client'

import { useMemo, lazy, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
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
      </SidebarInset>
    </SidebarProvider>
  )
}
