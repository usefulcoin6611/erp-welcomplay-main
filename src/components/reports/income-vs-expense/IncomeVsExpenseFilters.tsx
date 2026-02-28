'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RotateCcw, FileSpreadsheet, FileDown } from 'lucide-react'
import type { IncomeVsExpenseFilter } from './constants'
import { periods, yearList, categories, customers, vendors } from './constants'

interface IncomeVsExpenseFiltersProps {
  filters: IncomeVsExpenseFilter
  onFilterChange: (key: keyof IncomeVsExpenseFilter, value: string) => void
  onApply?: () => void
  onReset?: () => void
}

function IncomeVsExpenseFiltersComponent({
  filters,
  onFilterChange,
  onApply,
  onReset,
}: IncomeVsExpenseFiltersProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="px-4 py-2">
        <div className="flex flex-wrap lg:flex-nowrap items-end gap-3">
          {/* Period Filter */}
          <div className="w-full sm:w-44 shrink-0 space-y-1.5">
            <Label htmlFor="period" className="text-xs font-medium text-muted-foreground">
              Period
            </Label>
            <Select value={filters.period} onValueChange={(value) => onFilterChange('period', value)}>
              <SelectTrigger id="period" className="h-9 text-sm shadow-none w-full">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value} className="text-sm">
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter - Hidden on yearly period */}
          {filters.period !== 'yearly' && (
            <div className="w-full sm:w-32 shrink-0 space-y-1.5">
              <Label htmlFor="year" className="text-xs font-medium text-muted-foreground">
                Year
              </Label>
              <Select value={filters.year} onValueChange={(value) => onFilterChange('year', value)}>
                <SelectTrigger id="year" className="h-9 text-sm shadow-none w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearList.map((year) => (
                    <SelectItem key={year} value={year} className="text-sm">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Filter */}
          <div className="w-full sm:w-40 shrink-0 space-y-1.5">
            <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">
              Category
            </Label>
            <Select
              value={filters.category}
              onValueChange={(value) => onFilterChange('category', value)}
            >
              <SelectTrigger id="category" className="h-9 text-sm shadow-none w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-sm">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Filter */}
          <div className="w-full sm:w-40 shrink-0 space-y-1.5">
            <Label htmlFor="customer" className="text-xs font-medium text-muted-foreground">
              Customer
            </Label>
            <Select
              value={filters.customer}
              onValueChange={(value) => onFilterChange('customer', value)}
            >
              <SelectTrigger id="customer" className="h-9 text-sm shadow-none w-full">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer} value={customer} className="text-sm">
                    {customer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vendor Filter */}
          <div className="w-full sm:w-40 shrink-0 space-y-1.5">
            <Label htmlFor="vendor" className="text-xs font-medium text-muted-foreground">
              Vendor
            </Label>
            <Select
              value={filters.vendor}
              onValueChange={(value) => onFilterChange('vendor', value)}
            >
              <SelectTrigger id="vendor" className="h-9 text-sm shadow-none w-full">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor} value={vendor} className="text-sm">
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
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
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export
            </Button>
            <Button
              size="sm"
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
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

export const IncomeVsExpenseFilters = memo(IncomeVsExpenseFiltersComponent)
