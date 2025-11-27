import { useState, useMemo } from 'react'
import { mockProductStocks, type StockStatus } from '../constants'

export function useProductStockData() {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<StockStatus>('all')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filtered data
  const filteredData = useMemo(() => {
    return mockProductStocks.filter((product) => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false
      }
      if (selectedStatus !== 'all' && product.status !== selectedStatus) {
        return false
      }
      return true
    })
  }, [selectedCategory, selectedStatus])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalProducts = filteredData.length
    const inStock = filteredData.filter(p => p.status === 'in-stock').length
    const lowStock = filteredData.filter(p => p.status === 'low-stock').length
    const outOfStock = filteredData.filter(p => p.status === 'out-of-stock').length
    const totalQuantity = filteredData.reduce((sum, p) => sum + p.quantity, 0)

    return {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      totalQuantity,
    }
  }, [filteredData])

  // Handlers
  const handleApplyFilters = () => {
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSelectedCategory('All')
    setSelectedStatus('all')
    setCurrentPage(1)
  }

  // Pagination calculations
  const totalRecords = filteredData.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  return {
    // Filter states
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    
    // Pagination states
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    
    // Data
    paginatedData,
    summaryStats,
    
    // Handlers
    handleApplyFilters,
    handleReset,
    
    // Pagination
    totalPages,
    totalRecords,
  }
}
