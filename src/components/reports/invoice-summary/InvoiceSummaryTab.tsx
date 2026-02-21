'use client'

import { useState, useMemo, memo, useEffect } from 'react'
import { DateRange } from 'react-day-picker'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { SearchInput } from '@/components/ui/search-input'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { FileText, Search, RotateCcw, FileDown, Hash, CreditCard, AlertCircle, Calendar as CalendarIcon, TrendingUp, FileSpreadsheet } from 'lucide-react'
import { format } from 'date-fns'
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, flexRender, ColumnDef } from '@tanstack/react-table'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { fetchInvoiceSummary } from './hooks'
import { InvoiceRecord } from './constants'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return format(new Date(y, m - 1, 1), 'MMM yyyy')
}

function InvoiceSummaryTabComponent() {
  const t = useTranslations('reports.invoiceSummary')
  const commonT = useTranslations('common')
  
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | '0' | '1' | '2' | '3' | '4'>('all')
  const [customerFilter, setCustomerFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(undefined)
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | '0' | '1' | '2' | '3' | '4'>('all')
  const [appliedCustomerFilter, setAppliedCustomerFilter] = useState<string>('all')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [activeView, setActiveView] = useState<'summary' | 'invoices'>('summary')
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  type CustomerOption = { id: string; name: string }
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([])

  // Load customers for dropdown (align with /accounting/sales?tab=invoice)
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await fetch('/api/customers')
        const json = await res.json()
        if (json?.success && Array.isArray(json.data)) {
          setCustomerOptions(
            json.data.map((c: any) => ({
              id: c.id as string,
              name: c.name as string,
            })),
          )
        }
      } catch {
        // silent
      }
    }
    loadCustomers()
  }, [])
  // Fetch invoices whenever applied filters change
  useEffect(() => {
    let isCancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const effectiveDateRange =
          appliedDateRange && appliedDateRange.from && appliedDateRange.to
            ? { from: appliedDateRange.from, to: appliedDateRange.to }
            : undefined
        const data = await fetchInvoiceSummary({
          dateRange: effectiveDateRange as any,
          status: appliedStatusFilter,
          customerId: appliedCustomerFilter,
          search: appliedSearch,
        })
        if (!isCancelled) {
          setInvoices(data)
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Failed to load invoices')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }
    load()
    return () => {
      isCancelled = true
    }
  }, [appliedDateRange, appliedStatusFilter, appliedCustomerFilter, appliedSearch])

  const filteredData = useMemo(() => invoices, [invoices])

  // Summary metrics aligned to reference: total invoice (sum), total paid, total due
  const summary = useMemo(() => {
    const totalInvoice = filteredData.reduce((a,b)=> a + (b.total || 0),0)
    const totalPaid = filteredData.reduce((a,b)=> {
      if(b.status === 'paid') return a + (b.total - (b.balance || 0))
      if(b.status === 'partial') return a + (b.total - (b.balance || 0))
      return a
    },0)
    const totalDue = filteredData.reduce((a,b)=> a + (b.balance || 0),0)
    return { totalInvoice, totalPaid, totalDue }
  }, [filteredData])

  // Chart data - aggregate invoices by month
  const chartData = useMemo(() => {
    // Aggregate all invoices by month
    const monthMap: Record<string, number> = {}
    filteredData.forEach(inv => {
      const month = inv.issueDate.slice(0, 7) // YYYY-MM
      monthMap[month] = (monthMap[month] || 0) + inv.total
    })
    
    // If no applied date range, use all months from data
    if (!appliedDateRange?.from || !appliedDateRange?.to) {
      const allMonths = Object.keys(monthMap).sort()
      return allMonths.map((month) => ({
        month: formatMonth(month),
        invoices: monthMap[month],
        fill: '#3b82f6' // blue-500
      }))
    }
    
    // Generate all months in the date range
    const months: string[] = []
    const start = new Date(appliedDateRange.from)
    const end = new Date(appliedDateRange.to)
    
    const current = new Date(start.getFullYear(), start.getMonth(), 1)
    while (current <= end) {
      const ym = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      months.push(ym)
      current.setMonth(current.getMonth() + 1)
    }
    
    // Create chart data with blue color
    return months.map((month) => ({
      month: formatMonth(month),
      invoices: monthMap[month] || 0,
      fill: '#3b82f6' // blue-500
    }))
  }, [filteredData, appliedDateRange])

  const chartConfig = {
    invoices: {
      label: 'Invoice Amount',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  const columns = useMemo<ColumnDef<InvoiceRecord>[]>(() => [
    {
      accessorKey: 'number',
      header: () => <div className="font-medium">{t('invoice')}</div>,
      cell: ({ row }) => <div className="font-medium">{row.original.number}</div>,
    },
    {
      accessorKey: 'issueDate',
      header: () => <div className="font-medium">{t('date')}</div>,
      cell: ({ row }) => <div>{row.original.issueDate}</div>,
    },
    {
      accessorKey: 'customer',
      header: () => <div className="font-medium">{t('customer')}</div>,
      cell: ({ row }) => <div>{row.original.customer}</div>,
    },
    {
      accessorKey: 'category',
      header: () => <div className="font-medium">{t('category')}</div>,
      cell: ({ row }) => <div className="text-muted-foreground">{row.original.category}</div>,
    },
    {
      accessorKey: 'total',
      header: () => <div className="font-medium text-right">{t('amount')}</div>,
      cell: ({ row }) => <div className="text-right">{formatRupiah(row.original.total)}</div>,
    },
    {
      accessorKey: 'paid',
      header: () => <div className="font-medium text-right">{t('paidAmount')}</div>,
      cell: ({ row }) => <div className="text-right">{formatRupiah(row.original.total - row.original.balance)}</div>,
    },
    {
      accessorKey: 'balance',
      header: () => <div className="font-medium text-right">{t('dueAmount')}</div>,
      cell: ({ row }) => <div className="text-right">{formatRupiah(row.original.balance)}</div>,
    },
    {
      accessorKey: 'status',
      header: () => <div className="font-medium">{t('status')}</div>,
      cell: ({ row }) => {
        const status = row.original.status
        const color = status === 'paid' ? 'text-green-600' : status === 'partial' ? 'text-yellow-600' : 'text-red-600'
        return <div className={cn('font-medium capitalize', color)}>{t(status)}</div>
      },
    },
    {
      accessorKey: 'paymentDate',
      header: () => <div className="font-medium">{t('paymentDate')}</div>,
      cell: ({ row }) => <div className="text-muted-foreground">{row.original.paymentDate || '-'}</div>,
    },
  ], [t])

  const table = useReactTable({
    columns,
    data: filteredData,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: false,
  })

  const customerOptionsForSelect = useMemo(
    () => customerOptions,
    [customerOptions],
  )

  const appliedCustomerName = useMemo(() => {
    if (appliedCustomerFilter === 'all') return ''
    const found = customerOptions.find((c) => c.id === appliedCustomerFilter)
    return found?.name ?? appliedCustomerFilter
  }, [appliedCustomerFilter, customerOptions])

  const statusLabelMap: Record<'0' | '1' | '2' | '3' | '4', string> = {
    '0': 'Draft',
    '1': 'Sent',
    '2': 'Unpaid',
    '3': 'Partially Paid',
    '4': 'Paid',
  }

  const appliedStatusLabel = useMemo(() => {
    if (appliedStatusFilter === 'all') return ''
    return statusLabelMap[appliedStatusFilter] ?? appliedStatusFilter
  }, [appliedStatusFilter])

  const handleReset = () => {
    setCustomerFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
    setDateRange(undefined)
    setAppliedCustomerFilter('all')
    setAppliedStatusFilter('all')
    setAppliedSearch('')
    setAppliedDateRange(undefined)
  }

  const handleApply = () => {
    setAppliedCustomerFilter(customerFilter)
    setAppliedStatusFilter(statusFilter)
    setAppliedSearch(searchQuery)
    setAppliedDateRange(dateRange)
  }

  const handleDownload = () => {
    // Generate CSV content
    const headers = [t('invoice'), t('date'), t('customer'), t('category'), t('amount'), t('paidAmount'), t('dueAmount'), t('status'), t('paymentDate')]
    const rows = filteredData.map(inv => [
      inv.number,
      inv.issueDate,
      inv.customer,
      inv.category,
      inv.total,
      inv.total - inv.balance,
      inv.balance,
      t(inv.status),
      inv.paymentDate || '-'
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `invoice_summary_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Section */}
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
                      'w-full h-9 justify-start text-left font-normal shadow-none hover:bg-blue-50 hover:text-blue-700 border-input',
                      !dateRange?.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
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
                    <Button size="sm" className="w-full h-8 bg-blue-500 hover:bg-blue-600" onClick={() => setIsDateRangeOpen(false)}>
                      {t('select')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Customer */}
            <div className="w-full lg:w-40 space-y-1.5">
              <Label htmlFor="customer" className="text-xs font-medium text-muted-foreground">
                {t('customer')}
              </Label>
              <Select value={customerFilter} onValueChange={(v) => setCustomerFilter(v)}>
                <SelectTrigger id="customer" className="h-9 w-full shadow-none">
                  <SelectValue placeholder={t('allCustomers')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCustomers')}</SelectItem>
                  {customerOptionsForSelect.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="w-full lg:w-40 space-y-1.5">
              <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">
                {t('status')}
              </Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger id="status" className="h-9 w-full shadow-none">
                  <SelectValue placeholder={t('allStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatus')}</SelectItem>
                  <SelectItem value="0">Draft</SelectItem>
                  <SelectItem value="1">Sent</SelectItem>
                  <SelectItem value="2">Unpaid</SelectItem>
                  <SelectItem value="3">Partially Paid</SelectItem>
                  <SelectItem value="4">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:ml-auto">
              <Button
                size="sm"
                className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
                onClick={handleApply}
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
                onClick={handleDownload}
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

      {/* Filter info cards - show when filters are applied */}
      {(appliedCustomerFilter !== 'all' || appliedStatusFilter !== 'all') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {appliedCustomerFilter !== 'all' && (
            <Card className="shadow-none">
              <CardContent className="px-4 py-2 flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100">
                  <Hash className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{t('customer')}</p>
                  <p className="text-sm font-semibold">{appliedCustomerName}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {appliedStatusFilter !== 'all' && (
            <Card className="shadow-none">
              <CardContent className="px-4 py-2 flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100">
                  <Hash className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{t('status')}</p>
                  <p className="text-sm font-semibold capitalize">{appliedStatusLabel}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t('totalInvoice')}</p>
              <p className="text-lg font-bold">{formatRupiah(summary.totalInvoice)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t('totalPaid')}</p>
              <p className="text-lg font-bold text-green-600">{formatRupiah(summary.totalPaid)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t('totalDue')}</p>
              <p className="text-lg font-bold text-red-600">{formatRupiah(summary.totalDue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs with SmoothTab */}
      <Card className="shadow-none">
        <CardContent className="pt-4 px-4 pb-0">
          <div className="flex flex-col gap-4">
            {/* Tab Navigation */}
            <SmoothTab
              value={activeView}
              onChange={(tabId) => setActiveView(tabId as any)}
              className="!w-fit"
              activeColor="bg-white shadow-sm"
              items={[
                {
                  id: 'summary',
                  title: t('summaryTab'),
                  content: <></>,
                },
                {
                  id: 'invoices',
                  title: t('invoicesTab'),
                  content: <></>,
                },
              ]}
            />

            {/* Tab Content with persistent wrapper */}
            <div style={{ minHeight: '400px' }}>
              {/* Summary Tab */}
              {activeView === 'summary' && (
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">{t('title')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {appliedDateRange?.from && appliedDateRange?.to
                        ? `${format(appliedDateRange.from, 'LLL dd, y')} - ${format(appliedDateRange.to, 'LLL dd, y')}`
                        : t('showingInvoiceAmounts')}
                    </p>
                  </div>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => (value as string).slice(0, 3)}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `${Math.round((value as number) / 1_000_000)}M`}
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Bar dataKey="invoices" fill="var(--color-invoices)" radius={8} />
                    </BarChart>
                  </ChartContainer>
                  <div className="text-xs flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    {t('showingInvoiceAmounts')}
                  </div>
                </div>
              )}

              {/* Invoices Tab */}
              {activeView === 'invoices' && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold whitespace-nowrap">{t('title')}</h3>
                    <SearchInput
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchInvoice')}
                      className="w-64"
                    />
                  </div>
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th key={header.id} className="px-3 py-2 text-left text-xs">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-t hover:bg-muted/50">
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-3 py-2 text-sm">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-muted-foreground">
                              {t('noInvoicesFound')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-2 border-t">
                    <SimplePagination
                      currentPage={pagination.pageIndex + 1}
                      totalCount={filteredData.length}
                      onPageChange={(page) => setPagination({ ...pagination, pageIndex: page - 1 })}
                      pageSize={pagination.pageSize}
                      onPageSizeChange={(size) => setPagination({ pageIndex: 0, pageSize: size })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const InvoiceSummaryTab = memo(InvoiceSummaryTabComponent)
