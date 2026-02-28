import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AccountStatsCards } from '@/components/account-stats-cards'
import { IncomeVsExpenseCard } from '@/components/income-vs-expense-card'
import { AccountBalanceTable } from '@/components/account-balance-table'
import { IncomeExpenseChart } from '@/components/income-expense-chart'
import { LatestIncomeTable } from '@/components/latest-income-table'
import { LatestExpenseTable } from '@/components/latest-expense-table'
import { CashflowChart } from '@/components/cashflow-chart'
import { IncomeByCategoryChart } from '@/components/income-by-category-chart'
import { ExpenseByCategoryChart } from '@/components/expense-by-category-chart'
import { StorageLimitCard } from '@/components/storage-limit-card'
import { RecentInvoicesSection } from '@/components/recent-invoices-section'
import { InvoicesStatistics } from '@/components/invoices-statistics'
import { RecentBillsSection } from '@/components/recent-bills-section'
import { BillsStatistics } from '@/components/bills-statistics'
import { GoalSection } from '@/components/goal-section'

export default function AccountDashboardPage() {

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
          <div className="@container/main flex flex-1 flex-col gap-3 p-3">
            {/* Quick link to Accounting Reports */}
            <Card className="border-border/60 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Accounting</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/accounting/reports">Reports</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Top Section - Statistics Cards and Income Vs Expense Side by Side */}
            <div className="grid gap-3 xl:grid-cols-3">
              {/* Left Side - Statistics Cards */}
              <div className="xl:col-span-2">
                <AccountStatsCards />
              </div>
              
              {/* Right Side - Income Vs Expense */}
              <div className="xl:col-span-1">
                <IncomeVsExpenseCard />
              </div>
            </div>

            {/* Main Content Grid - 2 Column Layout */}
            <div className="grid gap-3 xl:grid-cols-3">
              {/* Left Column - Main Content - Account Balance, Income & Expense, Latest Income */}
              <div className="xl:col-span-2 space-y-3">
                {/* Account Balance */}
                <AccountBalanceTable />

                {/* Income & Expense Chart - Full Width */}
                <IncomeExpenseChart />
                
                {/* Latest Income Table - Full Width */}
                <LatestIncomeTable />

                {/* Latest Expense Table - Full Width */}
                <LatestExpenseTable />
              </div>
              
              {/* Right Column - Sidebar */}
              <div className="xl:col-span-1 space-y-3">
                {/* Cashflow */}
                <CashflowChart />

                {/* Income By Category Donut Chart */}
                <IncomeByCategoryChart />

                {/* Expense By Category Donut Chart */}
                <ExpenseByCategoryChart />

                {/* Storage Limit */}
                <StorageLimitCard />
              </div>
            </div>

            {/* Bottom Section - Recent Invoices with Statistics */}
            <div className="grid gap-3 xl:grid-cols-3">
              <RecentInvoicesSection />
              <InvoicesStatistics />
            </div>

            {/* Recent Bills with Statistics */}
            <div className="grid gap-3 xl:grid-cols-3">
              <RecentBillsSection />
              <BillsStatistics />
            </div>

            {/* Goal Section */}
            <GoalSection />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}