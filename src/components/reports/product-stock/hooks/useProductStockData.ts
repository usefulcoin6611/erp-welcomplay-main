import { useState, useMemo, useCallback, useEffect } from 'react'
import type { StockStatus } from '../constants'

export type ProductStock = {
  id: string
  name: string
  sku: string
  category: string
  categoryId: string | null
  unit: string
  quantity: number
  salePrice: number
  purchasePrice: number
  type: string
  status: string
}

export function useProductStockData() {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<StockStatus>('all')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // API data state
  const [products, setProducts] = useState<ProductStock[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'All') {
        // Find category id from name
        const cat = categories.find(c => c.name === selectedCategory)
        if (cat) params.set('categoryId', cat.id)
      }
      if (selectedStatus !== 'all') params.set('status', selectedStatus)

      const res = await fetch(`/api/reports/product-stock?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch product stock data')
      const json = await res.json()
      if (json.success && json.data) {
        setProducts(json.data.products || [])
        if (json.data.categories) setCategories(json.data.categories)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load product stock data')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedStatus, categories])

  // Initial fetch (without category filter to get all categories)
  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/reports/product-stock', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch product stock data')
        const json = await res.json()
        if (json.success && json.data) {
          setProducts(json.data.products || [])
          setCategories(json.data.categories || [])
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load product stock data')
      } finally {
        setLoading(false)
      }
    }
    initialFetch()
  }, [])

  // Filtered data (client-side filtering for instant feedback)
  const filteredData = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false
      }
      if (selectedStatus !== 'all' && product.status !== selectedStatus) {
        return false
      }
      return true
    })
  }, [products, selectedCategory, selectedStatus])

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

  // Category options for filter
  const categoryOptions = useMemo(() => {
    return ['All', ...categories.map(c => c.name)]
  }, [categories])

  // Handlers
  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const handleReset = useCallback(() => {
    setSelectedCategory('All')
    setSelectedStatus('all')
    setCurrentPage(1)
  }, [])

  // Pagination calculations
  const totalRecords = filteredData.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  return {
    // Filter states
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    categoryOptions,
    loading,
    error,
    
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
