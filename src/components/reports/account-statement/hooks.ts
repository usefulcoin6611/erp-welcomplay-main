import { useMemo } from 'react'
import { AccountStatementData, AccountSummary } from './types'
import { MOCK_STATEMENT_DATA, MOCK_REVENUE_ACCOUNTS, MOCK_PAYMENT_ACCOUNTS } from './constants'

interface UseAccountStatementDataParams {
  searchQuery?: string
  selectedAccount?: string
  selectedCategory?: string
}

interface UseAccountStatementDataReturn {
  statementData: AccountStatementData[]
  revenueAccounts: AccountSummary[]
  paymentAccounts: AccountSummary[]
  totalRevenue: number
  totalPayment: number
}

export function useAccountStatementData({
  searchQuery = '',
  selectedAccount = 'all',
  selectedCategory = 'all',
}: UseAccountStatementDataParams = {}): UseAccountStatementDataReturn {
  // Filter statement data based on search and filters
  const statementData = useMemo(() => {
    let filtered = [...MOCK_STATEMENT_DATA]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.description.toLowerCase().includes(query) ||
          item.date.toLowerCase().includes(query) ||
          item.amount.toString().includes(query)
      )
    }

    // Filter by account
    if (selectedAccount !== 'all') {
      // This would filter by account in real implementation
      // For now, we just keep all data
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.type === selectedCategory)
    }

    return filtered
  }, [searchQuery, selectedAccount, selectedCategory])

  // Calculate totals
  const { totalRevenue, totalPayment } = useMemo(() => {
    const revenue = MOCK_REVENUE_ACCOUNTS.reduce((sum, acc) => sum + acc.total, 0)
    const payment = MOCK_PAYMENT_ACCOUNTS.reduce((sum, acc) => sum + acc.total, 0)
    return { totalRevenue: revenue, totalPayment: payment }
  }, [])

  return {
    statementData,
    revenueAccounts: MOCK_REVENUE_ACCOUNTS,
    paymentAccounts: MOCK_PAYMENT_ACCOUNTS,
    totalRevenue,
    totalPayment,
  }
}
