'use client'

import { useMemo, lazy, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

// Lazy load tab components for better performance
const SupplierTab = lazy(() => import('@/components/accounting-purchases').then(m => ({ default: m.SupplierTab })))
const BillTab = lazy(() => import('@/components/accounting-purchases').then(m => ({ default: m.BillTab })))
const ExpenseTab = lazy(() => import('@/components/accounting-purchases').then(m => ({ default: m.ExpenseTab })))
const PaymentTab = lazy(() => import('@/components/accounting-purchases').then(m => ({ default: m.PaymentTab })))
const DebitNoteTab = lazy(() => import('@/components/accounting-purchases').then(m => ({ default: m.DebitNoteTab })))

// Preload tab modules on hover/focus
const preloadTab = {
  'supplier': () => import('@/components/accounting-purchases'),
  'bill': () => import('@/components/accounting-purchases'),
  'expense': () => import('@/components/accounting-purchases'),
  'payment': () => import('@/components/accounting-purchases'),
  'debit-note': () => import('@/components/accounting-purchases'),
}

// Loading fallback component
const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

export default function PurchasesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default to 'supplier'
  const activeTab = searchParams.get('tab') || 'supplier'

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

  // Memoize purchases tabs with lazy-loaded components wrapped in Suspense
  const purchasesTabs = useMemo(() => [
    {
      id: 'supplier',
      title: 'Supplier',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="supplier" Component={SupplierTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'bill',
      title: 'Bill',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="bill" Component={BillTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'expense',
      title: 'Expense',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="expense" Component={ExpenseTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'payment',
      title: 'Payment',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="payment" Component={PaymentTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'debit-note',
      title: 'Debit Note',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="debit-note" Component={DebitNoteTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
  ], [])

  // Handle tab change - update URL query params
  const handleTabChange = (tabId: string) => {
    router.push(`/accounting/purchases?tab=${tabId}`, { scroll: false })
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Purchases</h1>
                <p className="text-sm text-muted-foreground">
                  Manage suppliers, bills, expenses, payments, and debit notes
                </p>
              </div>
            </div>

            {/* Smooth Tab Navigation with Animated Content */}
            <Card>
              <CardContent className="p-0">
                <SmoothTab
                  items={purchasesTabs}
                  defaultTabId={activeTab}
                  onChange={handleTabChange}
                  activeColor="bg-white dark:bg-gray-700 shadow-xs"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
