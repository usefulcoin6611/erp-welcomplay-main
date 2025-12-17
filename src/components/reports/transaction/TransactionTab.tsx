'use client'

import { memo } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { FileText, Calendar, Wallet, Hash, DollarSign } from 'lucide-react'
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
    
    // Pagination states
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    
    // Data
    paginatedData,
    accountSummary,
    
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
      />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Report Info Card */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Report</p>
              <p className="text-sm font-semibold">Transaction Summary</p>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        {selectedAccount !== 'All' && (
          <Card className="shadow-none">
            <CardContent className="px-3 py-2 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Account</p>
                <p className="text-sm font-semibold">{selectedAccount}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Info Card */}
        {selectedCategory !== 'All' && (
          <Card className="shadow-none">
            <CardContent className="px-3 py-2 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                <Hash className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-semibold">{selectedCategory}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Duration Card */}
        <Card className="shadow-none">
          <CardContent className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-semibold">{formatDateRange()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accountSummary.map((account) => (
          <Card key={account.id} className="shadow-none">
            <CardContent className="px-3 py-2 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  {account.type === 'cash' 
                    ? account.holderName 
                    : account.type === 'online'
                    ? account.holderName
                    : `${account.bankName} - ${account.holderName}`
                  }
                </p>
                <p className={`text-lg font-bold ${account.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(account.total)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card>
        <div className="pt-4 pb-0">
          {/* Title */}
          <div className="px-6 mb-3">
            <CardTitle className="text-base">Transaction List</CardTitle>
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
