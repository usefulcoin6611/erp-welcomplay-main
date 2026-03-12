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
import { availableAccounts, availableCategories } from './constants'

interface TransactionFiltersProps {
  startMonth: string
  setStartMonth: (month: string) => void
  endMonth: string
  setEndMonth: (month: string) => void
  selectedAccount: string
  setSelectedAccount: (account: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  onApply: () => void
  onReset: () => void
  accountOptions?: string[]
  categoryOptions?: string[]
}

export function TransactionFilters({
  startMonth,
  setStartMonth,
  endMonth,
  setEndMonth,
  selectedAccount,
  setSelectedAccount,
  selectedCategory,
  setSelectedCategory,
  onApply,
  onReset,
  accountOptions,
  categoryOptions,
}: TransactionFiltersProps) {
  const accounts = accountOptions || availableAccounts
  const categories = categoryOptions || availableCategories
  return (
    <Card className="shadow-none">
      <CardContent className="px-4 py-2">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Start Month */}
          <div className="w-full lg:w-48 space-y-1.5">
            <Label htmlFor="startMonth" className="text-xs font-medium text-muted-foreground">Start Month</Label>
            <input
              type="month"
              id="startMonth"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-none ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* End Month */}
          <div className="w-full lg:w-48 space-y-1.5">
            <Label htmlFor="endMonth" className="text-xs font-medium text-muted-foreground">End Month</Label>
            <input
              type="month"
              id="endMonth"
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-none ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Account */}
          <div className="w-full lg:w-48 space-y-1.5">
            <Label htmlFor="account" className="text-xs font-medium text-muted-foreground">Account</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger id="account" className="h-9 w-full shadow-none">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account: string) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="w-full lg:w-40 space-y-1.5">
            <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category" className="h-9 w-full shadow-none">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
