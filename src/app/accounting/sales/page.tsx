'use client'

import { useMemo, lazy, Suspense, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load tab components for better performance
// NOTE: Use direct imports (avoid barrel exports) to prevent Turbopack "Export X doesn't exist" errors
const CustomerTab = lazy(() => import('@/components/accounting-sales/customer-tab').then(m => ({ default: m.CustomerTab })))
const EstimateTab = lazy(() => import('@/components/accounting-sales/estimate-tab').then(m => ({ default: m.EstimateTab })))
const InvoiceTab = lazy(() => import('@/components/accounting-sales/invoice-tab').then(m => ({ default: m.InvoiceTab })))
const RevenueTab = lazy(() => import('@/components/accounting-sales/revenue-tab').then(m => ({ default: m.RevenueTab })))
const CreditNoteTab = lazy(() => import('@/components/accounting-sales/credit-note-tab').then(m => ({ default: m.CreditNoteTab })))

// Preload tab modules on hover/focus
const preloadTab = {
  'customer': () => import('@/components/accounting-sales/customer-tab'),
  'estimate': () => import('@/components/accounting-sales/estimate-tab'),
  'invoice': () => import('@/components/accounting-sales/invoice-tab'),
  'revenue': () => import('@/components/accounting-sales/revenue-tab'),
  'credit-note': () => import('@/components/accounting-sales/credit-note-tab'),
}

// Loading fallback component
const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

export default function SalesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default to 'customer'
  const activeTab = searchParams.get('tab') || 'customer'

  // Cache for tab content (to avoid Suspense fallback after first load)
  const tabContentCache = useRef<{[key: string]: React.ReactNode}>({})

  // Memoize sales tabs with lazy-loaded components wrapped in Suspense
  const salesTabs = useMemo(() => [
    {
      id: 'customer',
      title: 'Customer',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="customer" Component={CustomerTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'estimate',
      title: 'Estimate',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="estimate" Component={EstimateTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'invoice',
      title: 'Invoice',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="invoice" Component={InvoiceTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'revenue',
      title: 'Revenue',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="revenue" Component={RevenueTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'credit-note',
      title: 'Credit Note',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="credit-note" Component={CreditNoteTab} cache={tabContentCache.current} />
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
    router.push(`/accounting/sales?tab=${tabId}`, { scroll: false })
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
            {/* Smooth Tab Navigation with Animated Content */}
            <SmoothTab
              items={salesTabs}
              defaultTabId={activeTab}
              onChange={handleTabChange}
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
            />
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

