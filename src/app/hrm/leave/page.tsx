'use client'

import { useMemo, lazy, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load tab components for better performance
const ManageLeaveTab = lazy(() => import('@/components/hrm-leave').then(m => ({ default: m.ManageLeaveTab })))
const MarkAttendanceTab = lazy(() => import('@/components/hrm-leave').then(m => ({ default: m.MarkAttendanceTab })))
const BulkAttendanceTab = lazy(() => import('@/components/hrm-leave').then(m => ({ default: m.BulkAttendanceTab })))

// Preload tab modules on hover/focus
const preloadTab = {
  'manage-leave': () => import('@/components/hrm-leave'),
  'mark-attendance': () => import('@/components/hrm-leave'),
  'bulk-attendance': () => import('@/components/hrm-leave'),
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

export default function LeaveManagementSetupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default to 'manage-leave'
  const activeTab = searchParams.get('tab') || 'manage-leave'

  // Cache for tab content (to avoid Suspense fallback after first load)
  const tabContentCache = useRef<{[key: string]: React.ReactNode}>({})

  // Memoize leave management tabs with lazy-loaded components wrapped in Suspense
  const leaveTabs = useMemo(() => [
    {
      id: 'manage-leave',
      title: 'Manage Leave',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="manage-leave" Component={ManageLeaveTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'mark-attendance',
      title: 'Mark Attendance',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="mark-attendance" Component={MarkAttendanceTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'bulk-attendance',
      title: 'Bulk Attendance',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="bulk-attendance" Component={BulkAttendanceTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
  ], [])

  const handleTabChange = (tabId: string) => {
    // Update URL with new tab parameter
    router.push(`/hrm/leave?tab=${tabId}`, { scroll: false })
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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <SmoothTab
              items={leaveTabs}
              value={activeTab}
              defaultTabId={activeTab}
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
              onChange={handleTabChange}
              onTabPreload={(tabId) => {
                if (preloadTab[tabId as keyof typeof preloadTab]) {
                  preloadTab[tabId as keyof typeof preloadTab]()
                }
              }}
            />
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
