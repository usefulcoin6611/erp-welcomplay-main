"use client"

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { SystemSettingsTab } from './components/SystemSettingsTab'
import { SubscriptionPlanTab } from './components/SubscriptionPlanTab'
import { ReferralProgramTab } from './components/ReferralProgramTab'
import { OrderTab } from './components/OrderTab'

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam || 'system-settings'

  const settingsTabs = useMemo(
    () => [
      {
        id: 'system-settings',
        title: 'System Setting',
        content: <SystemSettingsTab />,
      },
      {
        id: 'subscription-plan',
        title: 'Setup Subscription Plan',
        content: <SubscriptionPlanTab />,
      },
      {
        id: 'referral-program',
        title: 'Referral Program',
        content: <ReferralProgramTab />,
      },
      {
        id: 'order',
        title: 'Order',
        content: <OrderTab />,
      },
    ],
    []
  )

  // Handle tab change - update URL query params
  const handleTabChange = (tabId: string) => {
    router.push(`/settings?tab=${tabId}`, { scroll: false })
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
            {/* Smooth Tab Navigation */}
            <SmoothTab
              items={settingsTabs}
              defaultTabId={activeTab}
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
              onChange={handleTabChange}
            />
          </div>
        </div>
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
