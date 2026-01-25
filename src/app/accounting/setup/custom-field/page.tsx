'use client'

import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

// NOTE: Import tabs directly (instead of via barrel `@/components/accounting-setup`) to avoid Turbopack export-eval issues.
const TaxesTab = lazy(() => import('@/components/accounting-setup/taxes-tab').then((m) => ({ default: m.TaxesTab })))
const CategoryTab = lazy(() => import('@/components/accounting-setup/category-tab').then((m) => ({ default: m.CategoryTab })))
const UnitTab = lazy(() => import('@/components/accounting-setup/unit-tab').then((m) => ({ default: m.UnitTab })))
const CustomFieldTab = lazy(() => import('@/components/accounting-setup/custom-field-tab').then((m) => ({ default: m.CustomFieldTab })))

const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[90px] w-full" />
    <Skeleton className="h-[380px] w-full" />
  </div>
)

export default function AccountingSetupTabsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const activeTab = searchParams.get('tab') || 'custom-field'
  const tabContentCache = useRef<{ [key: string]: React.ReactNode }>({})

  function TabContentWithCache({
    tabId,
    Component,
    cache,
  }: {
    tabId: string
    Component: React.ComponentType
    cache: any
  }) {
    const [mounted, setMounted] = useState(false)
    if (cache[tabId]) return cache[tabId]
    if (!mounted) {
      setMounted(true)
      cache[tabId] = <Component />
    }
    return <Component />
  }

  const setupTabs = useMemo(
    () => [
      {
        id: 'taxes',
        title: 'Taxes',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="taxes" Component={TaxesTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'category',
        title: 'Category',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="category" Component={CategoryTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'unit',
        title: 'Unit',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="unit" Component={UnitTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'custom-field',
        title: 'Custom Field',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache
              tabId="custom-field"
              Component={CustomFieldTab}
              cache={tabContentCache.current}
            />
          </Suspense>
        ),
      },
    ],
    [],
  )

  const handleTabChange = (tabId: string) => {
    router.push(`/accounting/setup/custom-field?tab=${tabId}`, { scroll: false })
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <SmoothTab
              items={setupTabs}
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


