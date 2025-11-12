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

export default function CrmDashboardPage() {
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <CRMStatsCards />
            
            {/* Lead Status and Deal Status */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CRMLeadStatus />
              <CRMDealStatus />
            </div>
            
            {/* Latest Contract */}
            <CRMLatestContract />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}