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

  // Removed element cache to avoid hook order mismatches

  // Memoize sales tabs with lazy-loaded components wrapped in Suspense
  const salesTabs = useMemo(() => [
    {
      id: 'customer',
      title: 'Customer',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache Component={CustomerTab} />
        </Suspense>
      )
    },
    {
      id: 'estimate',
      title: 'Estimate',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache Component={EstimateTab} />
        </Suspense>
      )
    },
    {
      id: 'invoice',
      title: 'Invoice',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache Component={InvoiceTab} />
        </Suspense>
      )
    },
    {
      id: 'revenue',
      title: 'Revenue',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache Component={RevenueTab} />
        </Suspense>
      )
    },
    {
      id: 'credit-note',
      title: 'Credit Note',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache Component={CreditNoteTab} />
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

  // Simplified content wrapper to maintain consistent hook ordering
  function TabContentWithCache({ Component }: { Component: React.ComponentType }) {
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
