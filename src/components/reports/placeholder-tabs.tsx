'use client'

import { useMemo, useState, memo, useEffect } from 'react'
import { DateRange } from 'react-day-picker'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { SearchInput } from '@/components/ui/search-input'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { cn } from '@/lib/utils'
import {
  FileText,
  Search,
  RotateCcw,
  FileDown,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  ShoppingCart,
  Package,
  Users,
} from 'lucide-react'
import { format } from 'date-fns'

const salesByItem = [
  { item: 'Laptop Pro 15"', quantity: 48, revenue: 120000000, avgPrice: 2500000, status: 'Top Seller' },
  { item: 'Office Chair', quantity: 96, revenue: 45600000, avgPrice: 475000, status: 'Trending' },
  { item: 'Wireless Mouse', quantity: 210, revenue: 18900000, avgPrice: 90000, status: 'Steady' },
  { item: 'Cloud Storage Pro', quantity: 32, revenue: 89600000, avgPrice: 2800000, status: 'Premium' },
  { item: 'Mechanical Keyboard', quantity: 87, revenue: 26100000, avgPrice: 300000, status: 'Trending' },
  { item: 'USB-C Hub', quantity: 145, revenue: 14500000, avgPrice: 100000, status: 'Steady' },
  { item: 'Webcam HD', quantity: 62, revenue: 24800000, avgPrice: 400000, status: 'Top Seller' },
  { item: 'Monitor 27"', quantity: 38, revenue: 95000000, avgPrice: 2500000, status: 'Premium' },
  { item: 'Standing Desk', quantity: 29, revenue: 87000000, avgPrice: 3000000, status: 'Premium' },
  { item: 'Headset Wireless', quantity: 156, revenue: 31200000, avgPrice: 200000, status: 'Trending' },
  { item: 'Tablet 10"', quantity: 44, revenue: 132000000, avgPrice: 3000000, status: 'Top Seller' },
  { item: 'External SSD 1TB', quantity: 78, revenue: 39000000, avgPrice: 500000, status: 'Steady' },
  { item: 'Docking Station', quantity: 35, revenue: 52500000, avgPrice: 1500000, status: 'Premium' },
  { item: 'Ergonomic Mouse', quantity: 198, revenue: 29700000, avgPrice: 150000, status: 'Trending' },
  { item: 'Laptop Stand', quantity: 124, revenue: 18600000, avgPrice: 150000, status: 'Steady' },
  { item: 'Wireless Charger', quantity: 167, revenue: 25050000, avgPrice: 150000, status: 'Trending' },
  { item: 'Drawing Tablet', quantity: 41, revenue: 82000000, avgPrice: 2000000, status: 'Premium' },
  { item: 'Portable Monitor', quantity: 53, revenue: 79500000, avgPrice: 1500000, status: 'Top Seller' },
  { item: 'USB Flash Drive 64GB', quantity: 289, revenue: 14450000, avgPrice: 50000, status: 'Steady' },
  { item: 'Cable Management Kit', quantity: 142, revenue: 7100000, avgPrice: 50000, status: 'Steady' },
]

const salesByCustomer = [
  { customer: 'PT. Astra', orders: 32, revenue: 72000000, avgOrder: 2250000, priority: 'Strategic' },
  { customer: 'CV. Mitra Karya', orders: 18, revenue: 28500000, avgOrder: 1583000, priority: 'Growth' },
  { customer: 'UD. Sumber Jaya', orders: 24, revenue: 31200000, avgOrder: 1300000, priority: 'Stable' },
  { customer: 'PT. Digital Nusantara', orders: 41, revenue: 91500000, avgOrder: 2232000, priority: 'Premium' },
  { customer: 'PT. Telkom Indonesia', orders: 38, revenue: 114000000, avgOrder: 3000000, priority: 'Strategic' },
  { customer: 'CV. Jaya Abadi', orders: 22, revenue: 33000000, avgOrder: 1500000, priority: 'Growth' },
  { customer: 'PT. Bank Mandiri', orders: 45, revenue: 135000000, avgOrder: 3000000, priority: 'Strategic' },
  { customer: 'UD. Sejahtera', orders: 15, revenue: 15000000, avgOrder: 1000000, priority: 'Stable' },
  { customer: 'PT. Garuda Indonesia', orders: 29, revenue: 87000000, avgOrder: 3000000, priority: 'Premium' },
  { customer: 'CV. Maju Jaya', orders: 19, revenue: 28500000, avgOrder: 1500000, priority: 'Growth' },
  { customer: 'PT. Pertamina', orders: 52, revenue: 156000000, avgOrder: 3000000, priority: 'Strategic' },
  { customer: 'UD. Makmur', orders: 13, revenue: 13000000, avgOrder: 1000000, priority: 'Stable' },
  { customer: 'PT. Unilever Indonesia', orders: 36, revenue: 108000000, avgOrder: 3000000, priority: 'Premium' },
  { customer: 'CV. Berkah Jaya', orders: 21, revenue: 31500000, avgOrder: 1500000, priority: 'Growth' },
  { customer: 'PT. Indofood', orders: 43, revenue: 129000000, avgOrder: 3000000, priority: 'Strategic' },
  { customer: 'UD. Rejeki', orders: 16, revenue: 16000000, avgOrder: 1000000, priority: 'Stable' },
  { customer: 'PT. XL Axiata', orders: 34, revenue: 102000000, avgOrder: 3000000, priority: 'Premium' },
  { customer: 'CV. Sukses Mandiri', orders: 20, revenue: 30000000, avgOrder: 1500000, priority: 'Growth' },
  { customer: 'PT. Astra Honda Motor', orders: 48, revenue: 144000000, avgOrder: 3000000, priority: 'Strategic' },
  { customer: 'UD. Barokah', orders: 14, revenue: 14000000, avgOrder: 1000000, priority: 'Stable' },
]

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const InvoiceSummaryTabComponent = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Invoice Summary Report</h3>
          <p className="text-muted-foreground">This tab will contain the Invoice Summary report content.</p>
        </CardContent>
      </Card>
    </div>
  )
}
export const InvoiceSummaryTab = memo(InvoiceSummaryTabComponent)


const SalesReportTabComponent = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 1),
    to: new Date(2025, 6, 30),
  })
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<'items' | 'customers'>(
    'items',
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Reset to first page when filters change to avoid empty pages
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const filteredItems = useMemo(() => {
    if (!searchQuery) return salesByItem
    const query = searchQuery.toLowerCase()
    return salesByItem.filter(
      (row) =>
        row.item.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query),
    )
  }, [searchQuery])

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return salesByCustomer
    const query = searchQuery.toLowerCase()
    return salesByCustomer.filter((row) =>
      row.customer.toLowerCase().includes(query),
    )
  }, [searchQuery])

  // Pagination logic
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredItems.slice(startIndex, endIndex)
  }, [filteredItems, currentPage, pageSize])

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredCustomers.slice(startIndex, endIndex)
  }, [filteredCustomers, currentPage, pageSize])

  const totalRevenue = useMemo(
    () => salesByItem.reduce((sum, row) => sum + row.revenue, 0),
    [],
  )
  const totalOrders = useMemo(
    () => salesByItem.reduce((sum, row) => sum + row.quantity, 0),
    [],
  )
  const totalCustomers = useMemo(() => salesByCustomer.length, [])

  const handleReset = () => {
    setDateRange({
      from: new Date(2025, 5, 1),
      to: new Date(2025, 6, 30),
    })
    setCurrentPage(1)
  }

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId as 'items' | 'customers')
    setCurrentPage(1)
  }

  const dateRangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'LLL dd, y')} - ${format(
          dateRange.to,
          'LLL dd, y',
        )}`
      : format(dateRange.from, 'LLL dd, y')
    : 'Pick a date range'

  const salesTabItems = useMemo(
    () => [
      {
        id: 'items',
        title: 'Sales by Item',
      },
      {
        id: 'customers',
        title: 'Sales by Customer',
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Section */}
      <Card>
        <CardContent className="px-4 py-2">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            {/* Date Range Picker */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Date Range</Label>
              <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-9 justify-start text-left font-normal shadow-none hover:bg-blue-50 hover:text-blue-700 border-input',
                      !dateRange?.from && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm">{dateRangeLabel}</span>
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
                      Select
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
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

      {/* Data Section */}
      <Card>
        <CardHeader className="pb-0 pl-6">
          <CardTitle className="text-base">Sales Report</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            <div className="w-fit">
              <SmoothTab
                items={salesTabItems.map((item) => ({
                  ...item,
                  content: <></>,
                }))}
                defaultTabId="items"
                activeColor="bg-white dark:bg-gray-700 shadow-xs"
                value={selectedTab}
                onChange={handleTabChange}
              />
            </div>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={selectedTab === 'items' ? 'Search items...' : 'Search customers...'}
              containerClassName="w-full sm:w-auto mb-4"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Table Content - Full Width */}
          {selectedTab === 'items' && (
            <div className="overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Item</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Avg. Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((row) => (
                    <TableRow key={row.item}>
                      <TableCell className="font-medium">{row.item}</TableCell>
                      <TableCell className="text-center">{row.quantity}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.avgPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedTab === 'customers' && (
            <div className="overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Avg. Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((row) => (
                    <TableRow key={row.customer}>
                      <TableCell className="font-medium">{row.customer}</TableCell>
                      <TableCell className="text-right">{row.orders}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.avgOrder)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4">
            <SimplePagination
              totalCount={selectedTab === 'items' ? filteredItems.length : filteredCustomers.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setCurrentPage(1)
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export const SalesReportTab = memo(SalesReportTabComponent)

const ReceivablesTabComponent = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 1),
    to: new Date(2025, 6, 30),
  })
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'customer-balance' | 'receivable-summary' | 'receivable-details' | 'aging-summary' | 'aging-details'>('customer-balance')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Mock data for Customer Balance
  const customerBalanceData = [
    { customerName: 'Keire', invoiceBalance: 124250.00, availableCredits: 1000.00, balance: 123250.00 },
    { customerName: 'Ida F. Mullen', invoiceBalance: 14900.00, availableCredits: 0.00, balance: 14900.00 },
    { customerName: 'Xantha Leon', invoiceBalance: 48275.00, availableCredits: 0.00, balance: 48275.00 },
    { customerName: 'Lee Bauer', invoiceBalance: 41202.50, availableCredits: 5000.00, balance: 36202.50 },
    { customerName: 'Kyra Marks', invoiceBalance: 24000.00, availableCredits: 0.00, balance: 24000.00 },
    { customerName: 'Vance Rollins', invoiceBalance: 42830.00, availableCredits: 0.00, balance: 42830.00 },
    { customerName: 'Mohammed Hammed Elhadad', invoiceBalance: 30.00, availableCredits: 0.00, balance: 30.00 },
    { customerName: 'PT Sinar Jaya', invoiceBalance: 85000.00, availableCredits: 2000.00, balance: 83000.00 },
  ]

  // Mock data for Receivable Summary
  const receivableSummaryData = [
    { customerName: 'Mohammed Hammed Elhadad', date: '2025-11-12', transaction: '#INVO00010', status: 'Draft', transactionType: 'Invoice', total: 30.00, balance: 30.00 },
    { customerName: 'Keire', date: '2025-11-12', transaction: '#INVO00011', status: 'Draft', transactionType: 'Invoice', total: 20550.00, balance: 20550.00 },
    { customerName: 'Xantha Leon', date: '2025-08-09', transaction: '#INVO00008', status: 'Sent', transactionType: 'Invoice', total: 17100.00, balance: 17100.00 },
    { customerName: '-', date: '2025-07-07', transaction: 'Credit Note', status: '-', transactionType: 'Credit Note', total: -5000.00, balance: -5000.00 },
    { customerName: 'Keire', date: '2025-07-07', transaction: '#INVO00001', status: 'Partially Paid', transactionType: 'Invoice', total: 105382.50, balance: 103700.00 },
    { customerName: 'Vance Rollins', date: '2025-07-07', transaction: '#INVO00006', status: 'Draft', transactionType: 'Invoice', total: 38200.00, balance: 38200.00 },
    { customerName: 'Ida F. Mullen', date: '2025-07-04', transaction: '#INVO00002', status: 'Sent', transactionType: 'Invoice', total: 14900.00, balance: 14900.00 },
    { customerName: 'Vance Rollins', date: '2025-07-04', transaction: '#INVO00007', status: 'Partially Paid', transactionType: 'Invoice', total: 8747.50, balance: 4630.00 },
    { customerName: 'Lee Bauer', date: '2025-07-04', transaction: '#INVO00009', status: 'Draft', transactionType: 'Invoice', total: 36202.50, balance: 36202.50 },
    { customerName: '-', date: '2025-07-01', transaction: 'Credit Note', status: '-', transactionType: 'Credit Note', total: -1000.00, balance: -1000.00 },
  ]

  // Mock data for Receivable Details
  const receivableDetailsData = [
    { customerName: 'Mohammed Hammed Elhadad', date: '2025-11-12', transaction: '#INVO00010', status: 'Draft', transactionType: 'Invoice', itemName: 'صابون ابركس', quantityOrdered: 1, itemPrice: 50.00, total: 50.00 },
    { customerName: 'Keire', date: '2025-11-12', transaction: '#INVO00011', status: 'Draft', transactionType: 'Invoice', itemName: 'iPhone', quantityOrdered: 8, itemPrice: 1500.00, total: 12000.00 },
    { customerName: 'Keire', date: '2025-11-12', transaction: '#INVO00011', status: 'Draft', transactionType: 'Invoice', itemName: 'Recreation', quantityOrdered: 10, itemPrice: 150.00, total: 1500.00 },
    { customerName: 'Keire', date: '2025-11-12', transaction: '#INVO00011', status: 'Draft', transactionType: 'Invoice', itemName: 'Shrugs', quantityOrdered: 3, itemPrice: 1500.00, total: 4500.00 },
    { customerName: 'Xantha Leon', date: '2025-08-09', transaction: '#INVO00008', status: 'Sent', transactionType: 'Invoice', itemName: 'Professional and technical services.', quantityOrdered: 5, itemPrice: 2000.00, total: 10000.00 },
    { customerName: 'Xantha Leon', date: '2025-08-09', transaction: '#INVO00008', status: 'Sent', transactionType: 'Invoice', itemName: 'Mamaearth Vitamin C Products', quantityOrdered: 15, itemPrice: 400.00, total: 6000.00 },
    { customerName: '-', date: '2025-07-07', transaction: 'Credit Note', status: '-', transactionType: 'Credit Note', itemName: 'oven', quantityOrdered: 0, itemPrice: -5000.00, total: -5000.00 },
    { customerName: '-', date: '2025-07-07', transaction: 'Credit Note', status: '-', transactionType: 'Credit Note', itemName: 'Clock', quantityOrdered: 0, itemPrice: -5000.00, total: -5000.00 },
    { customerName: 'Keire', date: '2025-07-07', transaction: '#INVO00001', status: 'Partially Paid', transactionType: 'Invoice', itemName: 'Shrugs', quantityOrdered: 1, itemPrice: 1500.00, total: 1500.00 },
    { customerName: 'Keire', date: '2025-07-07', transaction: '#INVO00001', status: 'Partially Paid', transactionType: 'Invoice', itemName: 'Recreation', quantityOrdered: 1, itemPrice: 150.00, total: 150.00 },
  ]

  // Mock data for Aging Summary
  const agingSummaryData = [
    { customerName: 'Keire', current: 0.00, days1_15: 20550.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 102700.00, total: 123250.00 },
    { customerName: 'Ida F. Mullen', current: 0.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 14900.00, total: 14900.00 },
    { customerName: 'Xantha Leon', current: 0.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 48275.00, total: 48275.00 },
    { customerName: 'Lee Bauer', current: 0.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 36202.50, total: 36202.50 },
    { customerName: 'Kyra Marks', current: 0.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 24000.00, total: 24000.00 },
    { customerName: 'Vance Rollins', current: 0.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 42830.00, total: 42830.00 },
    { customerName: 'Mohammed Hammed Elhadad', current: 30.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 0.00, total: 30.00 },
  ]

  // Mock data for Aging Details
  const agingDetailsData = [
    { date: '2025-08-08', transaction: '#INVO00001', type: 'Invoice', status: 'Partially Paid', customerName: 'Keire', age: '96 Days', amount: 105382.50, balanceDue: 102700.00 },
    { date: '2025-07-04', transaction: '#INVO00002', type: 'Invoice', status: 'Sent', customerName: 'Ida F. Mullen', age: '131 Days', amount: 14900.00, balanceDue: 14900.00 },
    { date: '2025-07-08', transaction: '#INVO00003', type: 'Invoice', status: 'Draft', customerName: 'Xantha Leon', age: '127 Days', amount: 31175.00, balanceDue: 31175.00 },
    { date: '2025-07-31', transaction: '#INVO00004', type: 'Invoice', status: 'Paid', customerName: 'Lee Bauer', age: '104 Days', amount: 10762.50, balanceDue: 0.00 },
    { date: '2025-07-20', transaction: '#INVO00005', type: 'Invoice', status: 'Partially Paid', customerName: 'Kyra Marks', age: '115 Days', amount: 24780.00, balanceDue: 24000.00 },
    { date: '2025-08-29', transaction: '#INVO00006', type: 'Invoice', status: 'Draft', customerName: 'Vance Rollins', age: '75 Days', amount: 38200.00, balanceDue: 38200.00 },
    { date: '2025-07-04', transaction: '#INVO00007', type: 'Invoice', status: 'Partially Paid', customerName: 'Vance Rollins', age: '131 Days', amount: 8747.50, balanceDue: 4630.00 },
    { date: '2025-09-22', transaction: '#INVO00008', type: 'Invoice', status: 'Sent', customerName: 'Xantha Leon', age: '51 Days', amount: 17100.00, balanceDue: 17100.00 },
    { date: '2025-07-04', transaction: '#INVO00009', type: 'Invoice', status: 'Draft', customerName: 'Lee Bauer', age: '131 Days', amount: 36202.50, balanceDue: 36202.50 },
  ]

  const filteredData = useMemo(() => {
    if (selectedTab === 'customer-balance') {
      return customerBalanceData.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'receivable-summary') {
      return receivableSummaryData.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transaction.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'receivable-details') {
      return receivableDetailsData.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transaction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'aging-summary') {
      return agingSummaryData.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'aging-details') {
      return agingDetailsData.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transaction.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return []
  }, [searchQuery, selectedTab])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalBalance = useMemo(
    () => customerBalanceData.reduce((sum, row) => sum + row.balance, 0),
    []
  )

  const agingSummaryTotals = useMemo(() => {
    return agingSummaryData.reduce((acc, row) => ({
      current: acc.current + row.current,
      days1_15: acc.days1_15 + row.days1_15,
      days16_30: acc.days16_30 + row.days16_30,
      days31_45: acc.days31_45 + row.days31_45,
      daysOver45: acc.daysOver45 + row.daysOver45,
      total: acc.total + row.total,
    }), { current: 0, days1_15: 0, days16_30: 0, days31_45: 0, daysOver45: 0, total: 0 })
  }, [])

  const handleReset = () => {
    setDateRange({
      from: new Date(2025, 5, 1),
      to: new Date(2025, 6, 30),
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId as any)
    setCurrentPage(1)
  }

  const dateRangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'LLL dd, y')} - ${format(
          dateRange.to,
          'LLL dd, y',
        )}`
      : format(dateRange.from, 'LLL dd, y')
    : 'Pick a date range'

  const receivablesTabItems = useMemo(
    () => [
      {
        id: 'customer-balance',
        title: 'Customer Balance',
      },
      {
        id: 'receivable-summary',
        title: 'Receivable Summary',
      },
      {
        id: 'receivable-details',
        title: 'Receivable Details',
      },
      {
        id: 'aging-summary',
        title: 'Aging Summary',
      },
      {
        id: 'aging-details',
        title: 'Aging Details',
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Section */}
      <Card>
        <CardContent className="px-4 py-2">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            {/* Date Range Picker */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Date Range</Label>
              <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-9 justify-start text-left font-normal shadow-none hover:bg-blue-50 hover:text-blue-700 border-input',
                      !dateRange?.from && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm">{dateRangeLabel}</span>
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
                      Select
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
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

      {/* Data Section */}
      <Card>
        <CardHeader className="pb-0 pl-6">
          <CardTitle className="text-base">Receivables Report</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            <div className="w-fit">
              <SmoothTab
                items={receivablesTabItems.map((item) => ({
                  ...item,
                  content: <></>,
                }))}
                defaultTabId="customer-balance"
                activeColor="bg-white dark:bg-gray-700 shadow-xs"
                value={selectedTab}
                onChange={handleTabChange}
              />
            </div>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              containerClassName="w-full sm:w-auto mb-4"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Table Content */}
          {selectedTab === 'customer-balance' && (
            <div className="overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead className="text-right">Invoice Balance</TableHead>
                    <TableHead className="text-right">Available Credits</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row: any) => (
                    <TableRow key={row.customerName}>
                      <TableCell className="font-medium">{row.customerName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.invoiceBalance)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.availableCredits)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold bg-gray-50 dark:bg-gray-900">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right"></TableCell>
                    <TableCell className="text-right"></TableCell>
                    <TableCell className="text-right font-mono">
                      {formatRupiah(totalBalance)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {selectedTab === 'receivable-summary' && (
            <div className="overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row: any, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.customerName}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell className="text-blue-600">{row.transaction}</TableCell>
                      <TableCell>
                        {row.status === 'Draft' && (
                          <Badge className="bg-gray-500 text-white hover:bg-gray-600">{row.status}</Badge>
                        )}
                        {row.status === 'Sent' && (
                          <Badge className="bg-orange-500 text-white hover:bg-orange-600">{row.status}</Badge>
                        )}
                        {row.status === 'Partially Paid' && (
                          <Badge className="bg-cyan-500 text-white hover:bg-cyan-600">{row.status}</Badge>
                        )}
                        {row.status === '-' && (
                          <span>-</span>
                        )}
                      </TableCell>
                      <TableCell>{row.transactionType}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.total)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedTab === 'receivable-details' && (
            <div className="overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-center">Quantity Ordered</TableHead>
                    <TableHead className="text-right">Item Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row: any, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.customerName}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell className="text-blue-600">{row.transaction}</TableCell>
                      <TableCell>
                        {row.status === 'Draft' && (
                          <Badge className="bg-gray-500 text-white hover:bg-gray-600">{row.status}</Badge>
                        )}
                        {row.status === 'Sent' && (
                          <Badge className="bg-orange-500 text-white hover:bg-orange-600">{row.status}</Badge>
                        )}
                        {row.status === 'Partially Paid' && (
                          <Badge className="bg-cyan-500 text-white hover:bg-cyan-600">{row.status}</Badge>
                        )}
                        {row.status === '-' && (
                          <span>-</span>
                        )}
                      </TableCell>
                      <TableCell>{row.transactionType}</TableCell>
                      <TableCell>{row.itemName}</TableCell>
                      <TableCell className="text-center">{row.quantityOrdered}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.itemPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedTab === 'aging-summary' && (
            <div className="overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">1-15 Days</TableHead>
                    <TableHead className="text-right">16-30 Days</TableHead>
                    <TableHead className="text-right">31-45 Days</TableHead>
                    <TableHead className="text-right">&gt; 45 Days</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row: any) => (
                    <TableRow key={row.customerName}>
                      <TableCell className="font-medium">{row.customerName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.current)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.days1_15)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.days16_30)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.days31_45)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.daysOver45)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold bg-gray-50 dark:bg-gray-900">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatRupiah(agingSummaryTotals.current)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatRupiah(agingSummaryTotals.days1_15)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatRupiah(agingSummaryTotals.days16_30)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatRupiah(agingSummaryTotals.days31_45)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatRupiah(agingSummaryTotals.daysOver45)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatRupiah(agingSummaryTotals.total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {selectedTab === 'aging-details' && (
            <div className="overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row: any, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell className="text-blue-600">{row.transaction}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>
                        {row.status === 'Draft' && (
                          <Badge className="bg-gray-500 text-white hover:bg-gray-600">{row.status}</Badge>
                        )}
                        {row.status === 'Sent' && (
                          <Badge className="bg-orange-500 text-white hover:bg-orange-600">{row.status}</Badge>
                        )}
                        {row.status === 'Partially Paid' && (
                          <Badge className="bg-cyan-500 text-white hover:bg-cyan-600">{row.status}</Badge>
                        )}
                        {row.status === 'Paid' && (
                          <Badge className="bg-green-500 text-white hover:bg-green-600">{row.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{row.customerName}</TableCell>
                      <TableCell>{row.age}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.amount)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(row.balanceDue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedTab !== 'customer-balance' && selectedTab !== 'receivable-summary' && selectedTab !== 'receivable-details' && selectedTab !== 'aging-summary' && selectedTab !== 'aging-details' && (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {receivablesTabItems.find(t => t.id === selectedTab)?.title}
              </h3>
              <p className="text-muted-foreground">This section is under development.</p>
            </div>
          )}

          {/* Pagination */}
          {(selectedTab === 'customer-balance' || selectedTab === 'receivable-summary' || selectedTab === 'receivable-details' || selectedTab === 'aging-summary' || selectedTab === 'aging-details') && (
            <div className="mt-4">
              <SimplePagination
                totalCount={filteredData.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(p) => setCurrentPage(p)}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
export const ReceivablesTab = memo(ReceivablesTabComponent)

const PayablesTabComponent = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payables Report</h3>
          <p className="text-muted-foreground">This tab will contain the Payables report content.</p>
        </CardContent>
      </Card>
    </div>
  )
}
export const PayablesTab = memo(PayablesTabComponent)

const BillSummaryTabComponent = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Bill Summary Report</h3>
          <p className="text-muted-foreground">This tab will contain the Bill Summary report content.</p>
        </CardContent>
      </Card>
    </div>
  )
}
export const BillSummaryTab = memo(BillSummaryTabComponent)

const ProductStockTabComponent = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Product Stock Report</h3>
          <p className="text-muted-foreground">This tab will contain the Product Stock report content.</p>
        </CardContent>
      </Card>
    </div>
  )
}
export const ProductStockTab = memo(ProductStockTabComponent)

const CashFlowTabComponent = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Cash Flow Report</h3>
          <p className="text-muted-foreground">This tab will contain the Cash Flow report content.</p>
        </CardContent>
      </Card>
    </div>
  )
}
export const CashFlowTab = memo(CashFlowTabComponent)

const TransactionTabComponent = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Transaction Report</h3>
          <p className="text-muted-foreground">This tab will contain the Transaction report content.</p>
        </CardContent>
      </Card>
    </div>
  )
}
export const TransactionTab = memo(TransactionTabComponent)

const IncomeSummaryTabComponent = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Income Summary Report</h3>
          <p className="text-muted-foreground">This tab will contain the Income Summary report content.</p>
        </CardContent>
      </Card>
    </div>
  )
}
export const IncomeSummaryTab = memo(IncomeSummaryTabComponent)

const ExpenseSummaryTabComponent = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Expense Summary Report</h3>
          <p className="text-muted-foreground">This tab will contain the Expense Summary report content.</p>
        </CardContent>
      </Card>
    </div>
  )
}
export const ExpenseSummaryTab = memo(ExpenseSummaryTabComponent)

const IncomeVsExpenseTabComponent = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Income VS Expense Report</h3>
          <p className="text-muted-foreground">This tab will contain the Income VS Expense report content.</p>
        </CardContent>
      </Card>
    </div>
  )
}
export const IncomeVsExpenseTab = memo(IncomeVsExpenseTabComponent)

const TaxSummaryTabComponent = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tax Summary Report</h3>
          <p className="text-muted-foreground">This tab will contain the Tax Summary report content.</p>
        </CardContent>
      </Card>
    </div>
  )
}
export const TaxSummaryTab = memo(TaxSummaryTabComponent)
