import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { CalendarIcon, Search, RotateCcw, FileSpreadsheet, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface SalesFiltersProps {
  onReset?: () => void
}

export function SalesFilters({ onReset }: SalesFiltersProps) {
  const t = useTranslations('reports.salesReport')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 1),
    to: new Date(2025, 6, 30),
  })
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)

  const handleReset = () => {
    setDateRange({
      from: new Date(2025, 5, 1),
      to: new Date(2025, 6, 30),
    })
    onReset?.()
  }

  const dateRangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`
      : format(dateRange.from, 'LLL dd, y')
    : t('pickDateRange')

  return (
    <Card>
      <CardContent className="px-4 py-2">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Date Range Picker */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('dateRange')}
            </Label>
            <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full h-9 justify-start text-left font-normal shadow-none hover:bg-blue-50 hover:text-blue-700 border-input',
                    !dateRange?.from && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span className="text-sm">{dateRangeLabel}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  required={false}
                />
                <div className="p-3 border-t">
                  <Button
                    size="sm"
                    className="w-full h-8 bg-blue-500 hover:bg-blue-600"
                    onClick={() => setIsDateRangeOpen(false)}
                  >
                    {t('select')}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 lg:ml-auto">
            <Button
              size="sm"
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
            >
              <Search className="w-4 h-4" />
              {t('apply')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
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
              {t('export')}
            </Button>
            <Button
              size="sm"
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
            >
              <FileDown className="w-4 h-4" />
              {t('download')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
