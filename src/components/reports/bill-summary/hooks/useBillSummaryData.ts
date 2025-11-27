import { useState, useMemo, useCallback } from 'react'
import type { DateRange } from 'react-day-picker'
import { mockBills, type Bill, type BillStatus, type BillSummaryStats } from '../constants'

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

  // Filter and search bills
  const filteredBills = useMemo(() => {
    let filtered = [...mockBills]

    // Filter by date range
    if (dateRange?.from) {
      filtered = filtered.filter((bill) => {
        const billDate = new Date(bill.date)
        const fromDate = dateRange.from!
        const toDate = dateRange.to || dateRange.from!
        return billDate >= fromDate && billDate <= toDate
      })
    }

    // Filter by vendor
    if (selectedVendor !== 'All') {
      filtered = filtered.filter((bill) => bill.vendor === selectedVendor)
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((bill) => bill.status === selectedStatus)
    }

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
  }, [dateRange, selectedVendor, selectedStatus, searchQuery])

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
  }, [])

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
