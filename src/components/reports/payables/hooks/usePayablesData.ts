import { useMemo, useState, useEffect, useCallback } from 'react'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { PayableTab } from '../constants'

export function usePayablesData() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  })
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<PayableTab>('vendor-balance')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // API data state
  const [apiData, setApiData] = useState<{
    vendorBalance: any[]
    payableSummary: any[]
    payableDetails: any[]
    agingSummary: any[]
    agingDetails: any[]
    totalBalance: number
    agingSummaryTotals: any
  }>({
    vendorBalance: [],
    payableSummary: [],
    payableDetails: [],
    agingSummary: [],
    agingDetails: [],
    totalBalance: 0,
    agingSummaryTotals: { current: 0, days1_15: 0, days16_30: 0, days31_45: 0, over45Days: 0, total: 0 },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (dateRange?.from) params.set('startDate', format(dateRange.from, 'yyyy-MM-dd'))
      if (dateRange?.to) params.set('endDate', format(dateRange.to, 'yyyy-MM-dd'))
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/reports/payables?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch payables data')
      const json = await res.json()
      if (json.success && json.data) {
        setApiData(json.data)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load payables data')
    } finally {
      setLoading(false)
    }
  }, [dateRange, searchQuery])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase()
    if (selectedTab === 'vendor-balance') {
      return apiData.vendorBalance.filter(item =>
        item.vendor.toLowerCase().includes(query)
      )
    } else if (selectedTab === 'payable-summary') {
      return apiData.payableSummary.filter(item =>
        item.vendor.toLowerCase().includes(query) ||
        item.transaction.toLowerCase().includes(query)
      )
    } else if (selectedTab === 'payable-details') {
      return apiData.payableDetails.filter(item =>
        item.vendor.toLowerCase().includes(query) ||
        item.transaction.toLowerCase().includes(query) ||
        item.itemName.toLowerCase().includes(query)
      )
    } else if (selectedTab === 'aging-summary') {
      return apiData.agingSummary.filter(item =>
        item.vendor.toLowerCase().includes(query)
      )
    } else if (selectedTab === 'aging-details') {
      return apiData.agingDetails.filter(item =>
        item.vendor.toLowerCase().includes(query) ||
        item.transaction.toLowerCase().includes(query)
      )
    }
    return []
  }, [selectedTab, searchQuery, apiData])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalBalance = useMemo(() => {
    return { closingBalance: apiData.totalBalance }
  }, [apiData.totalBalance])

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId as PayableTab)
    setCurrentPage(1)
    setSearchQuery('')
  }

  const handleReset = () => {
    setDateRange({
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(),
    })
    setSearchQuery('')
    setCurrentPage(1)
    fetchData()
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    setIsDateRangeOpen(false)
    fetchData()
  }

  return {
    // State
    dateRange,
    setDateRange,
    isDateRangeOpen,
    setIsDateRangeOpen,
    selectedTab,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    loading,
    error,
    
    // Data
    filteredData,
    paginatedData,
    totalBalance,
    agingSummaryTotals: apiData.agingSummaryTotals,
    
    // Handlers
    handleTabChange,
    handleReset,
    handleApplyFilters,
  }
}
