'use client'

import { memo } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { FileText, Calendar, Hash, Building2 } from 'lucide-react'
import { ExpenseSummaryFilters } from './ExpenseSummaryFilters'
import { ExpenseSummaryChart } from './ExpenseSummaryChart'
import { ExpenseSummaryTable } from './ExpenseSummaryTable'
import { useExpenseSummaryData } from './hooks/useExpenseSummaryData'

function ExpenseSummaryTabComponent() {
  const {
    // Filter states
    period,
    setPeriod,
    year,
    setYear,
    category,
    setCategory,
    vendor,
    setVendor,

    // Data
    paymentData,
    billData,
    totalExpense,
    monthLabels,

    // Handlers
    handleApplyFilters,
    handleReset,
    formatDateRange,
  } = useExpenseSummaryData()

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Section */}
      <ExpenseSummaryFilters
        period={period}
        setPeriod={setPeriod}
        year={year}
        setYear={setYear}
        category={category}
        setCategory={setCategory}
        vendor={vendor}
        setVendor={setVendor}
        onApply={handleApplyFilters}
        onReset={handleReset}
      />

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Report Info Card */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3 h-full">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 shrink-0">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Report :</p>
              <p className="text-sm font-semibold truncate">Expense Summary</p>
            </div>
          </CardContent>
        </Card>

        {/* Category Info Card - Conditional */}
        {category !== 'All' && (
          <Card className="shadow-none">
            <CardContent className="px-3 py-2 flex items-center gap-3 h-full">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 shrink-0">
                <Hash className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Category :</p>
                <p className="text-sm font-semibold truncate">{category}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendor Info Card - Conditional */}
        {vendor !== 'All' && (
          <Card className="shadow-none">
            <CardContent className="px-3 py-2 flex items-center gap-3 h-full">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 shrink-0">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Vendor :</p>
                <p className="text-sm font-semibold truncate">{vendor}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Duration Card - Always visible */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3 h-full">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 shrink-0">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Duration :</p>
              <p className="text-sm font-semibold truncate">{formatDateRange()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="shadow-none">
        <CardContent className="pt-4 pb-4">
          <ExpenseSummaryChart data={totalExpense} labels={monthLabels} />
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="shadow-none">
        <div className="pt-4 pb-0">
          <div className="px-6 mb-3">
            <CardTitle className="text-base">Expense Details</CardTitle>
          </div>
        </div>

        <CardContent className="pt-0 px-6 pb-4">
          <ExpenseSummaryTable
            paymentData={paymentData}
            billData={billData}
            totalData={totalExpense}
            monthLabels={monthLabels}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export const ExpenseSummaryTab = memo(ExpenseSummaryTabComponent)
