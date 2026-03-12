'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { IncomeVsExpenseFilters } from './IncomeVsExpenseFilters'
import { IncomeVsExpenseChart } from './IncomeVsExpenseChart'
import { IncomeVsExpenseTable } from './IncomeVsExpenseTable'
import { useIncomeVsExpenseData } from './hooks/useIncomeVsExpenseData'

function IncomeVsExpenseTabComponent() {
  const {
    filters,
    handleFilterChange,
    monthList,
    revenueTotal,
    invoiceTotal,
    paymentTotal,
    billTotal,
    incomeTotal,
    expenseTotal,
    profitTotal,
    chartData,
    periodLabel,
  } = useIncomeVsExpenseData()

  const handleReset = () => {
    handleFilterChange('period', 'monthly')
    handleFilterChange('year', String(new Date().getFullYear()))
    handleFilterChange('category', 'All')
    handleFilterChange('customer', 'All')
    handleFilterChange('vendor', 'All')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <IncomeVsExpenseFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={() => {}} // filters auto-apply via useEffect
        onReset={handleReset}
      />

      {/* Info Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="shadow-none">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Report</p>
              <p className="text-lg font-semibold">Income vs Expense</p>
            </div>
          </CardContent>
        </Card>

        {filters.category !== 'All' && (
          <Card className="shadow-none">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-lg font-semibold">{filters.category}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {filters.customer !== 'All' && (
          <Card className="shadow-none">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="text-lg font-semibold">{filters.customer}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {filters.vendor !== 'All' && (
          <Card className="shadow-none">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="text-lg font-semibold">{filters.vendor}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-none">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-lg font-semibold">{periodLabel}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <IncomeVsExpenseChart data={chartData} period={filters.period} />

      {/* Table */}
      <IncomeVsExpenseTable
        monthList={monthList}
        revenueTotal={revenueTotal}
        invoiceTotal={invoiceTotal}
        paymentTotal={paymentTotal}
        billTotal={billTotal}
        incomeTotal={incomeTotal}
        expenseTotal={expenseTotal}
        profitTotal={profitTotal}
      />
    </div>
  )
}

export const IncomeVsExpenseTab = memo(IncomeVsExpenseTabComponent)
