'use client'

import { RotateCcw, Search, FileDown, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { yearList, type ViewType } from './constants'
import { exportCashFlow } from '../utils/exportUtils'

interface CashFlowFiltersProps {
  selectedYear: string
  setSelectedYear: (year: string) => void
  viewType: ViewType
  setViewType: (type: ViewType) => void
  onApply: () => void
  onReset: () => void
  // Data for export
  cashFlowData?: {
    revenue: { id: string; category: string; data: number[] }[]
    invoice: { id: string; category: string; data: number[] }[]
    payment: { id: string; category: string; data: number[] }[]
    bill: { id: string; category: string; data: number[] }[]
  }
  monthLabels?: string[]
}

export function CashFlowFilters({
  selectedYear,
  setSelectedYear,
  viewType,
  setViewType,
  onApply,
  onReset,
  cashFlowData,
  monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}: CashFlowFiltersProps) {
  const handleExport = () => {
    if (!cashFlowData) return
    const allCategories = [
      ...cashFlowData.revenue,
      ...cashFlowData.invoice,
      ...cashFlowData.payment,
      ...cashFlowData.bill,
    ]
    exportCashFlow(allCategories, monthLabels, 'all', `cash-flow-${selectedYear}`)
  }
  return (
    <Card className="shadow-none">
      <CardContent className="px-4 py-2">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* View Type Tabs */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">View</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewType('monthly')}
                className={`h-9 px-4 shadow-none ${
                  viewType === 'monthly'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white hover:text-white border-blue-500 hover:border-blue-600'
                    : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                }`}
              >
                Monthly
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewType('quarterly')}
                className={`h-9 px-4 shadow-none ${
                  viewType === 'quarterly'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white hover:text-white border-blue-500 hover:border-blue-600'
                    : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                }`}
              >
                Quarterly
              </Button>
            </div>
          </div>

          {/* Year Filter */}
          <div className="w-full lg:w-40 space-y-1.5">
            <Label htmlFor="year" className="text-xs font-medium text-muted-foreground">Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year" className="h-9 w-full shadow-none">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {yearList.map((year: string) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:ml-auto">
            <Button
              size="sm"
              onClick={onApply}
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
            >
              <Search className="w-4 h-4" />
              Apply
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-9 px-3 shadow-none"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 shadow-none"
              onClick={handleExport}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export
            </Button>
            <Button
              size="sm"
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
              onClick={handleExport}
            >
              <FileDown className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
