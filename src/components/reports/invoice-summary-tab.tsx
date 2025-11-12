"use client"

import { useState, useMemo, memo } from 'react'
import { DateRange } from 'react-day-picker'
import { Card, CardContent } from '@/components/ui/card'
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
import { cn } from '@/lib/utils'

interface InvoiceRecord {
  id: number
  number: string
  customer: string
  issueDate: string
  category: string
  status: 'paid' | 'unpaid' | 'overdue' | 'partial'
  total: number
  balance: number
  paymentDate?: string
}

const mockInvoices: InvoiceRecord[] = [
  // June 2025
  { id: 1, number: 'INV-2025-001', customer: 'PT Sinar Jaya', issueDate: '2025-06-01', category: 'Services', status: 'paid', total: 12500000, balance: 0, paymentDate: '2025-06-10' },
  { id: 2, number: 'INV-2025-002', customer: 'CV Mandiri Abadi', issueDate: '2025-06-03', category: 'Consulting', status: 'unpaid', total: 8400000, balance: 8400000 },
  { id: 3, number: 'INV-2025-003', customer: 'PT Nusantara Tech', issueDate: '2025-06-04', category: 'Software', status: 'partial', total: 9600000, balance: 3200000, paymentDate: '2025-06-12' },
  { id: 4, number: 'INV-2025-004', customer: 'PT Sinar Jaya', issueDate: '2025-06-05', category: 'Services', status: 'overdue', total: 7200000, balance: 7200000 },
  { id: 5, number: 'INV-2025-005', customer: 'PT Global Media', issueDate: '2025-06-06', category: 'Media', status: 'paid', total: 15500000, balance: 0, paymentDate: '2025-06-14' },
  { id: 6, number: 'INV-2025-006', customer: 'CV Mandiri Abadi', issueDate: '2025-06-07', category: 'Consulting', status: 'unpaid', total: 4300000, balance: 4300000 },
  { id: 7, number: 'INV-2025-007', customer: 'PT Sinar Jaya', issueDate: '2025-06-08', category: 'Support', status: 'paid', total: 5100000, balance: 0, paymentDate: '2025-06-16' },
  { id: 8, number: 'INV-2025-008', customer: 'PT Nusantara Tech', issueDate: '2025-06-09', category: 'Software', status: 'overdue', total: 13200000, balance: 13200000 },
  { id: 9, number: 'INV-2025-009', customer: 'PT Global Media', issueDate: '2025-06-12', category: 'Media', status: 'paid', total: 18200000, balance: 0, paymentDate: '2025-06-20' },
  { id: 10, number: 'INV-2025-010', customer: 'CV Mandiri Abadi', issueDate: '2025-06-15', category: 'Services', status: 'paid', total: 6800000, balance: 0, paymentDate: '2025-06-22' },
  { id: 11, number: 'INV-2025-011', customer: 'PT Sinar Jaya', issueDate: '2025-06-18', category: 'Consulting', status: 'partial', total: 11200000, balance: 4500000, paymentDate: '2025-06-25' },
  { id: 12, number: 'INV-2025-012', customer: 'PT Nusantara Tech', issueDate: '2025-06-20', category: 'Software', status: 'paid', total: 22500000, balance: 0, paymentDate: '2025-06-28' },
  { id: 13, number: 'INV-2025-013', customer: 'PT Global Media', issueDate: '2025-06-25', category: 'Media', status: 'unpaid', total: 9300000, balance: 9300000 },
  { id: 14, number: 'INV-2025-014', customer: 'CV Mandiri Abadi', issueDate: '2025-06-28', category: 'Support', status: 'paid', total: 3700000, balance: 0, paymentDate: '2025-06-30' },
  
  // July 2025
  { id: 15, number: 'INV-2025-015', customer: 'PT Sinar Jaya', issueDate: '2025-07-02', category: 'Services', status: 'paid', total: 14800000, balance: 0, paymentDate: '2025-07-10' },
  { id: 16, number: 'INV-2025-016', customer: 'PT Nusantara Tech', issueDate: '2025-07-05', category: 'Software', status: 'paid', total: 19500000, balance: 0, paymentDate: '2025-07-12' },
  { id: 17, number: 'INV-2025-017', customer: 'CV Mandiri Abadi', issueDate: '2025-07-08', category: 'Consulting', status: 'unpaid', total: 7600000, balance: 7600000 },
  { id: 18, number: 'INV-2025-018', customer: 'PT Global Media', issueDate: '2025-07-10', category: 'Media', status: 'partial', total: 16400000, balance: 5200000, paymentDate: '2025-07-18' },
  { id: 19, number: 'INV-2025-019', customer: 'PT Sinar Jaya', issueDate: '2025-07-12', category: 'Services', status: 'paid', total: 8900000, balance: 0, paymentDate: '2025-07-20' },
  { id: 20, number: 'INV-2025-020', customer: 'PT Nusantara Tech', issueDate: '2025-07-15', category: 'Software', status: 'overdue', total: 25300000, balance: 25300000 },
  { id: 21, number: 'INV-2025-021', customer: 'CV Mandiri Abadi', issueDate: '2025-07-18', category: 'Support', status: 'paid', total: 4200000, balance: 0, paymentDate: '2025-07-25' },
  { id: 22, number: 'INV-2025-022', customer: 'PT Global Media', issueDate: '2025-07-22', category: 'Media', status: 'paid', total: 21600000, balance: 0, paymentDate: '2025-07-28' },
  { id: 23, number: 'INV-2025-023', customer: 'PT Sinar Jaya', issueDate: '2025-07-25', category: 'Consulting', status: 'unpaid', total: 12700000, balance: 12700000 },
  { id: 24, number: 'INV-2025-024', customer: 'PT Nusantara Tech', issueDate: '2025-07-28', category: 'Software', status: 'paid', total: 17800000, balance: 0, paymentDate: '2025-07-31' },
  
  // August 2025
  { id: 25, number: 'INV-2025-025', customer: 'CV Mandiri Abadi', issueDate: '2025-08-01', category: 'Services', status: 'paid', total: 10500000, balance: 0, paymentDate: '2025-08-08' },
  { id: 26, number: 'INV-2025-026', customer: 'PT Global Media', issueDate: '2025-08-03', category: 'Media', status: 'paid', total: 19200000, balance: 0, paymentDate: '2025-08-10' },
  { id: 27, number: 'INV-2025-027', customer: 'PT Sinar Jaya', issueDate: '2025-08-05', category: 'Consulting', status: 'partial', total: 13500000, balance: 6700000, paymentDate: '2025-08-12' },
  { id: 28, number: 'INV-2025-028', customer: 'PT Nusantara Tech', issueDate: '2025-08-08', category: 'Software', status: 'paid', total: 28400000, balance: 0, paymentDate: '2025-08-15' },
  { id: 29, number: 'INV-2025-029', customer: 'CV Mandiri Abadi', issueDate: '2025-08-10', category: 'Support', status: 'unpaid', total: 5600000, balance: 5600000 },
  { id: 30, number: 'INV-2025-030', customer: 'PT Global Media', issueDate: '2025-08-12', category: 'Media', status: 'paid', total: 24300000, balance: 0, paymentDate: '2025-08-18' },
  { id: 31, number: 'INV-2025-031', customer: 'PT Sinar Jaya', issueDate: '2025-08-15', category: 'Services', status: 'paid', total: 11800000, balance: 0, paymentDate: '2025-08-22' },
  { id: 32, number: 'INV-2025-032', customer: 'PT Nusantara Tech', issueDate: '2025-08-18', category: 'Software', status: 'overdue', total: 16900000, balance: 16900000 },
  { id: 33, number: 'INV-2025-033', customer: 'CV Mandiri Abadi', issueDate: '2025-08-20', category: 'Consulting', status: 'paid', total: 9200000, balance: 0, paymentDate: '2025-08-25' },
  { id: 34, number: 'INV-2025-034', customer: 'PT Global Media', issueDate: '2025-08-22', category: 'Media', status: 'unpaid', total: 14700000, balance: 14700000 },
  { id: 35, number: 'INV-2025-035', customer: 'PT Sinar Jaya', issueDate: '2025-08-25', category: 'Services', status: 'paid', total: 8300000, balance: 0, paymentDate: '2025-08-30' },
  
  // September 2025
  { id: 36, number: 'INV-2025-036', customer: 'PT Nusantara Tech', issueDate: '2025-09-02', category: 'Software', status: 'paid', total: 32100000, balance: 0, paymentDate: '2025-09-10' },
  { id: 37, number: 'INV-2025-037', customer: 'CV Mandiri Abadi', issueDate: '2025-09-05', category: 'Consulting', status: 'paid', total: 11400000, balance: 0, paymentDate: '2025-09-12' },
  { id: 38, number: 'INV-2025-038', customer: 'PT Global Media', issueDate: '2025-09-08', category: 'Media', status: 'partial', total: 22800000, balance: 8900000, paymentDate: '2025-09-15' },
  { id: 39, number: 'INV-2025-039', customer: 'PT Sinar Jaya', issueDate: '2025-09-10', category: 'Services', status: 'paid', total: 15600000, balance: 0, paymentDate: '2025-09-18' },
  { id: 40, number: 'INV-2025-040', customer: 'PT Nusantara Tech', issueDate: '2025-09-12', category: 'Software', status: 'unpaid', total: 19700000, balance: 19700000 },
  { id: 41, number: 'INV-2025-041', customer: 'CV Mandiri Abadi', issueDate: '2025-09-15', category: 'Support', status: 'paid', total: 6100000, balance: 0, paymentDate: '2025-09-22' },
  { id: 42, number: 'INV-2025-042', customer: 'PT Global Media', issueDate: '2025-09-18', category: 'Media', status: 'paid', total: 27500000, balance: 0, paymentDate: '2025-09-25' },
  { id: 43, number: 'INV-2025-043', customer: 'PT Sinar Jaya', issueDate: '2025-09-20', category: 'Consulting', status: 'overdue', total: 13900000, balance: 13900000 },
  { id: 44, number: 'INV-2025-044', customer: 'PT Nusantara Tech', issueDate: '2025-09-22', category: 'Software', status: 'paid', total: 24600000, balance: 0, paymentDate: '2025-09-28' },
  { id: 45, number: 'INV-2025-045', customer: 'CV Mandiri Abadi', issueDate: '2025-09-25', category: 'Services', status: 'unpaid', total: 7800000, balance: 7800000 },
  
  // October 2025
  { id: 46, number: 'INV-2025-046', customer: 'PT Global Media', issueDate: '2025-10-01', category: 'Media', status: 'paid', total: 29300000, balance: 0, paymentDate: '2025-10-08' },
  { id: 47, number: 'INV-2025-047', customer: 'PT Sinar Jaya', issueDate: '2025-10-03', category: 'Services', status: 'paid', total: 16200000, balance: 0, paymentDate: '2025-10-10' },
  { id: 48, number: 'INV-2025-048', customer: 'PT Nusantara Tech', issueDate: '2025-10-05', category: 'Software', status: 'partial', total: 35700000, balance: 12400000, paymentDate: '2025-10-12' },
  { id: 49, number: 'INV-2025-049', customer: 'CV Mandiri Abadi', issueDate: '2025-10-08', category: 'Consulting', status: 'paid', total: 12800000, balance: 0, paymentDate: '2025-10-15' },
  { id: 50, number: 'INV-2025-050', customer: 'PT Global Media', issueDate: '2025-10-10', category: 'Media', status: 'unpaid', total: 21400000, balance: 21400000 },
  { id: 51, number: 'INV-2025-051', customer: 'PT Sinar Jaya', issueDate: '2025-10-12', category: 'Support', status: 'paid', total: 7400000, balance: 0, paymentDate: '2025-10-18' },
  { id: 52, number: 'INV-2025-052', customer: 'PT Nusantara Tech', issueDate: '2025-10-15', category: 'Software', status: 'paid', total: 26900000, balance: 0, paymentDate: '2025-10-22' },
  { id: 53, number: 'INV-2025-053', customer: 'CV Mandiri Abadi', issueDate: '2025-10-18', category: 'Services', status: 'overdue', total: 9800000, balance: 9800000 },
  { id: 54, number: 'INV-2025-054', customer: 'PT Global Media', issueDate: '2025-10-20', category: 'Media', status: 'paid', total: 31200000, balance: 0, paymentDate: '2025-10-28' },
  { id: 55, number: 'INV-2025-055', customer: 'PT Sinar Jaya', issueDate: '2025-10-22', category: 'Consulting', status: 'unpaid', total: 14500000, balance: 14500000 },
  { id: 56, number: 'INV-2025-056', customer: 'PT Nusantara Tech', issueDate: '2025-10-25', category: 'Software', status: 'paid', total: 28700000, balance: 0, paymentDate: '2025-10-30' },
  
  // November 2025
  { id: 57, number: 'INV-2025-057', customer: 'CV Mandiri Abadi', issueDate: '2025-11-01', category: 'Services', status: 'paid', total: 11900000, balance: 0, paymentDate: '2025-11-05' },
  { id: 58, number: 'INV-2025-058', customer: 'PT Global Media', issueDate: '2025-11-03', category: 'Media', status: 'unpaid', total: 25600000, balance: 25600000 },
  { id: 59, number: 'INV-2025-059', customer: 'PT Sinar Jaya', issueDate: '2025-11-05', category: 'Consulting', status: 'paid', total: 17300000, balance: 0, paymentDate: '2025-11-07' },
  { id: 60, number: 'INV-2025-060', customer: 'PT Nusantara Tech', issueDate: '2025-11-06', category: 'Software', status: 'unpaid', total: 33500000, balance: 33500000 },
]

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return format(new Date(y, m - 1, 1), 'MMM yyyy')
}

export function InvoiceSummaryTab() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  // Date range filter
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 1),
    to: new Date(2025, 10, 30),
  })
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue' | 'partial'>('all')
  const [customerFilter, setCustomerFilter] = useState<'all' | 'PT Sinar Jaya' | 'CV Mandiri Abadi' | 'PT Nusantara Tech' | 'PT Global Media'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState<'summary' | 'invoices'>('summary')

  const filteredData = useMemo(() => {
    return mockInvoices.filter(inv => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false
      if (customerFilter !== 'all' && inv.customer !== customerFilter) return false
      if (searchQuery && !inv.number.toLowerCase().includes(searchQuery.toLowerCase()) && !inv.customer.toLowerCase().includes(searchQuery.toLowerCase())) return false
      
      // Date range filter
      if (dateRange?.from || dateRange?.to) {
        const issueDate = new Date(inv.issueDate)
        if (dateRange.from && issueDate < dateRange.from) return false
        if (dateRange.to && issueDate > dateRange.to) return false
      }
      
      return true
    })
  }, [statusFilter, customerFilter, searchQuery, dateRange])

  // Summary metrics aligned to reference: total invoice (sum), total paid, total due
  const summary = useMemo(() => {
    const totalInvoice = filteredData.reduce((a,b)=> a + b.total,0)
    const totalPaid = filteredData.filter(i=> i.status === 'paid').reduce((a,b)=> a + (b.total - b.balance),0) + filteredData.filter(i=> i.status === 'partial').reduce((a,b)=> a + (b.total - b.balance),0)
    const totalDue = filteredData.reduce((a,b)=> a + b.balance,0)
    return { totalInvoice, totalPaid, totalDue }
  }, [filteredData])

  // Chart data - aggregate invoices by month
  const chartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return []
    
    const monthMap: Record<string, number> = {}
    filteredData.forEach(inv => {
      const month = inv.issueDate.slice(0, 7) // YYYY-MM
      monthMap[month] = (monthMap[month] || 0) + inv.total
    })
    
    // Generate all months in the date range
    const months: string[] = []
    const start = new Date(dateRange.from)
    const end = new Date(dateRange.to)
    
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
  }, [filteredData, dateRange])

  const chartConfig = {
    invoices: {
      label: 'Invoice Amount',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  const columns = useMemo<ColumnDef<InvoiceRecord>[]>(() => [
    {
      id: 'number',
      header: () => <div className="pl-2 font-medium">Invoice</div>,
      cell: ({ row }) => <div className="pl-2 font-medium">{row.original.number}</div>,
      size: 150,
      meta: { skeleton: <Skeleton className="h-5 w-[110px] ml-2" /> },
    },
    {
      id: 'issueDate',
      header: () => <div className="pl-2">Date</div>,
      cell: ({ row }) => <div className="pl-2">{row.original.issueDate}</div>,
      size: 120,
      meta: { skeleton: <Skeleton className="h-5 w-[80px] ml-2" /> },
    },
    {
      id: 'customer',
      header: () => <div className="pl-2">Customer</div>,
      cell: ({ row }) => <div className="pl-2 truncate max-w-[160px]" title={row.original.customer}>{row.original.customer}</div>,
      size: 200,
      meta: { skeleton: <Skeleton className="h-5 w-[140px] ml-2" /> },
    },
    {
      id: 'category',
      header: () => <div className="pl-2">Category</div>,
      cell: ({ row }) => <div className="pl-2">{row.original.category}</div>,
      size: 140,
      meta: { skeleton: <Skeleton className="h-5 w-[90px] ml-2" /> },
    },
    {
      id: 'status',
      header: () => <div className="pl-2">Status</div>,
      cell: ({ row }) => {
        const status = row.original.status
        const color = status === 'paid' ? 'bg-green-100 text-green-700' : status === 'unpaid' ? 'bg-yellow-100 text-yellow-700' : status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-600'
        return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{status}</span>
      },
      size: 110,
      meta: { skeleton: <Skeleton className="h-5 w-[70px] ml-2" /> },
    },
    {
      id: 'paidAmount',
      header: () => <div className="text-right pr-2">Paid Amount</div>,
      cell: ({ row }) => <div className="text-right pr-2 font-medium text-green-600">{formatRupiah(row.original.total - row.original.balance)}</div>,
      size: 140,
      meta: { skeleton: <Skeleton className="h-5 w-[90px] ml-auto mr-2" /> },
    },
    {
      id: 'dueAmount',
      header: () => <div className="text-right pr-2">Due Amount</div>,
      cell: ({ row }) => <div className="text-right pr-2 font-medium text-red-600">{formatRupiah(row.original.balance)}</div>,
      size: 140,
      meta: { skeleton: <Skeleton className="h-5 w-[90px] ml-auto mr-2" /> },
    },
    {
      id: 'paymentDate',
      header: () => <div className="pl-2">Payment Date</div>,
      cell: ({ row }) => <div className="pl-2">{row.original.paymentDate || '-'}</div>,
      size: 130,
      meta: { skeleton: <Skeleton className="h-5 w-[80px] ml-2" /> },
    },
    {
      id: 'amount',
      header: () => <div className="text-right pr-2">Amount</div>,
      cell: ({ row }) => <div className="text-right pr-2 font-medium">{formatRupiah(row.original.total)}</div>,
      size: 140,
      meta: { skeleton: <Skeleton className="h-5 w-[90px] ml-auto mr-2" /> },
    },
  ], [])

  const table = useReactTable({
    columns,
    data: filteredData,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: false,
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
  })

  const handleReset = () => {
    setDateRange({
      from: new Date(2025, 5, 1),
      to: new Date(2025, 10, 30),
    })
    setStatusFilter('all')
    setCustomerFilter('all')
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
                      "w-full h-9 justify-start text-left font-normal cursor-pointer shadow-none hover:bg-blue-50 hover:text-blue-700 border border-input",
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

            {/* Customer Select */}
            <div className="w-full lg:w-40 space-y-1.5">
              <Label htmlFor="customer" className="text-xs font-medium text-muted-foreground">Customer</Label>
              <Select value={customerFilter} onValueChange={(v) => setCustomerFilter(v as any)}>
                <SelectTrigger id="customer" className="h-9 w-full shadow-none">
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="PT Sinar Jaya">PT Sinar Jaya</SelectItem>
                  <SelectItem value="CV Mandiri Abadi">CV Mandiri Abadi</SelectItem>
                  <SelectItem value="PT Nusantara Tech">PT Nusantara Tech</SelectItem>
                  <SelectItem value="PT Global Media">PT Global Media</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Select */}
            <div className="w-full lg:w-40 space-y-1.5">
              <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger id="status" className="h-9 w-full shadow-none">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 lg:ml-auto">
              <Button
                size="sm"
                className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
              >
                <Search className="w-4 h-4" />
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

      {/* Info Cards (Customer / Status) - Only show grid when there are cards to display */}
      {(customerFilter !== 'all' || statusFilter !== 'all') && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {customerFilter !== 'all' && (
            <Card className="shadow-none">
              <CardContent className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/90 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Customer</p>
                  <p className="text-sm font-semibold leading-tight truncate" title={customerFilter}>{customerFilter}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {statusFilter !== 'all' && (
            <Card className="shadow-none">
              <CardContent className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-600/90 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-sm font-semibold leading-tight capitalize" title={statusFilter}>{statusFilter}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-none">
          <CardContent className="p-4 flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Total Invoice</p>
              <p className="text-lg font-semibold leading-none mt-1">{formatRupiah(summary.totalInvoice)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-4 flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-lg font-semibold leading-none mt-1">{formatRupiah(summary.totalPaid)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-4 flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Total Due</p>
              <p className="text-lg font-semibold leading-none mt-1">{formatRupiah(summary.totalDue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* LAYOUT: Summary and Invoices Tabs */}
      {/* This section contains tabs for switching between: */}
      {/* - Summary: Chart visualization of invoice data */}
      {/* - Invoices: Table view with pagination */}
      {/* ============================================ */}
      <Card className="shadow-none">
        <div className="pt-3 px-4">
          <SmoothTab
            className="!w-fit !ml-0 !gap-0"
            items={[
              {
                id: 'summary',
                title: 'Summary',
                content: (
                  <CardContent className="p-0">
                  <div className="space-y-4 p-3 pt-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Invoice Summary</h3>
                      <p className="text-xs text-muted-foreground">
                        {dateRange?.from && dateRange?.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : dateRange?.from ? (
                          format(dateRange.from, "LLL dd, y")
                        ) : (
                          'No date range selected'
                        )}
                      </p>
                    </div>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={true} horizontal={true} strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          className="text-xs"
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          className="text-xs"
                          tickFormatter={(value) => {
                            // Format to millions (M)
                            if (value >= 1000000) {
                              return `${(value / 1000000).toFixed(0)}M`
                            }
                            return value.toString()
                          }}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent 
                            hideLabel
                            formatter={(value) => formatRupiah(Number(value))}
                          />}
                        />
                        <Bar
                          dataKey="invoices"
                          fill="var(--color-invoices)"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                    <div className="flex items-center gap-2 text-sm pt-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Showing invoice amounts for the selected period</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )
            },
            {
              id: 'invoices',
              title: 'Invoices',
              content: (
                <CardContent className="p-0 pt-3 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <SearchInput
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search invoice"
                      containerClassName="w-full sm:max-w-xs"
                    />
                  </div>
                  <div className="overflow-auto border rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        {table.getHeaderGroups().map(hg => (
                          <tr key={hg.id}>
                            {hg.headers.map(header => (
                              <th key={header.id} style={{ width: header.getSize() }} className="text-left font-medium py-1.5 first:pl-2">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map(row => (
                          <tr key={row.id} className="border-t">
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id} style={{ width: cell.column.getSize() }} className="py-1.5 first:pl-2">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {table.getRowModel().rows.length === 0 && (
                          <tr>
                            <td colSpan={columns.length} className="py-6 text-center text-muted-foreground text-sm">No invoices found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    {/* Pagination Controls */}
                    <div className="py-2 px-2 bg-background border-t">
                      <SimplePagination
                        totalCount={filteredData.length}
                        currentPage={table.getState().pagination.pageIndex + 1}
                        pageSize={table.getState().pagination.pageSize}
                        onPageChange={(p) => table.setPageIndex(p - 1)}
                        onPageSizeChange={(size) => {
                          table.setPageSize(size)
                          table.setPageIndex(0)
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              )
            }
          ]}
          defaultTabId="summary"
          value={activeView}
          activeColor="bg-white dark:bg-gray-700 shadow-xs"
          onChange={(tabId) => setActiveView(tabId as 'summary' | 'invoices')}
          />
        </div>
      </Card>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(InvoiceSummaryTab)
