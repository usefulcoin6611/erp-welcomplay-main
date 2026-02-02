'use client'

import { useMemo, lazy, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'

const preloadTab = {
  award: () => import('@/components/hrm-admin').then((mod) => mod.AwardTab),
  transfer: () => import('@/components/hrm-admin').then((mod) => mod.TransferTab),
  resignation: () => import('@/components/hrm-admin').then((mod) => mod.ResignationTab),
  travel: () => import('@/components/hrm-admin').then((mod) => mod.TravelTab),
  promotion: () => import('@/components/hrm-admin').then((mod) => mod.PromotionTab),
  complaints: () => import('@/components/hrm-admin').then((mod) => mod.ComplaintsTab),
  warning: () => import('@/components/hrm-admin').then((mod) => mod.WarningTab),
  termination: () => import('@/components/hrm-admin').then((mod) => mod.TerminationTab),
  announcement: () => import('@/components/hrm-admin').then((mod) => mod.AnnouncementTab),
  holidays: () => import('@/components/hrm-admin').then((mod) => mod.HolidaysTab),
}

const AwardTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.AwardTab })))
const TransferTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.TransferTab })))
const ResignationTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.ResignationTab })))
const TravelTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.TravelTab })))
const PromotionTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.PromotionTab })))
const ComplaintsTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.ComplaintsTab })))
const WarningTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.WarningTab })))
const TerminationTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.TerminationTab })))
const AnnouncementTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.AnnouncementTab })))
const HolidaysTab = lazy(() => import('@/components/hrm-admin').then((mod) => ({ default: mod.HolidaysTab })))

const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

function TabContentWithCache({
  tabId,
  Component,
  cache,
}: {
  tabId: string
  Component: React.ComponentType
  cache: { [key: string]: React.ReactNode }
}) {
  if (!cache[tabId]) {
    cache[tabId] = <Component />
  }
  return <>{cache[tabId]}</>
}

export default function HRAdminSetupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'award'
  const tabContentCache = useRef<{ [key: string]: React.ReactNode }>({})

  const adminTabs = useMemo(
    () => [
      { id: 'award', title: 'Award', content: <Suspense fallback={<TabLoadingSkeleton />}><TabContentWithCache tabId="award" Component={AwardTab} cache={tabContentCache.current} /></Suspense> },
      { id: 'transfer', title: 'Transfer', content: <Suspense fallback={<TabLoadingSkeleton />}><TabContentWithCache tabId="transfer" Component={TransferTab} cache={tabContentCache.current} /></Suspense> },
      { id: 'resignation', title: 'Resignation', content: <Suspense fallback={<TabLoadingSkeleton />}><TabContentWithCache tabId="resignation" Component={ResignationTab} cache={tabContentCache.current} /></Suspense> },
      { id: 'travel', title: 'Travel', content: <Suspense fallback={<TabLoadingSkeleton />}><TabContentWithCache tabId="travel" Component={TravelTab} cache={tabContentCache.current} /></Suspense> },
      { id: 'promotion', title: 'Promotion', content: <Suspense fallback={<TabLoadingSkeleton />}><TabContentWithCache tabId="promotion" Component={PromotionTab} cache={tabContentCache.current} /></Suspense> },
      { id: 'complaints', title: 'Complaints', content: <Suspense fallback={<TabLoadingSkeleton />}><TabContentWithCache tabId="complaints" Component={ComplaintsTab} cache={tabContentCache.current} /></Suspense> },
      { id: 'warning', title: 'Warning', content: <Suspense fallback={<TabLoadingSkeleton />}><TabContentWithCache tabId="warning" Component={WarningTab} cache={tabContentCache.current} /></Suspense> },
      { id: 'termination', title: 'Termination', content: <Suspense fallback={<TabLoadingSkeleton />}><TabContentWithCache tabId="termination" Component={TerminationTab} cache={tabContentCache.current} /></Suspense> },
      { id: 'announcement', title: 'Announcement', content: <Suspense fallback={<TabLoadingSkeleton />}><TabContentWithCache tabId="announcement" Component={AnnouncementTab} cache={tabContentCache.current} /></Suspense> },
      { id: 'holidays', title: 'Holidays', content: <Suspense fallback={<TabLoadingSkeleton />}><TabContentWithCache tabId="holidays" Component={HolidaysTab} cache={tabContentCache.current} /></Suspense> },
    ],
    []
  )

  const handleTabChange = (tabId: string) => {
    router.push(`/hrm/admin?tab=${tabId}`, { scroll: false })
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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <Card className="rounded-lg border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <CardHeader className="px-6">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-semibold">HR Admin Setup</CardTitle>
                  <CardDescription>
                    Kelola Award, Transfer, Resignation, Trip, Promotion, Complaints, Warning, Termination, Announcement, dan Holidays.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
              <CardContent className="px-6 pt-4 pb-6">
                <SmoothTab
                  items={adminTabs}
                  value={activeTab}
                  defaultTabId={activeTab}
                  activeColor="bg-white dark:bg-gray-700 shadow-xs"
                  onChange={handleTabChange}
                  onTabPreload={(tabId) => {
                    const preload = preloadTab[tabId as keyof typeof preloadTab]
                    if (preload) preload()
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
