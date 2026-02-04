"use client"

import React from 'react'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'
import { SystemSettingsTab } from './components/SystemSettingsTab'
import { SubscriptionPlanTab } from './components/SubscriptionPlanTab'
import { OrderTab } from './components/OrderTab'
import { ReferralProgramTab } from './components/ReferralProgramTab'

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const isCompany = user?.type === 'company'
  const tabParam = searchParams.get('tab')
  
  // Validasi tab: hanya user company yang bisa akses settings
  const companyTabs = ['system-settings', 'subscription-plan', 'order', 'referral-program']
  const isValidTab = isCompany && (!tabParam || companyTabs.includes(tabParam))
  const activeTab = isValidTab ? (tabParam || 'system-settings') : 'system-settings'

  // Redirect jika user bukan company atau tab tidak valid
  React.useEffect(() => {
    if (isLoading) return // Tunggu sampai user data dimuat

    if (!isCompany) {
      router.replace('/')
      return
    }
    if (!isValidTab && tabParam) {
      router.replace(`/settings?tab=system-settings`, { scroll: false })
    }
  }, [isLoading, isCompany, isValidTab, tabParam, router])

  const handleTabChange = (tabId: string) => {
    router.push(`/settings?tab=${tabId}`, { scroll: false })
  }

  const tabs = React.useMemo(
    () => {
      // Tampilkan 4 tab untuk user company
      if (isCompany) {
        return [
          {
            id: 'system-settings',
            title: 'System Settings',
            content: (
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <SystemSettingsTab />
              </Suspense>
            ),
          },
          {
            id: 'subscription-plan',
            title: 'Subscription Plan',
            content: (
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <SubscriptionPlanTab />
              </Suspense>
            ),
          },
          {
            id: 'order',
            title: 'Order',
            content: (
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <OrderTab />
              </Suspense>
            ),
          },
          {
            id: 'referral-program',
            title: 'Referral Program',
            content: (
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ReferralProgramTab />
              </Suspense>
            ),
          },
        ]
      }

      // Jika bukan company, tidak ada tab
      return []
    },
    [isCompany]
  )

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
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : isCompany && tabs.length > 0 ? (
              <SmoothTab
                items={tabs}
                value={activeTab}
                defaultTabId={activeTab}
                activeColor="bg-white dark:bg-gray-700 shadow-xs"
                onChange={handleTabChange}
              />
            ) : null}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
