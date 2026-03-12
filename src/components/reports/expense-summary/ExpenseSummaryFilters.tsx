'use client'

import { memo } from 'react'
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
import { Search, RotateCcw, FileDown, FileSpreadsheet } from 'lucide-react'
import { periods, yearList } from './constants'

interface ExpenseSummaryFiltersProps {
  period: string
  setPeriod: (value: string) => void
  year: string
  setYear: (value: string) => void
  category: string
  setCategory: (value: string) => void
  vendor: string
  setVendor: (value: string) => void
  categoryOptions: string[]
  vendorOptions: string[]
  onApply: () => void
  onReset: () => void
}

function ExpenseSummaryFiltersComponent({
  period,
  setPeriod,
  year,
  setYear,
  category,
  setCategory,
  vendor,
  setVendor,
  categoryOptions,
  vendorOptions,
  onApply,
  onReset,
}: ExpenseSummaryFiltersProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="px-4 py-2">
        <div className="flex flex-wrap lg:flex-nowrap items-end gap-3">
          {/* Period Select */}
          <div className="w-full sm:w-44 shrink-0 space-y-1.5">
            <Label htmlFor="period" className="text-xs font-medium text-muted-foreground">
              Period
            </Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger id="period" className="h-9 text-sm shadow-none w-full">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="text-sm">
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Select - Hide when yearly is selected */}
          {period !== 'yearly' && (
            <div className="w-full sm:w-32 shrink-0 space-y-1.5">
              <Label htmlFor="year" className="text-xs font-medium text-muted-foreground">
                Year
              </Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year" className="h-9 text-sm shadow-none w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearList.map((y) => (
                    <SelectItem key={y} value={y} className="text-sm">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Select */}
          <div className="w-full sm:w-40 shrink-0 space-y-1.5">
            <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="h-9 text-sm shadow-none w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-sm">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vendor Select */}
          <div className="w-full sm:w-44 shrink-0 space-y-1.5">
            <Label htmlFor="vendor" className="text-xs font-medium text-muted-foreground">
              Vendor
            </Label>
            <Select value={vendor} onValueChange={setVendor}>
              <SelectTrigger id="vendor" className="h-9 text-sm shadow-none w-full">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                {vendorOptions.map((ven) => (
                  <SelectItem key={ven} value={ven} className="text-sm">
                    {ven}
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

export const ExpenseSummaryFilters = memo(ExpenseSummaryFiltersComponent)
