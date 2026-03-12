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
import { exportSalesByItem, exportSalesByCustomer } from '../utils/exportUtils'

interface SalesFiltersProps {
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
  onApply?: () => void
  onReset?: () => void
  // Data for export
  selectedTab?: string
  itemsData?: any[]
  customersData?: any[]
}

export function SalesFilters({
  dateRange,
  onDateRangeChange,
  onApply,
  onReset,
  selectedTab = 'items',
  itemsData = [],
  customersData = [],
}: SalesFiltersProps) {
  const t = useTranslations('reports.salesReport')

  const dateRangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`
      : format(dateRange.from, 'LLL dd, y')
    : t('pickDateRange')

  const handleExport = () => {
    if (selectedTab === 'items') {
      exportSalesByItem(itemsData, 'sales-by-item')
    } else {
      exportSalesByCustomer(customersData, 'sales-by-customer')
    }
  }

  const handleDownload = () => {
    // Download as CSV (same as export for CSV format)
    handleExport()
  }

  return (
    <Card>
      <CardContent className="px-4 py-2">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Date Range Picker */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('dateRange')}
            </Label>
            <Popover>
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
                  onSelect={onDateRangeChange}
                  numberOfMonths={2}
                  required={false}
                />
                <div className="p-3 border-t">
                  <Button
                    size="sm"
                    className="w-full h-8 bg-blue-500 hover:bg-blue-600"
                    onClick={onApply}
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
              onClick={onApply}
            >
              <Search className="w-4 h-4" />
              {t('apply')}
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
              {t('export')}
            </Button>
            <Button
              size="sm"
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
              onClick={handleDownload}
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
