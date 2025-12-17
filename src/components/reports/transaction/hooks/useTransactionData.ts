import { useState, useMemo } from 'react'
import { mockTransactions, mockAccountSummary } from '../constants'

export function useTransactionData() {
  // Get default dates (last 6 months to current)
  const getDefaultStartMonth = () => {
    const date = new Date()
    date.setMonth(date.getMonth() - 5)
    return date.toISOString().slice(0, 7)
  }

  const getDefaultEndMonth = () => {
    return new Date().toISOString().slice(0, 7)
  }

  // Filter states
  const [startMonth, setStartMonth] = useState<string>(getDefaultStartMonth())
  const [endMonth, setEndMonth] = useState<string>(getDefaultEndMonth())
  const [selectedAccount, setSelectedAccount] = useState<string>('All')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filtered data
  const filteredData = useMemo(() => {
    return mockTransactions.filter((transaction) => {
      // Date filter
      const transactionDate = transaction.date.slice(0, 7)
      if (transactionDate < startMonth || transactionDate > endMonth) {
        return false
      }
      
      // Account filter
      if (selectedAccount !== 'All' && transaction.account !== selectedAccount) {
        return false
      }
      
      // Category filter
      if (selectedCategory !== 'All' && transaction.category !== selectedCategory) {
        return false
      }
      
      return true
    })
  }, [startMonth, endMonth, selectedAccount, selectedCategory])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Account summary filtered
  const accountSummary = useMemo(() => {
    if (selectedAccount !== 'All') {
      return mockAccountSummary.filter(acc => 
        acc.holderName === selectedAccount || 
        `${acc.bankName} - ${acc.holderName}` === selectedAccount
      )
    }
    return mockAccountSummary
  }, [selectedAccount])

  // Handlers
  const handleApplyFilters = () => {
    setCurrentPage(1)
  }

  const handleReset = () => {
    setStartMonth(getDefaultStartMonth())
    setEndMonth(getDefaultEndMonth())
    setSelectedAccount('All')
    setSelectedCategory('All')
    setCurrentPage(1)
  }

  const formatDateRange = () => {
    const start = new Date(startMonth + '-01')
    const end = new Date(endMonth + '-01')
    return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
  }

  // Pagination calculations
  const totalRecords = filteredData.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  return {
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
  }
}
