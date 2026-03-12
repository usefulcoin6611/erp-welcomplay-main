'use client'

import { AppSidebar } from '@/components/app-sidebar'
import EmployeeTable from '@/components/employee-table'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export default function EmployeePage() {
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
          <div className="@container/main flex flex-1 flex-col gap-6 p-6 bg-gray-100">
            <EmployeeTable />
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}