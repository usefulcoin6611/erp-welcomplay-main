'use client'

import { useEffect, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { CRMStatsCards } from '@/components/crm-stats-cards'
import { CRMLeadStatus } from '@/components/crm-lead-status'
import { CRMDealStatus } from '@/components/crm-deal-status'
import { CRMLatestContract } from '@/components/crm-latest-contract'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export type CRMDashboardData = {
  totalLead: number
  totalDeal: number
  totalContract: number
  leadByStage: { stage: string; count: number; percentage: number }[]
  dealByStage: { stage: string; count: number; percentage: number }[]
}

export default function CrmDashboardPage() {
  const [data, setData] = useState<CRMDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/crm-dashboard')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json?.success || !json?.data) return
        setData(json.data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

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
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <CRMStatsCards
              totalLead={data?.totalLead}
              totalDeal={data?.totalDeal}
              totalContract={data?.totalContract}
              loading={loading}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <CRMLeadStatus leadByStage={data?.leadByStage} loading={loading} />
              <CRMDealStatus dealByStage={data?.dealByStage} loading={loading} />
            </div>

            <CRMLatestContract />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}