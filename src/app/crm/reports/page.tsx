'use client'

import { useMemo, lazy, Suspense, useRef, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Download, Loader2 } from 'lucide-react'

// Lazy load tab components for better performance
const LeadTab = lazy(() => import('@/components/crm-reports').then(m => ({ default: m.LeadTab })))
const DealTab = lazy(() => import('@/components/crm-reports').then(m => ({ default: m.DealTab })))

// Preload tab modules on hover/focus
const preloadTab = {
  'lead': () => import('@/components/crm-reports'),
  'deal': () => import('@/components/crm-reports'),
}

// Loading fallback component
const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

export default function CRMReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default to 'lead'
  const activeTab = searchParams.get('tab') || 'lead'
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    try {
      await new Promise((r) => setTimeout(r, 2000))
      if (activeTab === 'lead') {
        console.log('Downloading lead report as PDF...')
      } else {
        console.log('Downloading deal report as PDF...')
      }
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }, [activeTab])

  // Cache for tab content (to avoid Suspense fallback after first load)
  const tabContentCache = useRef<{[key: string]: React.ReactNode}>({})

  // Memoize report tabs with lazy-loaded components wrapped in Suspense
  const reportTabs = useMemo(() => [
    {
      id: 'lead',
      title: 'Lead',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="lead" Component={LeadTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'deal',
      title: 'Deal',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="deal" Component={DealTab} cache={tabContentCache.current} />
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
    router.push(`/crm/reports?tab=${tabId}`, { scroll: false })
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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-5 p-5">
            {/* Smooth Tab Navigation with Download inline */}
            <SmoothTab
              items={reportTabs}
              defaultTabId={activeTab}
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
