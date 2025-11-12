'use client'

import React from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, TrendingUp, DollarSign, Users } from 'lucide-react'

export default function InvoiceSummaryPage() {
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
            <div>
              <h1 className="text-2xl font-bold text-[color:var(--foreground)]">Invoice Summary</h1>
              <p className="text-sm mt-1 text-[color:var(--muted-foreground)]">Overview of all invoices</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[color:var(--foreground)]">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[color:var(--foreground)]">245</div>
                  <p className="text-xs text-[color:var(--muted-foreground)]">+20% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[color:var(--foreground)]">Total Amount</CardTitle>
                  <DollarSign className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[color:var(--foreground)]">Rp 125,000,000</div>
                  <p className="text-xs text-[color:var(--muted-foreground)]">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[color:var(--foreground)]">Paid Invoices</CardTitle>
                  <TrendingUp className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[color:var(--foreground)]">189</div>
                  <p className="text-xs text-[color:var(--muted-foreground)]">77% payment rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[color:var(--foreground)]">Active Customers</CardTitle>
                  <Users className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[color:var(--foreground)]">48</div>
                  <p className="text-xs text-[color:var(--muted-foreground)]">+5 new this month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed invoice summary features are under development. 
                  This will include invoice status breakdown, payment timeline, and customer analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
