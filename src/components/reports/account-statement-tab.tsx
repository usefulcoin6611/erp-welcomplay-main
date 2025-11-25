'use client'

import React, { useMemo, useState, memo } from 'react'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { DateRange } from 'react-day-picker'
import { Card, CardContent, CardFooter, CardHeader, CardTable, CardTitle, CardToolbar } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { DataGrid } from '@/components/ui/data-grid'
import { DataGridPagination } from '@/components/ui/data-grid-pagination'
import { DataGridTable } from '@/components/ui/data-grid-table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { FileSpreadsheet, RotateCcw, Search as SearchIcon, Calendar as CalendarIcon, X, FileDown, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useAccountStatementData } from './account-statement/hooks'
import { getAccountStatementColumns } from './account-statement/columns'
import { RevenueAccountCard } from './account-statement/components/RevenueAccountCard'
import { PaymentAccountCard } from './account-statement/components/PaymentAccountCard'

export function AccountStatementTab() {
  const t = useTranslations('reports.accountStatement')
  const commonT = useTranslations('common')
  const headerT = useTranslations('header')

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 1),
    to: new Date(2025, 10, 30),
  })
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])

  // Use custom hook for data management
  const { statementData, revenueAccounts, paymentAccounts } = useAccountStatementData({
    searchQuery,
    selectedAccount,
    selectedCategory,
  })

  // Get columns
  const columns = useMemo(() => getAccountStatementColumns(t), [t])

  const table = useReactTable({
    columns,
    data: statementData,
    pageCount: Math.ceil(statementData.length / pagination.pageSize),
    getRowId: (row) => String(row.id),
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleReset = () => {
    setDateRange({
      from: new Date(2025, 5, 1),
      to: new Date(2025, 10, 30),
    })
    setSelectedAccount('all')
    setSelectedCategory('all')
    setSearchQuery('')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Section */}
      <Card className="shadow-none">
        <CardContent className="px-4 py-2">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            {/* Date Range */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('dateRange')}</Label>
              <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 justify-start text-left font-normal shadow-none hover:bg-blue-50 hover:text-blue-700 border-input",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>{t('pickDateRange')}</span>
                    )}
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

            {/* Account Select */}
            <div className="w-full lg:w-40 space-y-1.5">
              <Label htmlFor="account" className="text-xs font-medium text-muted-foreground">{t('account')}</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger id="account" className="h-9 w-full shadow-none">
                  <SelectValue placeholder={t('allAccounts')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allAccounts')}</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bca">BCA</SelectItem>
                  <SelectItem value="mandiri">Mandiri</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Select */}
            <div className="w-full lg:w-40 space-y-1.5">
              <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">{t('category')}</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category" className="h-9 w-full shadow-none">
                  <SelectValue placeholder={t('allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  <SelectItem value="revenue">{t('revenue')}</SelectItem>
                  <SelectItem value="payment">{t('payment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 lg:ml-auto">
              <Button
                size="sm"
                className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
              >
                <SearchIcon className="w-4 h-4" />
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

      {/* Revenue Accounts */}
      <div>
        <h3 className="text-lg font-semibold text-foreground/80 mb-4">{t('revenueAccounts')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueAccounts.map((account) => (
            <RevenueAccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>

      {/* Payment Accounts */}
      <div>
        <h3 className="text-lg font-semibold text-foreground/80 mb-4">{t('paymentAccounts')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentAccounts.map((account) => (
            <PaymentAccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <DataGrid table={table} recordCount={statementData.length} tableLayout={{ cellBorder: true, dense: true }}>
        <Card className="py-2">
          <CardHeader className="px-3 py-1.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-100">
                <FileText className="w-[18px] h-[18px] text-blue-500" />
              </div>
              <CardTitle className="text-sm">{t('transactions')}</CardTitle>
            </div>
            <CardToolbar className="relative w-full sm:w-auto flex items-center justify-end">
              <SearchIcon className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder={headerT('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 w-full sm:w-40 border-0 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 focus-visible:border-0 shadow-none transition-colors h-8"
              />
              {searchQuery.length > 0 && (
                <Button mode="icon" variant="ghost" className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setSearchQuery('')}>
                  <X />
                </Button>
              )}
            </CardToolbar>
          </CardHeader>
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter className="px-3 py-1.5">
            <div className="scale-90 origin-left w-full">
              <DataGridPagination />
            </div>
          </CardFooter>
        </Card>
      </DataGrid>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(AccountStatementTab)
