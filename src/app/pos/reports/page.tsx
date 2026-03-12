'use client'

import { useMemo, lazy, Suspense, useRef, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Download, Loader2 } from 'lucide-react'

const CARD_STYLE = 'shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]'

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
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    try {
      await new Promise((r) => setTimeout(r, 2000))
      console.log('Downloading', activeTab, 'report as PDF...')
    } catch (e) {
      console.error('Download failed:', e)
    } finally {
      setIsDownloading(false)
    }
  }, [activeTab])

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
    <div className="flex flex-col gap-4">
      <Card className={CARD_STYLE}>
        <CardContent className="px-6 pt-6 pb-6">
          <SmoothTab
            items={reportTabs}
            defaultTabId={activeTab}
            value={activeTab}
            activeColor="bg-white dark:bg-gray-700 shadow-xs"
            onChange={handleTabChange}
            onTabPreload={handleTabPreload}
            action={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      size="sm"
                      className="shrink-0 h-9 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download report as PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
