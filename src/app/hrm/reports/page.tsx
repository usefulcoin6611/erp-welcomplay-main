'use client'

import { useMemo, lazy, Suspense, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load tab components for better performance
const PayrollTab = lazy(() => import('@/components/hrm-reports').then(m => ({ default: m.PayrollTab })))
const LeaveTab = lazy(() => import('@/components/hrm-reports').then(m => ({ default: m.LeaveTab })))
const MonthlyAttendanceTab = lazy(() => import('@/components/hrm-reports').then(m => ({ default: m.MonthlyAttendanceTab })))

// Preload tab modules on hover/focus
const preloadTab = {
  'payroll': () => import('@/components/hrm-reports'),
  'leave': () => import('@/components/hrm-reports'),
  'monthly-attendance': () => import('@/components/hrm-reports'),
}

// Loading fallback component
const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

export default function HRMReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default to 'payroll'
  const activeTab = searchParams.get('tab') || 'payroll'

  // Cache for tab content (to avoid Suspense fallback after first load)
  const tabContentCache = useRef<{[key: string]: React.ReactNode}>({})

  // Memoize report tabs with lazy-loaded components wrapped in Suspense
  const reportTabs = useMemo(() => [
    {
      id: 'payroll',
      title: 'Payroll',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="payroll" Component={PayrollTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'leave',
      title: 'Leave',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="leave" Component={LeaveTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'monthly-attendance',
      title: 'Monthly Attendance',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="monthly-attendance" Component={MonthlyAttendanceTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
  ], [])

  // Preload tab module on hover/focus
  const handleTabPreload = (tabId: string) => {
    if (preloadTab[tabId as keyof typeof preloadTab]) {
      preloadTab[tabId as keyof typeof preloadTab]()
    }
  }

  // TabContentWithCache component
  function TabContentWithCache({ tabId, Component, cache }: { tabId: string, Component: React.ComponentType, cache: any }) {
    const [mounted, setMounted] = useState(false)
    if (cache[tabId]) return cache[tabId]
    if (!mounted) {
      setMounted(true)
      cache[tabId] = <Component />
    }
    return <Component />
  }

  // Handle tab change - update URL query params
  const handleTabChange = (tabId: string) => {
    router.push(`/hrm/reports?tab=${tabId}`, { scroll: false })
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
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Smooth Tab Navigation with Animated Content */}
            <SmoothTab
              items={reportTabs}
              defaultTabId={activeTab}
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
              onChange={handleTabChange}
              onTabPreload={handleTabPreload}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
