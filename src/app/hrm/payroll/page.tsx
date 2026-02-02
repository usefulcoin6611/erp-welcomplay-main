'use client'

import { useMemo, lazy, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

const SetSalaryTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.SetSalaryTab })))
const PayslipTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.PayslipTab })))

const preloadTab = {
  'set-salary': () => import('@/components/hrm-payroll'),
  payslip: () => import('@/components/hrm-payroll'),
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

export default function PayrollSetupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'set-salary'
  const tabContentCache = useRef<{ [key: string]: React.ReactNode }>({})

  const payrollTabs = useMemo(
    () => [
      {
        id: 'set-salary',
        title: 'Set Salary',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="set-salary" Component={SetSalaryTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'payslip',
        title: 'Payslip',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="payslip" Component={PayslipTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
    ],
    []
  )

  const handleTabChange = (tabId: string) => {
    router.push(`/hrm/payroll?tab=${tabId}`, { scroll: false })
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
              items={payrollTabs}
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
