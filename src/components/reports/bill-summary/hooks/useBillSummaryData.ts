import { useState, useMemo, useCallback, useEffect } from 'react'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import type { BillStatus, BillSummaryStats } from '../constants'

export type Bill = {
  id: string
  billNumber: string
  vendor: string
  vendorId: string
  category: string
  date: string
  dueDate: string
  total: number
  paidAmount: number
  dueAmount: number
  status: string
}

export const useBillSummaryData = () => {
  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<BillStatus | 'all'>('all')
  
  // UI states
  const [selectedTab, setSelectedTab] = useState<'summary' | 'bills'>('summary')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // API data state
  const [bills, setBills] = useState<Bill[]>([])
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (dateRange?.from) params.set('startDate', format(dateRange.from, 'yyyy-MM-dd'))
      if (dateRange?.to) params.set('endDate', format(dateRange.to, 'yyyy-MM-dd'))
      if (selectedVendor !== 'All') params.set('vendorId', selectedVendor)
      if (selectedStatus !== 'all') params.set('status', selectedStatus)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/reports/bill-summary?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch bill summary data')
      const json = await res.json()
      if (json.success && json.data) {
        setBills(json.data.bills || [])
        setVendors(json.data.vendors || [])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load bill summary data')
    } finally {
      setLoading(false)
    }
  }, [dateRange, selectedVendor, selectedStatus, searchQuery])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter and search bills (client-side for instant feedback)
  const filteredBills = useMemo(() => {
    let filtered = [...bills]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (bill) =>
          bill.billNumber.toLowerCase().includes(query) ||
          bill.vendor.toLowerCase().includes(query) ||
          bill.category.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [bills, searchQuery])

  // Calculate summary statistics
  const summaryStats: BillSummaryStats = useMemo(() => {
    return filteredBills.reduce(
      (acc, bill) => ({
        totalBill: acc.totalBill + bill.total,
        totalPaid: acc.totalPaid + bill.paidAmount,
        totalDue: acc.totalDue + bill.dueAmount,
      }),
      { totalBill: 0, totalPaid: 0, totalDue: 0 }
    )
  }, [filteredBills])

  // Paginate bills
  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredBills.slice(startIndex, endIndex)
  }, [filteredBills, currentPage, pageSize])

  // Calculate monthly data for chart
  const monthlyChartData = useMemo(() => {
    const monthlyData: Record<string, number> = {}
    
    filteredBills.forEach((bill) => {
      const date = new Date(bill.date)
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + bill.total
    })

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6) // Last 6 months
  }, [filteredBills])

  // Handlers
  const handleTabChange = useCallback((tabId: string) => {
    setSelectedTab(tabId as 'summary' | 'bills')
  }, [])

  const handleReset = useCallback(() => {
    setDateRange(undefined)
    setSelectedVendor('All')
    setSelectedStatus('all')
    setSearchQuery('')
    setCurrentPage(1)
  }, [])

  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1)
    setIsDateRangeOpen(false)
    fetchData()
  }, [fetchData])

  // Vendor options for filter
  const vendorOptions = useMemo(() => {
    return ['All', ...vendors.map(v => v.name)]
  }, [vendors])

  return {
    // Filter states
    dateRange,
    setDateRange,
    isDateRangeOpen,
    setIsDateRangeOpen,
    selectedVendor,
    setSelectedVendor,
    selectedStatus,
    setSelectedStatus,
    vendorOptions,
    loading,
    error,
    
    // UI states
    selectedTab,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    
    // Data
    filteredBills,
    paginatedBills,
    summaryStats,
    monthlyChartData,
    
    // Handlers
    handleTabChange,
    handleReset,
    handleApplyFilters,
    
    // Pagination info
    totalPages: Math.ceil(filteredBills.length / pageSize),
    totalRecords: filteredBills.length,
  }
}
