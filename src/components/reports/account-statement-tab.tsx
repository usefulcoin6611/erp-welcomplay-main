'use client'

import React, { useMemo, useState, memo } from 'react'
import {
  ColumnDef,
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
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header'
import { DataGridPagination } from '@/components/ui/data-grid-pagination'
import { DataGridTable } from '@/components/ui/data-grid-table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { FileSpreadsheet, RotateCcw, Search as SearchIcon, Building2, Calendar as CalendarIcon, X, FileDown, FileText, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface AccountStatementData {
  id: number
  date: string
  amount: number
  description: string
  type: 'revenue' | 'payment'
}

interface AccountSummary {
  id: number
  holderName: string
  bankName?: string
  total: number
  type: 'revenue' | 'payment'
}

const mockStatementData: AccountStatementData[] = [
  { id: 1, date: '01 Nov, 2025', amount: 12500000, description: 'Payment from Acme Corporation', type: 'revenue' },
  { id: 2, date: '02 Nov, 2025', amount: -5500000, description: 'Payment to Office Supplies Co', type: 'payment' },
  { id: 3, date: '03 Nov, 2025', amount: 15200000, description: 'Invoice payment - Global Solutions', type: 'revenue' },
  { id: 4, date: '04 Nov, 2025', amount: -8900000, description: 'Marketing services payment', type: 'payment' },
  { id: 5, date: '05 Nov, 2025', amount: 9450000, description: 'Digital Ventures payment', type: 'revenue' },
]

const mockRevenueAccounts: AccountSummary[] = [
  { id: 1, holderName: 'Cash', total: 45000000, type: 'revenue' },
  { id: 2, holderName: 'John Doe', bankName: 'BCA', total: 125000000, type: 'revenue' },
  { id: 3, holderName: 'Jane Smith', bankName: 'Mandiri', total: 89000000, type: 'revenue' },
  { id: 4, holderName: '', bankName: 'Stripe / Paypal', total: 67000000, type: 'revenue' },
]

const mockPaymentAccounts: AccountSummary[] = [
  { id: 5, holderName: 'Cash', total: 32000000, type: 'payment' },
  { id: 6, holderName: 'Company Account', bankName: 'BNI', total: 95000000, type: 'payment' },
  { id: 7, holderName: 'Operations', bankName: 'BRI', total: 52000000, type: 'payment' },
]

export function AccountStatementTab() {
  const t = useTranslations('accountingReports.accountStatement')
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

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const columns = useMemo<ColumnDef<AccountStatementData>[]>(() => {
    return [
      {
        id: 'date',
        accessorFn: (row) => row.date,
        header: ({ column }) => <DataGridColumnHeader title={t('date')} column={column} />,
        cell: ({ row }) => <div className="font-medium pl-[0.375rem]">{row.original.date}</div>,
        enableSorting: true,
        size: 150,
        meta: { skeleton: <Skeleton className="h-5 w-[100px] ml-[0.375rem]" /> },
      },
      {
        id: 'amount',
        accessorFn: (row) => row.amount,
        header: ({ column }) => (
          <div className="flex justify-end w-full">
            <DataGridColumnHeader title={t('amount')} column={column} className="-mr-2" />
          </div>
        ),
        cell: ({ row }) => {
          const isNegative = row.original.amount < 0
          return (
            <div className={`text-right font-medium pr-2 ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
              {formatRupiah(row.original.amount)}
            </div>
          )
        },
        enableSorting: true,
        size: 180,
        meta: { skeleton: <Skeleton className="h-5 w-[120px] ml-auto -mr-2" />, cellClassName: 'text-right' },
      },
      {
        id: 'description',
        accessorFn: (row) => row.description,
        header: ({ column }) => <DataGridColumnHeader title={t('description')} column={column} />,
        cell: ({ row }) => <div className="pl-[0.375rem]">{row.original.description}</div>,
        enableSorting: false,
        size: 400,
        meta: { skeleton: <Skeleton className="h-5 w-[250px] ml-[0.375rem]" /> },
      },
    ]
  }, [t])

  const table = useReactTable({
    columns,
    data: mockStatementData,
    pageCount: Math.ceil(mockStatementData.length / pagination.pageSize),
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
              <Label className="text-xs font-medium text-muted-foreground">Date Range</Label>
              <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 justify-start text-left font-normal cursor-pointer shadow-none hover:bg-blue-50 hover:text-blue-600 border border-input",
                      !dateRange && "text-muted-foreground"
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
                      <span>Pick a date range</span>
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
                  />
                  <div className="p-3 border-t">
                    <Button 
                      size="sm" 
                      className="w-full h-8 bg-blue-500 hover:bg-blue-600"
                      onClick={() => setIsDateRangeOpen(false)}
                    >
                      Select
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
                Apply
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

      {/* Revenue Accounts */}
      <div>
        <h3 className="text-lg font-semibold text-foreground/80 mb-4">{t('revenueAccounts')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockRevenueAccounts.map((account) => (
            <Card key={account.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 shrink-0">
                    <Building2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1.5 truncate">
                      {account.holderName || 'Stripe / Paypal'}
                      {account.bankName && account.holderName && ` - ${account.bankName}`}
                    </p>
                    <p className="text-base font-bold text-green-600">{formatRupiah(account.total)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Accounts */}
      <div>
        <h3 className="text-lg font-semibold text-foreground/80 mb-4">{t('paymentAccounts')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockPaymentAccounts.map((account) => (
            <Card key={account.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 shrink-0">
                    <Building2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1.5 truncate">
                      {account.holderName || 'Stripe / Paypal'}
                      {account.bankName && account.holderName && ` - ${account.bankName}`}
                    </p>
                    <p className="text-base font-bold text-red-600">{formatRupiah(account.total)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <DataGrid table={table} recordCount={mockStatementData.length} tableLayout={{ cellBorder: true, dense: true }}>
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
