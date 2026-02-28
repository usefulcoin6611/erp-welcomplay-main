'use client'

import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, RotateCcw, Search, FileSpreadsheet, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { availableStatuses, type BillStatus } from './constants'

interface BillSummaryFiltersProps {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  isDateRangeOpen: boolean
  setIsDateRangeOpen: (open: boolean) => void
  selectedVendor: string
  setSelectedVendor: (vendor: string) => void
  selectedStatus: BillStatus | 'all'
  setSelectedStatus: (status: BillStatus | 'all') => void
  onApply: () => void
  onReset: () => void
  vendorOptions?: string[]
}

export function BillSummaryFilters({
  dateRange,
  setDateRange,
  isDateRangeOpen,
  setIsDateRangeOpen,
  selectedVendor,
  setSelectedVendor,
  selectedStatus,
  setSelectedStatus,
  onApply,
  onReset,
  vendorOptions,
}: BillSummaryFiltersProps) {
  const dynamicVendors = vendorOptions || ['All']
  const dateRangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`
      : format(dateRange.from, 'LLL dd, y')
    : 'Pick a date range'

  return (
    <Card className="shadow-none">
      <CardContent className="px-4 py-2">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Date Range */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Date Range</Label>
            <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full h-9 justify-start text-left font-normal shadow-none hover:bg-blue-50 hover:text-blue-700 border-input',
                    !dateRange?.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRangeLabel}
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
                  <Button size="sm" className="w-full h-8 bg-blue-500 hover:bg-blue-600" onClick={() => setIsDateRangeOpen(false)}>
                    Select
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Vendor */}
          <div className="w-full lg:w-40 space-y-1.5">
            <Label htmlFor="vendor" className="text-xs font-medium text-muted-foreground">Vendor</Label>
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger id="vendor" className="h-9 w-full shadow-none">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                {dynamicVendors.map((vendor: string) => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="w-full lg:w-40 space-y-1.5">
            <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as BillStatus | 'all')}>
              <SelectTrigger id="status" className="h-9 w-full shadow-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {availableStatuses.slice(1).map((status: string) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
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
