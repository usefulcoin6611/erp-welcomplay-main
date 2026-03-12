'use client'

import { memo, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { SearchInput } from '@/components/ui/search-input'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { SalesFilters } from './SalesFilters'
import { SalesByItemTable } from './tables/SalesByItemTable'
import { SalesByCustomerTable } from './tables/SalesByCustomerTable'
import { useSalesData } from './hooks/useSalesData'

function SalesReportTabComponent() {
  const t = useTranslations('reports.salesReport')
  
  const {
    searchQuery,
    selectedTab,
    currentPage,
    pageSize,
    dateRange,
    setDateRange,
    loading,
    error,
    paginatedItems,
    paginatedCustomers,
    filteredItems,
    filteredCustomers,
    setSearchQuery,
    setCurrentPage,
    setPageSize,
    handleTabChange,
    handleApplyFilters,
    handleReset,
  } = useSalesData()

  const salesTabItems = useMemo(
    () => [
      {
        id: 'items',
        title: t('itemsTab'),
      },
      {
        id: 'customers',
        title: t('customersTab'),
      },
    ],
    [t],
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Section */}
      <SalesFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onApply={handleApplyFilters}
        onReset={handleReset}
        selectedTab={selectedTab}
        itemsData={filteredItems}
        customersData={filteredCustomers}
      />

      {/* Data Section */}
      <Card>
        <div className="pt-4 pb-0">
          {/* Title */}
          <div className="px-6 mb-3">
            <CardTitle className="text-base">{t('title')}</CardTitle>
          </div>
          {/* Tabs + Search Inline */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-6">
            <div className="w-full sm:flex-1 overflow-x-auto">
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
            <div className="w-full sm:w-auto shrink-0 mb-3">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  selectedTab === 'items' ? t('searchItems') : t('searchCustomers')
                }
                containerClassName="w-full sm:w-48"
              />
            </div>
          </div>
        </div>
        <CardContent className="pt-0">
          <div>
            {/* Loading State */}
            {loading && (
              <div className="space-y-3 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex items-center justify-center h-40 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Table Content */}
            {!loading && !error && selectedTab === 'items' && (
              <SalesByItemTable data={paginatedItems} />
            )}
            {!loading && !error && selectedTab === 'customers' && (
              <SalesByCustomerTable data={paginatedCustomers} />
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && (
            <div className="mt-4">
              <SimplePagination
                totalCount={
                  selectedTab === 'items'
                    ? filteredItems.length
                    : filteredCustomers.length
                }
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

export const SalesReportTab = memo(SalesReportTabComponent)
