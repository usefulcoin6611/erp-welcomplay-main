'use client'

import { memo } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { TrendingUp, TrendingDown, ArrowLeftRight, Hash } from 'lucide-react'
import { TransactionFilters } from './TransactionFilters'
import { TransactionTable } from './TransactionTable'
import { useTransactionData } from './hooks/useTransactionData'

function TransactionTabComponent() {
  const {
    // Filter states
    startMonth,
    setStartMonth,
    endMonth,
    setEndMonth,
    selectedAccount,
    setSelectedAccount,
    selectedCategory,
    setSelectedCategory,
    
    // Filter options (dynamic from API)
    accountOptions,
    categoryOptions,
    
    // Pagination states
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    
    // Data
    paginatedData,
    
    // Handlers
    handleApplyFilters,
    handleReset,
    formatDateRange,
    
    // Pagination
    totalPages,
    totalRecords,
  } = useTransactionData()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate summary stats from paginated data (all transactions)
  const totalIncome = paginatedData
    .filter(t => t.category === 'Income' || t.type === 'Journal Entry')
    .reduce((sum, t) => sum + (t.debit || 0), 0)
  
  const totalExpense = paginatedData
    .filter(t => t.category === 'Expense')
    .reduce((sum, t) => sum + (t.debit || 0), 0)

  const totalTransfer = paginatedData
    .filter(t => t.category === 'Transfer')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Section */}
      <TransactionFilters
        startMonth={startMonth}
        setStartMonth={setStartMonth}
        endMonth={endMonth}
        setEndMonth={setEndMonth}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onApply={handleApplyFilters}
        onReset={handleReset}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
      />

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Records */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total Transactions</p>
              <p className="text-lg font-bold">{totalRecords}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Income */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Expense */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Expense</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Transfer */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
              <ArrowLeftRight className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Transfer</p>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(totalTransfer)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <div className="pt-4 pb-0">
          {/* Title */}
          <div className="px-6 mb-3 flex items-center justify-between">
            <CardTitle className="text-base">Transaction List</CardTitle>
            <span className="text-xs text-muted-foreground">{formatDateRange()}</span>
          </div>
        </div>

        <CardContent className="pt-0">
          <div style={{ minHeight: '400px' }}>
            <div className="p-4 space-y-4">
              <TransactionTable data={paginatedData} />
              
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

export const TransactionTab = memo(TransactionTabComponent)
