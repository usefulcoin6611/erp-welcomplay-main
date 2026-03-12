import { useState, useMemo, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'

export type SalesTabType = 'items' | 'customers'

export type SalesByItemRow = {
  item: string
  quantity: number
  revenue: number
  avgPrice: number
  status: string
}

export type SalesByCustomerRow = {
  customerId: string
  customer: string
  orders: number
  revenue: number
  avgOrder: number
  priority: string
}

export function useSalesData() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<SalesTabType>('items')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  })

  // API data state
  const [byItem, setByItem] = useState<SalesByItemRow[]>([])
  const [byCustomer, setByCustomer] = useState<SalesByCustomerRow[]>([])
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0, totalCustomers: 0 })
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

      const res = await fetch(`/api/reports/sales?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch sales data')
      const json = await res.json()
      if (json.success && json.data) {
        setByItem(json.data.byItem || [])
        setByCustomer(json.data.byCustomer || [])
        setSummary(json.data.summary || { totalRevenue: 0, totalOrders: 0, totalCustomers: 0 })
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }, [dateRange, searchQuery])

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedTab])

  // Filter items by search query (client-side for instant feedback)
  const filteredItems = useMemo(() => {
    if (!searchQuery) return byItem
    const query = searchQuery.toLowerCase()
    return byItem.filter(
      (row) =>
        row.item.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query),
    )
  }, [byItem, searchQuery])

  // Filter customers by search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return byCustomer
    const query = searchQuery.toLowerCase()
    return byCustomer.filter((row) =>
      row.customer.toLowerCase().includes(query),
    )
  }, [byCustomer, searchQuery])

  // Paginate items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredItems.slice(startIndex, endIndex)
  }, [filteredItems, currentPage, pageSize])

  // Paginate customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredCustomers.slice(startIndex, endIndex)
  }, [filteredCustomers, currentPage, pageSize])

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId as SalesTabType)
    setCurrentPage(1)
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchData()
  }

  const handleReset = () => {
    setDateRange({
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(),
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  return {
    // State
    searchQuery,
    selectedTab,
    currentPage,
    pageSize,
    dateRange,
    setDateRange,
    loading,
    error,
    // Data
    paginatedItems,
    paginatedCustomers,
    filteredItems,
    filteredCustomers,
    totalRevenue: summary.totalRevenue,
    totalOrders: summary.totalOrders,
    totalCustomers: summary.totalCustomers,
    // Actions
    setSearchQuery,
    setCurrentPage,
    setPageSize,
    handleTabChange,
    handleApplyFilters,
    handleReset,
  }
}
