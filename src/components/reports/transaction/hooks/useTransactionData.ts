import { useState, useMemo, useEffect, useCallback } from 'react'

type Transaction = {
  id: string
  date: string
  type: string
  reference: string
  description: string
  account: string
  category: string
  debit: number
  credit: number
  amount: number
}

type AccountSummary = {
  id: string
  holderName: string
  bankName: string
  accountNumber: string
}

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

  // API data state
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accountSummaryData, setAccountSummaryData] = useState<AccountSummary[]>([])
  const [totalRecordsFromApi, setTotalRecordsFromApi] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('startMonth', startMonth)
      params.set('endMonth', endMonth)
      if (selectedAccount !== 'All') params.set('accountId', selectedAccount)
      if (selectedCategory !== 'All') params.set('category', selectedCategory)

      const res = await fetch(`/api/reports/transaction?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch transaction data')
      const json = await res.json()
      if (json.success && json.data) {
        setTransactions(json.data.transactions || [])
        setAccountSummaryData(json.data.accountSummary || [])
        setTotalRecordsFromApi(json.data.totalRecords || 0)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load transaction data')
    } finally {
      setLoading(false)
    }
  }, [startMonth, endMonth, selectedAccount, selectedCategory])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return transactions.slice(startIndex, endIndex)
  }, [transactions, currentPage, pageSize])

  // Account summary filtered
  const accountSummary = useMemo(() => {
    if (selectedAccount !== 'All') {
      return accountSummaryData.filter(acc => 
        acc.id === selectedAccount ||
        acc.holderName === selectedAccount
      )
    }
    return accountSummaryData
  }, [accountSummaryData, selectedAccount])

  // Handlers
  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1)
    fetchData()
  }, [fetchData])

  const handleReset = useCallback(() => {
    setStartMonth(getDefaultStartMonth())
    setEndMonth(getDefaultEndMonth())
    setSelectedAccount('All')
    setSelectedCategory('All')
    setCurrentPage(1)
  }, [])

  const formatDateRange = () => {
    const start = new Date(startMonth + '-01')
    const end = new Date(endMonth + '-01')
    return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
  }

  // Pagination calculations
  const totalRecords = transactions.length
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
    loading,
    error,
    
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
