import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { POSStatsCards } from '@/components/pos-stats-cards'
import { POSVsPurchaseChart } from '@/components/pos-vs-purchase-chart'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export default function PosDashboardPage() {
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
            <POSStatsCards />
            <POSVsPurchaseChart />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}