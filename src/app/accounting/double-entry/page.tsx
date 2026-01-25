'use client'

import { useMemo, lazy, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load tab components for better performance
const ChartOfAccountTab = lazy(() => import('@/components/accounting-double-entry').then(m => ({ default: m.ChartOfAccountTab })))
const JournalEntryTab = lazy(() => import('@/components/accounting-double-entry').then(m => ({ default: m.JournalEntryTab })))
const LedgerTab = lazy(() => import('@/components/accounting-double-entry').then(m => ({ default: m.LedgerTab })))
const BalanceSheetTab = lazy(() => import('@/components/accounting-double-entry').then(m => ({ default: m.BalanceSheetTab })))
const ProfitLossTab = lazy(() => import('@/components/accounting-double-entry').then(m => ({ default: m.ProfitLossTab })))
const TrialBalanceTab = lazy(() => import('@/components/accounting-double-entry').then(m => ({ default: m.TrialBalanceTab })))

// Loading fallback component
const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

export default function DoubleEntryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default to 'chart-of-account'
  const activeTab = searchParams.get('tab') || 'chart-of-account'

  // Cache for tab content (to avoid Suspense fallback after first load)
  const tabContentCache = useRef<{[key: string]: React.ReactNode}>({})

  // TabContentWithCache component
  function TabContentWithCache({ tabId, Component, cache }: { tabId: string, Component: React.ComponentType, cache: any }) {
    if (cache[tabId]) {
      return cache[tabId] as React.ReactElement
    }
    const content = <Component />
    cache[tabId] = content
    return content
  }

  // Memoize double entry tabs with lazy-loaded components wrapped in Suspense
  const doubleEntryTabs = useMemo(() => [
    {
      id: 'chart-of-account',
      title: 'Chart of Accounts',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="chart-of-account" Component={ChartOfAccountTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'journal-entry',
      title: 'Journal Account',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="journal-entry" Component={JournalEntryTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'ledger',
      title: 'Ledger Summary',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="ledger" Component={LedgerTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'balance-sheet',
      title: 'Balance Sheet',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="balance-sheet" Component={BalanceSheetTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="profit-loss" Component={ProfitLossTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'trial-balance',
      title: 'Trial Balance',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="trial-balance" Component={TrialBalanceTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
  ], [])

  // Handle tab change - update URL query params
  const handleTabChange = (tabId: string) => {
    router.push(`/accounting/double-entry?tab=${tabId}`, { scroll: false })
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
              items={doubleEntryTabs}
              defaultTabId={activeTab}
              onChange={handleTabChange}
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

