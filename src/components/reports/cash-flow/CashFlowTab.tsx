'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { CashFlowFilters } from './CashFlowFilters'
import { CashFlowTable } from './CashFlowTable'
import { useCashFlowData } from './hooks/useCashFlowData'

function CashFlowTabComponent() {
  const {
    // Filter states
    selectedYear,
    setSelectedYear,
    viewType,
    setViewType,
    
    // Data
    cashFlowData,
    totalIncome,
    totalExpense,
    netProfit,
    summaryStats,
    
    // Handlers
    handleApplyFilters,
    handleReset,
  } = useCashFlowData()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Section */}
      <CashFlowFilters
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        viewType={viewType}
        setViewType={setViewType}
        onApply={handleApplyFilters}
        onReset={handleReset}
      />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Report Info Card */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Report</p>
              <p className="text-sm font-semibold">{viewType === 'monthly' ? 'Monthly' : 'Quarterly'} Cash Flow</p>
            </div>
          </CardContent>
        </Card>

        {/* Duration Card */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-semibold">Jan {selectedYear} - Dec {selectedYear}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total Income</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(summaryStats.yearTotalIncome)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Expense */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total Expense</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(summaryStats.yearTotalExpense)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Net Profit</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(summaryStats.yearNetProfit)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Avg Monthly Income */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Avg Monthly Income</p>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(summaryStats.avgMonthlyIncome)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Income Section */}
            <CashFlowTable
              title="Income"
              subtitle="Revenue :"
              categories={cashFlowData.revenue}
            />
            
            <CashFlowTable
              title=""
              subtitle="Invoice :"
              categories={cashFlowData.invoice}
              totalRow={{
                label: 'Total Income = Revenue + Invoice',
                data: totalIncome
              }}
            />

            {/* Expense Section */}
            <CashFlowTable
              title="Expense"
              subtitle="Payment :"
              categories={cashFlowData.payment}
              className="mt-8"
            />
            
            <CashFlowTable
              title=""
              subtitle="Bill :"
              categories={cashFlowData.bill}
              totalRow={{
                label: 'Total Expense = Payment + Bill',
                data: totalExpense
              }}
            />

            {/* Net Profit Section */}
            <div className="rounded-md border overflow-hidden mt-8">
              <table className="w-full">
                <thead className="bg-green-50 dark:bg-green-950">
                  <tr>
                    <td colSpan={13} className="px-3 py-2 text-sm font-semibold">
                      Net Profit = Total Income - Total Expense
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-green-100 dark:bg-green-900">
                    <td className="px-3 py-2 text-sm font-bold w-[200px]">Net Profit</td>
                    {netProfit.map((value, index) => (
                      <td key={index} className="px-3 py-2 text-sm text-right font-bold min-w-[100px]">
                        {formatCurrency(value)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const CashFlowTab = memo(CashFlowTabComponent)
