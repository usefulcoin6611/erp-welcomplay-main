'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { yearList } from './constants'

interface TaxSummaryFiltersProps {
  year: string
  onYearChange: (value: string) => void
}

function TaxSummaryFiltersComponent({
  year,
  onYearChange,
}: TaxSummaryFiltersProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="px-4 py-2">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Year Filter */}
          <div className="w-full lg:w-48 space-y-1.5">
            <Label htmlFor="year" className="text-xs font-medium text-muted-foreground">
              Year
            </Label>
            <Select value={year} onValueChange={onYearChange}>
              <SelectTrigger id="year" className="h-9 text-sm shadow-none">
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
        </div>
      </CardContent>
    </Card>
  )
}

export const TaxSummaryFilters = memo(TaxSummaryFiltersComponent)
