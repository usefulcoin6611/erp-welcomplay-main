import { useState, useMemo, useEffect } from 'react'
import { SALES_BY_ITEM_DATA, SALES_BY_CUSTOMER_DATA } from '../constants'

export type SalesTabType = 'items' | 'customers'

export function useSalesData() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<SalesTabType>('items')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return SALES_BY_ITEM_DATA
    const query = searchQuery.toLowerCase()
    return SALES_BY_ITEM_DATA.filter(
      (row) =>
        row.item.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query),
    )
  }, [searchQuery])

  // Filter customers by search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return SALES_BY_CUSTOMER_DATA
    const query = searchQuery.toLowerCase()
    return SALES_BY_CUSTOMER_DATA.filter((row) =>
      row.customer.toLowerCase().includes(query),
    )
  }, [searchQuery])

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

  // Calculate totals
  const totalRevenue = useMemo(
    () => SALES_BY_ITEM_DATA.reduce((sum, row) => sum + row.revenue, 0),
    [],
  )
  
  const totalOrders = useMemo(
    () => SALES_BY_ITEM_DATA.reduce((sum, row) => sum + row.quantity, 0),
    [],
  )
  
  const totalCustomers = useMemo(() => SALES_BY_CUSTOMER_DATA.length, [])

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId as SalesTabType)
    setCurrentPage(1)
  }

  return {
    // State
    searchQuery,
    selectedTab,
    currentPage,
    pageSize,
    // Data
    paginatedItems,
    paginatedCustomers,
    filteredItems,
    filteredCustomers,
    totalRevenue,
    totalOrders,
    totalCustomers,
    // Actions
    setSearchQuery,
    setCurrentPage,
    setPageSize,
    handleTabChange,
  }
}
