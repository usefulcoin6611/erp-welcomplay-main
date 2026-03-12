'use client'

import { memo } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Package, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { ProductStockFilters } from './ProductStockFilters'
import { ProductStockTable } from './ProductStockTable'
import { useProductStockData } from './hooks/useProductStockData'

function ProductStockTabComponent() {
  const {
    // Filter states
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    categoryOptions,
    
    // Pagination states
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    
    // Data
    filteredData,
    paginatedData,
    summaryStats,
    
    // Handlers
    handleApplyFilters,
    handleReset,
    
    // Pagination
    totalPages,
    totalRecords,
  } = useProductStockData()

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Section */}
      <ProductStockFilters
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onApply={handleApplyFilters}
        onReset={handleReset}
        categoryOptions={categoryOptions}
        exportData={filteredData}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total Products</p>
              <p className="text-lg font-bold">{summaryStats.totalProducts}</p>
            </div>
          </CardContent>
        </Card>

        {/* In Stock */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">In Stock</p>
              <p className="text-lg font-bold text-green-600">{summaryStats.inStock}</p>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Low Stock</p>
              <p className="text-lg font-bold text-yellow-600">{summaryStats.lowStock}</p>
            </div>
          </CardContent>
        </Card>

        {/* Out of Stock */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Out of Stock</p>
              <p className="text-lg font-bold text-red-600">{summaryStats.outOfStock}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <div className="pt-4 pb-0">
          {/* Title */}
          <div className="px-6 mb-3">
            <CardTitle className="text-base">Product Stock</CardTitle>
          </div>
        </div>

        <CardContent className="pt-0">
          <div style={{ minHeight: '400px' }}>
            <div className="p-4 space-y-4">
              <ProductStockTable data={paginatedData} />
              
              {/* Pagination */}
              {totalRecords > 0 && (
                <div className="mt-4">
                  <SimplePagination
                    currentPage={currentPage}
                    totalCount={totalRecords}
                    onPageChange={setCurrentPage}
                    pageSize={pageSize}
                    onPageSizeChange={(size) => {
                      setPageSize(size)
                      setCurrentPage(1)
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const ProductStockTab = memo(ProductStockTabComponent)
