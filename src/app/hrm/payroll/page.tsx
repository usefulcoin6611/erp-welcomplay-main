'use client'

import { useMemo, lazy, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslations } from 'next-intl'

// Lazy load tab components for better performance
const SetSalaryTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.SetSalaryTab })))
const PayslipTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.PayslipTab })))
const PayslipTypeTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.PayslipTypeTab })))
const AllowanceOptionTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.AllowanceOptionTab })))
const LoanOptionTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.LoanOptionTab })))
const DeductionOptionTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.DeductionOptionTab })))
const LoanTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.LoanTab })))
const SaturationDeductionTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.SaturationDeductionTab })))
const OtherPaymentTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.OtherPaymentTab })))
const OvertimeTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.OvertimeTab })))
const CommissionTab = lazy(() => import('@/components/hrm-payroll').then(m => ({ default: m.CommissionTab })))

// Preload tab modules on hover/focus
const preloadTab = {
  'set-salary': () => import('@/components/hrm-payroll'),
  'payslip': () => import('@/components/hrm-payroll'),
  'payslip-type': () => import('@/components/hrm-payroll'),
  'allowance-option': () => import('@/components/hrm-payroll'),
  'loan-option': () => import('@/components/hrm-payroll'),
  'deduction-option': () => import('@/components/hrm-payroll'),
  'loan': () => import('@/components/hrm-payroll'),
  'saturation-deduction': () => import('@/components/hrm-payroll'),
  'other-payment': () => import('@/components/hrm-payroll'),
  'overtime': () => import('@/components/hrm-payroll'),
  'commission': () => import('@/components/hrm-payroll'),
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

export default function PayrollSetupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default to 'set-salary'
  const activeTab = searchParams.get('tab') || 'set-salary'

  // Cache for tab content (to avoid Suspense fallback after first load)
  const tabContentCache = useRef<{[key: string]: React.ReactNode}>({})

  // Memoize payroll tabs with lazy-loaded components wrapped in Suspense
  const payrollTabs = useMemo(() => [
    {
      id: 'set-salary',
      title: 'Set Salary',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="set-salary" Component={SetSalaryTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'payslip',
      title: 'Payslip',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="payslip" Component={PayslipTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'payslip-type',
      title: 'Payslip Type',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="payslip-type" Component={PayslipTypeTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'allowance-option',
      title: 'Allowance Option',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="allowance-option" Component={AllowanceOptionTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'loan-option',
      title: 'Loan Option',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="loan-option" Component={LoanOptionTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'deduction-option',
      title: 'Deduction Option',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="deduction-option" Component={DeductionOptionTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'loan',
      title: 'Loan',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="loan" Component={LoanTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'saturation-deduction',
      title: 'Saturation Deduction',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="saturation-deduction" Component={SaturationDeductionTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'other-payment',
      title: 'Other Payment',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="other-payment" Component={OtherPaymentTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'overtime',
      title: 'Overtime',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="overtime" Component={OvertimeTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'commission',
      title: 'Commission',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="commission" Component={CommissionTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
  ], [])

  const handleTabChange = (tabId: string) => {
    // Update URL with new tab parameter
    router.push(`/hrm/payroll?tab=${tabId}`, { scroll: false })
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
            <h1 className="text-base font-medium">Payroll Setup</h1>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <SmoothTab
              items={payrollTabs}
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
