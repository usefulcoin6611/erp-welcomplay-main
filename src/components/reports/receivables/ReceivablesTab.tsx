'use client'

import { memo, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { ReceivablesFilters } from './ReceivablesFilters'
import { CustomerBalanceTable } from './tables/CustomerBalanceTable'
import { ReceivableSummaryTable, ReceivableDetailsTable, AgingSummaryTable, AgingDetailsTable } from './tables'
import { useReceivablesData } from './hooks/useReceivablesData'

const ReceivablesTabComponent = () => {
  const t = useTranslations('reports.receivables')
  
  const {
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
    filteredData,
    paginatedData,
    totalBalance,
    agingSummaryTotals,
    handleTabChange,
    handleReset,
    handleApplyFilters,
  } = useReceivablesData()

  const receivablesTabItems = useMemo(
    () => [
      { id: 'customer-balance', title: t('customerBalanceTab') },
      { id: 'receivable-summary', title: t('receivableSummaryTab') },
      { id: 'receivable-details', title: t('receivableDetailsTab') },
      { id: 'aging-summary', title: t('agingSummaryTab') },
      { id: 'aging-details', title: t('agingDetailsTab') },
    ],
    [t],
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Section */}
      <ReceivablesFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        isDateRangeOpen={isDateRangeOpen}
        setIsDateRangeOpen={setIsDateRangeOpen}
        onReset={handleReset}
        onApply={handleApplyFilters}
      />

      {/* Main Data Card with Tabs */}
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
            <div className="w-full sm:w-auto shrink-0 mb-3">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchCustomers')}
                containerClassName="w-full sm:w-48"
              />
            </div>
          </div>
        </div>

        <CardContent className="pt-0">
          <div style={{ minHeight: '400px' }}>
            {/* Customer Balance Table */}
            {selectedTab === 'customer-balance' && (
              <CustomerBalanceTable 
                data={paginatedData as any}
                totalBalance={totalBalance}
              />
            )}

            {/* Receivable Summary Table */}
            {selectedTab === 'receivable-summary' && (
              <ReceivableSummaryTable
                data={paginatedData as any}
                allData={filteredData as any}
              />
            )}

            {/* Receivable Details Table */}
            {selectedTab === 'receivable-details' && (
              <ReceivableDetailsTable
                data={paginatedData as any}
                allData={filteredData as any}
              />
            )}

            {/* Aging Summary Table */}
            {selectedTab === 'aging-summary' && (
              <AgingSummaryTable
                data={paginatedData as any}
                allData={filteredData as any}
                totals={agingSummaryTotals as any}
              />
            )}

            {/* Aging Details Table */}
            {selectedTab === 'aging-details' && (
              <AgingDetailsTable
                data={paginatedData as any}
                allData={filteredData as any}
              />
            )}
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="mt-4">
              <SimplePagination
                currentPage={currentPage}
                totalCount={filteredData.length}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
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
