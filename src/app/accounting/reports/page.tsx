'use client'

import { useMemo, lazy, Suspense, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load tab components for better performance
const AccountStatementTab = lazy(() => import('@/components/reports').then(m => ({ default: m.AccountStatementTab })))
const InvoiceSummaryTab = lazy(() => import('@/components/reports').then(m => ({ default: m.InvoiceSummaryTab })))
const SalesReportTab = lazy(() => import('@/components/reports').then(m => ({ default: m.SalesReportTab })))
const ReceivablesTab = lazy(() => import('@/components/reports').then(m => ({ default: m.ReceivablesTab })))
const PayablesTab = lazy(() => import('@/components/reports').then(m => ({ default: m.PayablesTab })))
const BillSummaryTab = lazy(() => import('@/components/reports').then(m => ({ default: m.BillSummaryTab })))
const ProductStockTab = lazy(() => import('@/components/reports').then(m => ({ default: m.ProductStockTab })))
const CashFlowTab = lazy(() => import('@/components/reports').then(m => ({ default: m.CashFlowTab })))
const TransactionTab = lazy(() => import('@/components/reports').then(m => ({ default: m.TransactionTab })))
const IncomeSummaryTab = lazy(() => import('@/components/reports').then(m => ({ default: m.IncomeSummaryTab })))
const ExpenseSummaryTab = lazy(() => import('@/components/reports').then(m => ({ default: m.ExpenseSummaryTab })))
const IncomeVsExpenseTab = lazy(() => import('@/components/reports').then(m => ({ default: m.IncomeVsExpenseTab })))
const TaxSummaryTab = lazy(() => import('@/components/reports').then(m => ({ default: m.TaxSummaryTab })))

// Preload tab modules on hover/focus
const preloadTab = {
  'account-statement': () => import('@/components/reports'),
  'invoice-summary': () => import('@/components/reports'),
  'sales-report': () => import('@/components/reports'),
  'receivables': () => import('@/components/reports'),
  'payables': () => import('@/components/reports'),
  'bill-summary': () => import('@/components/reports'),
  'product-stock': () => import('@/components/reports'),
  'cash-flow': () => import('@/components/reports'),
  'transaction': () => import('@/components/reports'),
  'income-summary': () => import('@/components/reports'),
  'expense-summary': () => import('@/components/reports'),
  'income-vs-expense': () => import('@/components/reports'),
  'tax-summary': () => import('@/components/reports'),
}

// Loading fallback component
const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

export default function AccountingReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations()

  // Get active tab from URL or default to 'account-statement'
  const activeTab = searchParams.get('tab') || 'account-statement'

  // Cache for tab content (to avoid Suspense fallback after first load)
  const tabContentCache = useRef<{[key: string]: React.ReactNode}>({})

  // Memoize report tabs with lazy-loaded components wrapped in Suspense
  const reportTabs = useMemo(() => [
    {
      id: 'account-statement',
      title: 'Account Statement',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="account-statement" Component={AccountStatementTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'invoice-summary',
      title: 'Invoice',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="invoice-summary" Component={InvoiceSummaryTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'sales-report',
      title: 'Sales',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="sales-report" Component={SalesReportTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'receivables',
      title: 'Receivables',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="receivables" Component={ReceivablesTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'payables',
      title: 'Payables',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="payables" Component={PayablesTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'bill-summary',
      title: 'Bill',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="bill-summary" Component={BillSummaryTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'product-stock',
      title: 'Product Stock',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="product-stock" Component={ProductStockTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'cash-flow',
      title: 'Cash Flow',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="cash-flow" Component={CashFlowTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'transaction',
      title: 'Transaction',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="transaction" Component={TransactionTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'income-summary',
      title: 'Income',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="income-summary" Component={IncomeSummaryTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'expense-summary',
      title: 'Expense',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="expense-summary" Component={ExpenseSummaryTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'income-vs-expense',
      title: 'Income VS Expense',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="income-vs-expense" Component={IncomeVsExpenseTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'tax-summary',
      title: 'Tax',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="tax-summary" Component={TaxSummaryTab} cache={tabContentCache.current} />
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
    router.push(`/accounting/reports?tab=${tabId}`, { scroll: false })
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
