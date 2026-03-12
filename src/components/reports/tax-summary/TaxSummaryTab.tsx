'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TaxSummaryFilters } from './TaxSummaryFilters'
import { TaxSummaryTable } from './TaxSummaryTable'
import { useTaxSummaryData } from './hooks/useTaxSummaryData'

function TaxSummaryTabComponent() {
  const {
    year,
    handleYearChange,
    monthList,
    incomeTaxes,
    expenseTaxes,
    dateRange,
  } = useTaxSummaryData()

  const handleReset = () => {
    handleYearChange(String(new Date().getFullYear()))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <TaxSummaryFilters
        year={year}
        onYearChange={handleYearChange}
        onApply={() => {}} // year change auto-triggers refetch via useEffect
        onReset={handleReset}
      />

      {/* Info Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card className="shadow-none">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Report</p>
              <p className="text-lg font-semibold">Tax Summary</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-lg font-semibold">{dateRange}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Tax Table */}
      <TaxSummaryTable
        title="Income"
        monthList={monthList}
        taxData={incomeTaxes}
        emptyMessage="Income tax not found"
      />

      {/* Expense Tax Table */}
      <TaxSummaryTable
        title="Expense"
        monthList={monthList}
        taxData={expenseTaxes}
        emptyMessage="Expense tax not found"
      />
    </div>
  )
}

export const TaxSummaryTab = memo(TaxSummaryTabComponent)
