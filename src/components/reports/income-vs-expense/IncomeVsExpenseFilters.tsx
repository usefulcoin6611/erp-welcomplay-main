'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { IncomeVsExpenseFilter } from './constants'
import { periods, yearList, categories, customers, vendors } from './constants'

interface IncomeVsExpenseFiltersProps {
  filters: IncomeVsExpenseFilter
  onFilterChange: (key: keyof IncomeVsExpenseFilter, value: string) => void
}

function IncomeVsExpenseFiltersComponent({
  filters,
  onFilterChange,
}: IncomeVsExpenseFiltersProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="px-4 py-2">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
      {/* Period Filter */}
      <div className="w-full lg:w-48 space-y-1.5">
        <Label htmlFor="period" className="text-xs font-medium text-muted-foreground">
          Period
        </Label>
        <Select value={filters.period} onValueChange={(value) => onFilterChange('period', value)}>
          <SelectTrigger id="period" className="h-9 text-sm shadow-none">
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
        <div className="w-full lg:w-48 space-y-1.5">
          <Label htmlFor="year" className="text-xs font-medium text-muted-foreground">
            Year
          </Label>
          <Select value={filters.year} onValueChange={(value) => onFilterChange('year', value)}>
            <SelectTrigger id="year" className="h-9 text-sm shadow-none">
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
      <div className="w-full lg:w-40 space-y-1.5">
        <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">
          Category
        </Label>
        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange('category', value)}
        >
          <SelectTrigger id="category" className="h-9 text-sm shadow-none">
            <SelectValue placeholder="Select category" />
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
      <div className="w-full lg:w-40 space-y-1.5">
        <Label htmlFor="customer" className="text-xs font-medium text-muted-foreground">
          Customer
        </Label>
        <Select
          value={filters.customer}
          onValueChange={(value) => onFilterChange('customer', value)}
        >
          <SelectTrigger id="customer" className="h-9 text-sm shadow-none">
            <SelectValue placeholder="Select customer" />
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
      <div className="w-full lg:w-40 space-y-1.5">
        <Label htmlFor="vendor" className="text-xs font-medium text-muted-foreground">
          Vendor
        </Label>
        <Select
          value={filters.vendor}
          onValueChange={(value) => onFilterChange('vendor', value)}
        >
          <SelectTrigger id="vendor" className="h-9 text-sm shadow-none">
            <SelectValue placeholder="Select vendor" />
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
        </div>
      </CardContent>
    </Card>
  )
}

export const IncomeVsExpenseFilters = memo(IncomeVsExpenseFiltersComponent)
