'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { POSStatsCards, type POSDashboardStats } from '@/components/pos-stats-cards'
import { POSVsPurchaseChart, type POSDashboardChartPoint } from '@/components/pos-vs-purchase-chart'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

type DashboardData = {
  stats: POSDashboardStats | null
  chartData: POSDashboardChartPoint[] | null
}

export default function PosDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pos-dashboard')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data) {
          setData({
            stats: json.data.stats ?? null,
            chartData: Array.isArray(json.data.chartData) ? json.data.chartData : null,
          })
        } else {
          setData({ stats: null, chartData: null })
        }
      })
      .catch(() => setData({ stats: null, chartData: null }))
      .finally(() => setLoading(false))
  }, [])

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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <POSStatsCards stats={data?.stats ?? undefined} />
                <POSVsPurchaseChart chartData={data?.chartData ?? undefined} />
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}