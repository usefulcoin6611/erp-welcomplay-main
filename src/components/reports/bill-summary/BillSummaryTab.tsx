'use client'

import { memo, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Receipt, Wallet, AlertCircle, Calendar } from 'lucide-react'
import { BillSummaryFilters } from './BillSummaryFilters'
import { BillSummaryChart } from './BillSummaryChart'
import { BillsTable } from './tables/BillsTable'
import { useBillSummaryData } from './hooks/useBillSummaryData'

function BillSummaryTabComponent() {
  const t = useTranslations('reports.billSummary')
  
  const {
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
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    
    // Data
    paginatedBills,
    summaryStats,
    monthlyChartData,
    
    // Handlers
    handleTabChange,
    handleReset,
    handleApplyFilters,
    
    // Pagination
    totalPages,
    totalRecords,
  } = useBillSummaryData()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateRange = () => {
    if (!dateRange?.from) return 'All Time'
    if (!dateRange.to) return new Date(dateRange.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${new Date(dateRange.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(dateRange.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const billTabItems = useMemo(
    () => [
      { id: 'summary', title: 'Summary' },
      { id: 'bills', title: 'Bills' },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Section */}
      <BillSummaryFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        isDateRangeOpen={isDateRangeOpen}
        setIsDateRangeOpen={setIsDateRangeOpen}
        selectedVendor={selectedVendor}
        setSelectedVendor={setSelectedVendor}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onApply={handleApplyFilters}
        onReset={handleReset}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Bill */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total Bill</p>
              <p className="text-lg font-bold">{formatCurrency(summaryStats.totalBill)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Paid */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(summaryStats.totalPaid)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Due */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total Due</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(summaryStats.totalDue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Card>
        <CardContent className="pt-4 px-4 pb-0">
          <div className="flex flex-col gap-4">
            {/* Tab Navigation */}
            <SmoothTab
              value={selectedTab}
              onChange={handleTabChange}
              className="!w-fit"
              activeColor="bg-white shadow-sm"
              items={billTabItems.map((item) => ({
                ...item,
                content: <></>,
              }))}
            />

            {/* Tab Content with persistent wrapper */}
            <div style={{ minHeight: '400px' }}>
              {/* Summary Tab */}
              {selectedTab === 'summary' && (
                <BillSummaryChart data={monthlyChartData} />
              )}

              {/* Bills Tab */}
              {selectedTab === 'bills' && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold whitespace-nowrap">Bill Report</h3>
                  </div>
                  <BillsTable data={paginatedBills} />
                  
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
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const BillSummaryTab = memo(BillSummaryTabComponent)
