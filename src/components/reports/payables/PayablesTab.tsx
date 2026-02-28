'use client'

import { memo, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { PayablesFilters } from './PayablesFilters'
import { VendorBalanceTable } from './tables/VendorBalanceTable'
import { PayableSummaryTable } from './tables/PayableSummaryTable'
import { PayableDetailsTable } from './tables/PayableDetailsTable'
import { AgingSummaryTable } from './tables/AgingSummaryTable'
import { AgingDetailsTable } from './tables/AgingDetailsTable'
import { usePayablesData } from './hooks/usePayablesData'

const PayablesTabComponent = () => {
  const t = useTranslations('reports.payables')
  
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
  } = usePayablesData()

  const payablesTabItems = useMemo(
    () => [
      { id: 'vendor-balance', title: t('vendorBalanceTab') },
      { id: 'payable-summary', title: t('payableSummaryTab') },
      { id: 'payable-details', title: t('payableDetailsTab') },
      { id: 'aging-summary', title: t('agingSummaryTab') },
      { id: 'aging-details', title: t('agingDetailsTab') },
    ],
    [t],
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Section */}
      <PayablesFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        isDateRangeOpen={isDateRangeOpen}
        setIsDateRangeOpen={setIsDateRangeOpen}
        onApply={handleApplyFilters}
        onReset={handleReset}
        selectedTab={selectedTab}
        exportData={filteredData}
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
                items={payablesTabItems.map((item) => ({
                  ...item,
                  content: <></>,
                }))}
                defaultTabId="vendor-balance"
                activeColor="bg-white dark:bg-gray-700 shadow-xs"
                value={selectedTab}
                onChange={handleTabChange}
              />
            </div>
            <div className="w-full sm:w-auto shrink-0 mb-3">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                containerClassName="w-full sm:w-48"
              />
            </div>
          </div>
        </div>

        <CardContent className="pt-0">
          <div>
            {/* Vendor Balance Table */}
            {selectedTab === 'vendor-balance' && (
              <VendorBalanceTable 
                data={paginatedData as any}
                totalBalance={totalBalance}
              />
            )}

            {/* Payable Summary Table */}
            {selectedTab === 'payable-summary' && (
              <PayableSummaryTable
                data={paginatedData as any}
                allData={filteredData as any}
              />
            )}

            {/* Payable Details Table */}
            {selectedTab === 'payable-details' && (
              <PayableDetailsTable
                data={paginatedData as any}
                allData={filteredData as any}
              />
            )}

            {/* Aging Summary Table */}
            {selectedTab === 'aging-summary' && (
              <AgingSummaryTable
                data={paginatedData as any}
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

export const PayablesTab = memo(PayablesTabComponent)
