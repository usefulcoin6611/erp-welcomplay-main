'use client'

import React, { useMemo, useState } from 'react'
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
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
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
import { Download, FileSpreadsheet, RotateCcw, Search as SearchIcon, Building2, Calendar as CalendarIcon, X, FileDown, FileText, RefreshCw, Filter } from 'lucide-react'
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

export default function AccountStatementPage() {
  const t = useTranslations('accountingReports.accountStatement')
  const commonT = useTranslations('common')
  const headerT = useTranslations('header')

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 1), // June 2025
    to: new Date(2025, 10, 30), // November 2025
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>

          {/* Filter Section */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              {/* Mobile: Vertical Stack, Desktop: Horizontal Wrap */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
                {/* Date Range */}
                <div className="w-full sm:w-[240px] space-y-2">
                  <Label className="text-sm font-medium cursor-pointer">Date Range</Label>
                  <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-9 justify-start text-left font-normal cursor-pointer",
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

                {/* Account & Category - Wrapper for proper mobile grid */}
                <div className="w-full sm:w-auto sm:contents">
                  <div className="grid grid-cols-2 gap-3 sm:contents">
                    {/* Account */}
                    <div className="space-y-2 sm:w-32">
                      <Label htmlFor="account" className="text-sm font-medium cursor-pointer">{t('account')}</Label>
                      <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger id="account" className="h-9 w-full cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="cursor-pointer">{t('allAccounts')}</SelectItem>
                          <SelectItem value="cash" className="cursor-pointer">Cash</SelectItem>
                          <SelectItem value="bca" className="cursor-pointer">BCA</SelectItem>
                          <SelectItem value="mandiri" className="cursor-pointer">Mandiri</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category */}
                    <div className="space-y-2 sm:w-40">
                      <Label htmlFor="category" className="text-sm font-medium cursor-pointer">{t('category')}</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger id="category" className="h-9 w-full cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="cursor-pointer">{t('allCategories')}</SelectItem>
                          <SelectItem value="revenue" className="cursor-pointer">{t('revenue')}</SelectItem>
                          <SelectItem value="payment" className="cursor-pointer">{t('payment')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Single row on mobile, split on desktop */}
                <div className="flex gap-2 w-full sm:contents">
                  <Button size="sm" className="h-8 flex-1 sm:flex-none sm:px-3 bg-blue-500 hover:bg-blue-600 cursor-pointer">
                    <SearchIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline ml-1.5">{commonT('apply')}</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset} className="h-8 w-8 shrink-0 p-0 cursor-pointer">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 flex-1 sm:flex-none sm:px-3 sm:ml-auto cursor-pointer">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline ml-1.5">{commonT('export')}</span>
                  </Button>
                  <Button size="sm" className="h-8 flex-1 sm:flex-none sm:px-3 bg-blue-500 hover:bg-blue-600 cursor-pointer">
                    <FileDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline ml-1.5">{commonT('download')}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Info Cards */}
                    {/* Report Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 shrink-0">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">{t('report')}</p>
                    <p className="text-sm font-semibold leading-tight">{t('title')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 shrink-0">
                    <CalendarIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">{t('duration')}</p>
                    <p className="text-sm font-semibold leading-tight">
                      {dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                        : 'Select date range'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedAccount !== 'all' && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 shrink-0">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">{t('account')}</p>
                      <p className="text-sm font-semibold leading-tight capitalize">{selectedAccount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedCategory !== 'all' && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 shrink-0">
                      <Filter className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">{t('type')}</p>
                      <p className="text-sm font-semibold leading-tight capitalize">{selectedCategory}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Revenue Accounts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('revenueAccounts')}</h3>
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
            <h3 className="text-lg font-semibold mb-4">{t('paymentAccounts')}</h3>
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
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-50">
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
                    className="ps-9 w-full sm:w-40 border-0 bg-muted focus-visible:ring-0 focus-visible:border-0 h-8"
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
