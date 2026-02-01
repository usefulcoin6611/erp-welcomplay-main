'use client'

import { useMemo, lazy, Suspense, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load tab components for better performance
const WarehouseTab = lazy(() => import('@/components/pos-reports').then(m => ({ default: m.WarehouseTab })))
const PurchaseTab = lazy(() => import('@/components/pos-reports').then(m => ({ default: m.PurchaseTab })))
const POSTab = lazy(() => import('@/components/pos-reports').then(m => ({ default: m.POSTab })))
const POSVsPurchaseTab = lazy(() => import('@/components/pos-reports').then(m => ({ default: m.POSVsPurchaseTab })))

// Preload tab modules on hover/focus
const preloadTab = {
  'warehouse': () => import('@/components/pos-reports'),
  'purchase': () => import('@/components/pos-reports'),
  'pos': () => import('@/components/pos-reports'),
  'pos-vs-purchase': () => import('@/components/pos-reports'),
}

// Loading fallback component
const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

export default function POSReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default to 'warehouse'
  const activeTab = searchParams.get('tab') || 'warehouse'

  // Cache for tab content (to avoid Suspense fallback after first load)
  const tabContentCache = useRef<{[key: string]: React.ReactNode}>({})

  // Memoize report tabs with lazy-loaded components wrapped in Suspense
  const reportTabs = useMemo(() => [
    {
      id: 'warehouse',
      title: 'Warehouse',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="warehouse" Component={WarehouseTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'purchase',
      title: 'Purchase Daily/Monthly',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="purchase" Component={PurchaseTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'pos',
      title: 'POS Daily/Monthly',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="pos" Component={POSTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'pos-vs-purchase',
      title: 'POS VS Purchase',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="pos-vs-purchase" Component={POSVsPurchaseTab} cache={tabContentCache.current} />
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
    router.push(`/pos/reports?tab=${tabId}`, { scroll: false })
  }

  return (
    <SmoothTab
      items={reportTabs}
      defaultTabId={activeTab}
      activeColor="bg-white dark:bg-gray-700 shadow-xs"
      onChange={handleTabChange}
      onTabPreload={handleTabPreload}
    />
  )
}
