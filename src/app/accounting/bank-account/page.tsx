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
const AccountTab = lazy(() => import('@/components/accounting-bank').then(m => ({ default: m.AccountTab })))
const TransferTab = lazy(() => import('@/components/accounting-bank').then(m => ({ default: m.TransferTab })))

// Preload tab modules on hover/focus
const preloadTab = {
  'account': () => import('@/components/accounting-bank'),
  'transfer': () => import('@/components/accounting-bank'),
}

// Loading fallback component
const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

export default function BankingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default to 'account'
  const activeTab = searchParams.get('tab') || 'account'

  // Cache for tab content (to avoid Suspense fallback after first load)
  const tabContentCache = useRef<{[key: string]: React.ReactNode}>({})

  // Memoize banking tabs with lazy-loaded components wrapped in Suspense
  const bankingTabs = useMemo(() => [
    {
      id: 'account',
      title: 'Account',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="account" Component={AccountTab} cache={tabContentCache.current} />
        </Suspense>
      )
    },
    {
      id: 'transfer',
      title: 'Transfer',
      content: (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <TabContentWithCache tabId="transfer" Component={TransferTab} cache={tabContentCache.current} />
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
    router.push(`/accounting/bank-account?tab=${tabId}`, { scroll: false })
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
              items={bankingTabs}
              value={activeTab}
              defaultTabId={activeTab}
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
              onChange={handleTabChange}
              onTabPreload={handleTabPreload}
            />
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
 