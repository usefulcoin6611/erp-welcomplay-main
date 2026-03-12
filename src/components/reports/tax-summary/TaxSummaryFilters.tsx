'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RotateCcw, FileSpreadsheet, FileDown } from 'lucide-react'
import { yearList } from './constants'

interface TaxSummaryFiltersProps {
  year: string
  onYearChange: (value: string) => void
  onApply?: () => void
  onReset?: () => void
}

function TaxSummaryFiltersComponent({
  year,
  onYearChange,
  onApply,
  onReset,
}: TaxSummaryFiltersProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="px-4 py-2">
        <div className="flex flex-wrap lg:flex-nowrap items-end gap-3">
          {/* Year Filter */}
          <div className="w-full sm:w-32 shrink-0 space-y-1.5">
            <Label htmlFor="year" className="text-xs font-medium text-muted-foreground">
              Year
            </Label>
            <Select value={year} onValueChange={onYearChange}>
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

export const TaxSummaryFilters = memo(TaxSummaryFiltersComponent)
