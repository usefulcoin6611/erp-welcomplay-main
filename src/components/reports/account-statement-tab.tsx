'use client'

import React, { useEffect, useMemo, useState, memo } from 'react'
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
import { formatRupiah } from './utils/formatCurrency'

function toCsvValue(value: string | number) {
  const str = String(value ?? '')
  if (str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  if (str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`
  }
  return str
}

function downloadCsv(rows: (string | number)[][], filename: string) {
  if (typeof window === 'undefined' || !rows.length) return
  const csv = rows.map((row) => row.map(toCsvValue).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function getDefaultDateRange(): DateRange {
  const today = new Date()
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const from = new Date(currentMonthStart)
  from.setMonth(from.getMonth() - 5)
  const to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { from, to }
}

export function AccountStatementTab() {
  const t = useTranslations('reports.accountStatement')
  const commonT = useTranslations('common')
  const headerT = useTranslations('header')

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getDefaultDateRange())
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
  const [accountOptions, setAccountOptions] = useState<{ id: string; chartAccountId: string; label: string }[]>([])

  const startDate = useMemo(() => {
    if (!dateRange?.from) return undefined
    const from = dateRange.from
    const monthStart = new Date(from.getFullYear(), from.getMonth(), 1)
    return format(monthStart, 'yyyy-MM-dd')
  }, [dateRange])

  const endDate = useMemo(() => {
    if (!dateRange?.from) return undefined
    const to = dateRange.to ?? dateRange.from
    const monthEnd = new Date(to.getFullYear(), to.getMonth() + 1, 0)
    return format(monthEnd, 'yyyy-MM-dd')
  }, [dateRange])

  const durationLabel = useMemo(() => {
    if (!dateRange?.from) return ''
    const fromLabel = format(dateRange.from, 'LLL yyyy')
    const toDate = dateRange.to ?? dateRange.from
    const toLabel = format(toDate, 'LLL yyyy')
    return `${fromLabel} to ${toLabel}`
  }, [dateRange])

  // Use custom hook for data management
  const { statementData, revenueAccounts, paymentAccounts } = useAccountStatementData({
    searchQuery,
    selectedAccount,
    selectedCategory,
    startDate,
    endDate,
  })

  const totalCash = useMemo(() => {
    if (!statementData.length) return 0
    return statementData.reduce((acc, item) => {
      if (item.type === 'revenue') return acc + item.amount
      if (item.type === 'payment') return acc - item.amount
      return acc
    }, 0)
  }, [statementData])

  const selectedAccountLabel = useMemo(() => {
    if (selectedAccount === 'all') return ''
    const option = accountOptions.find((o) => o.id === selectedAccount)
    return option?.label ?? selectedAccount
  }, [selectedAccount, accountOptions])

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return ''
    if (selectedCategory === 'revenue') return t('revenue')
    if (selectedCategory === 'payment') return t('payment')
    return selectedCategory
  }, [selectedCategory, t])

  useEffect(() => {
    let cancelled = false

    const loadAccounts = async () => {
      try {
        const res = await fetch('/api/bank-accounts', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        if (!json?.success || !Array.isArray(json.data)) return
        const list = (json.data as any[]).map((b) => {
          const id = String(b.id)
          const chartAccountId = String(b.chartAccountId)
          const label = b.bank ? `${b.name} - ${b.bank}` : String(b.name)
          return { id, chartAccountId, label }
        })
        if (!cancelled) {
          const sorted = list.sort((a, b) => a.label.localeCompare(b.label))
          setAccountOptions(sorted)
        }
      } catch {
      }
    }

    loadAccounts()

    return () => {
      cancelled = true
    }
  }, [])

  const handleExport = () => {
    if (!statementData.length) return
    const header = [t('date'), t('description'), t('amount'), t('type')]
    const rows: (string | number)[][] = [header]
    for (const item of statementData) {
      rows.push([item.date, item.description, item.amount, item.type])
    }
    const filename = `account_statement_${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(rows, filename)
  }

  const handleDownload = () => {
    const header = [t('category'), t('account'), t('report'), t('amount')]
    const rows: (string | number)[][] = [header]
    for (const acc of revenueAccounts) {
      const label = acc.bankName ? `${acc.holderName} - ${acc.bankName}` : acc.holderName
      rows.push([t('revenue'), label, t('revenueAccounts'), acc.total])
    }
    for (const acc of paymentAccounts) {
      const label = acc.bankName ? `${acc.holderName} - ${acc.bankName}` : acc.holderName
      rows.push([t('payment'), label, t('paymentAccounts'), acc.total])
    }
    if (rows.length <= 1) return
    const filename = `account_statement_summary_${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(rows, filename)
  }

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
    setDateRange(getDefaultDateRange())
    setSelectedAccount('all')
    setSelectedCategory('all')
    setSearchQuery('')
  }

  type SummaryCardProps = {
    icon: React.ReactNode
    label: string
    value: string
  }

  function SummaryCard({ icon, label, value }: SummaryCardProps) {
    return (
      <Card className="h-full shadow-none">
        <CardContent className="px-0 py-1.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-blue-500">
              <div className="text-white">{icon}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
              <p className="text-sm text-foreground truncate">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
                  {accountOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
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

      <Card className="shadow-none">
        <CardContent className="px-3 py-1.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={<FileText className="w-4 h-4" />}
              label={t('report')}
              value={t('accountStatementSummary')}
            />
            {selectedAccountLabel && (
              <SummaryCard
                icon={<FileText className="w-4 h-4" />}
                label={t('account')}
                value={selectedAccountLabel}
              />
            )}
            {selectedCategoryLabel && (
              <SummaryCard
                icon={<FileText className="w-4 h-4" />}
                label={t('category')}
                value={selectedCategoryLabel}
              />
            )}
            <SummaryCard
              icon={<CalendarIcon className="w-4 h-4" />}
              label={t('duration')}
              value={durationLabel}
            />
            <SummaryCard
              icon={<FileSpreadsheet className="w-4 h-4" />}
              label={t('totalCash')}
              value={formatRupiah(totalCash)}
            />
          </div>
        </CardContent>
      </Card>

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
