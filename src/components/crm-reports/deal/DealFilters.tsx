'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from 'lucide-react'
import { RotateCcw, Download, FileDown } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DEAL_STAGE_OPTIONS, DEAL_PRIORITY_OPTIONS } from './constants'
import type { DealFiltersType } from './constants'

interface DealFiltersProps {
  filters: DealFiltersType
  onFilterChange: (key: keyof DealFiltersType, value: any) => void
  onApply: () => void
  onReset: () => void
  onDownload: () => void
  onExport: () => void
  isLoading: boolean
}

// Month/Year selector component
function MonthYearSelector({ 
  value, 
  onChange 
}: { 
  value: { month: string; year: string }
  onChange: (value: { month: string; year: string }) => void 
}) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())
  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ]

  const selectedMonth = months.find(m => m.value === value.month)?.label || 'Pilih Bulan'
  const displayText = `${selectedMonth} ${value.year}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Bulan</Label>
            <Select value={value.month} onValueChange={(val) => onChange({ ...value, month: val })}>
              <SelectTrigger className="bg-blue-500 text-white hover:bg-blue-600">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Tahun</Label>
            <Select value={value.year} onValueChange={(val) => onChange({ ...value, year: val })}>
              <SelectTrigger className="bg-blue-500 text-white hover:bg-blue-600">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DealFilters({
  filters,
  onFilterChange,
  onApply,
  onReset,
  onDownload,
  onExport,
  isLoading,
}: DealFiltersProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-4">
        {/* Filter Row */}
        <div className="flex flex-wrap gap-4">
          {/* Month and Year */}
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="month" className="mb-2 block text-sm">
              Bulan dan Tahun
            </Label>
            <MonthYearSelector
              value={filters.period}
              onChange={(val) => onFilterChange('period', val)}
            />
          </div>

          {/* Stage */}
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="stage" className="mb-2 block text-sm">
              Tahapan
            </Label>
            <Select
              value={filters.stage}
              onValueChange={(value) => onFilterChange('stage', value)}
            >
              <SelectTrigger id="stage">
                <SelectValue placeholder="Pilih Tahapan" />
              </SelectTrigger>
              <SelectContent>
                {DEAL_STAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="priority" className="mb-2 block text-sm">
              Prioritas
            </Label>
            <Select
              value={filters.priority}
              onValueChange={(value) => onFilterChange('priority', value)}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Pilih Prioritas" />
              </SelectTrigger>
              <SelectContent>
                {DEAL_PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onApply}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Terapkan
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onReset}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Filter</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onDownload}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Unduh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onExport} disabled={isLoading}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export ke Excel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
