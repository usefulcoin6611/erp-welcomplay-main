'use client'

import { RotateCcw, Search, FileSpreadsheet, FileDown } from 'lucide-react'
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
import { availableCategories, availableStatuses, type StockStatus } from './constants'

interface ProductStockFiltersProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedStatus: StockStatus
  setSelectedStatus: (status: StockStatus) => void
  onApply: () => void
  onReset: () => void
}

export function ProductStockFilters({
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  onApply,
  onReset,
}: ProductStockFiltersProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="px-4 py-2">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Category */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category" className="h-9 w-full shadow-none">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="w-full lg:w-40 space-y-1.5">
            <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as StockStatus)}>
              <SelectTrigger id="status" className="h-9 w-full shadow-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {availableStatuses.slice(1).map((status: string) => (
                  <SelectItem key={status} value={status}>
                    {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
