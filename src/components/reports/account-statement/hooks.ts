import { useEffect, useMemo, useState } from 'react'
import { AccountStatementData, AccountSummary } from './types'

interface UseAccountStatementDataParams {
  searchQuery?: string
  selectedAccount?: string
  selectedCategory?: string
  startDate?: string
  endDate?: string
}

interface UseAccountStatementDataReturn {
  statementData: AccountStatementData[]
  revenueAccounts: AccountSummary[]
  paymentAccounts: AccountSummary[]
  totalRevenue: number
  totalPayment: number
  loading: boolean
  error: string | null
}

export function useAccountStatementData({
  searchQuery = '',
  selectedAccount = 'all',
  selectedCategory = 'all',
  startDate,
  endDate,
}: UseAccountStatementDataParams = {}): UseAccountStatementDataReturn {
  const [statementData, setStatementData] = useState<AccountStatementData[]>([])
  const [revenueAccounts, setRevenueAccounts] = useState<AccountSummary[]>([])
  const [paymentAccounts, setPaymentAccounts] = useState<AccountSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (selectedAccount && selectedAccount !== 'all') {
          params.set('accountId', selectedAccount)
        }
        if (selectedCategory && selectedCategory !== 'all') {
          params.set('category', selectedCategory)
        }
        if (searchQuery) {
          params.set('search', searchQuery)
        }
        if (startDate) {
          params.set('startDate', startDate)
        }
        if (endDate) {
          params.set('endDate', endDate)
        }
        params.set('page', '1')
        params.set('pageSize', '500')

        const url = params.toString()
          ? `/api/reports/account-statement?${params.toString()}`
          : '/api/reports/account-statement'

        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error('Failed to fetch account statement data')
        }

        const json = await response.json()
        if (!json.success || !json.data) {
          throw new Error(json.message || 'Failed to load account statement data')
        }

        setStatementData(json.data.items as AccountStatementData[])
        setRevenueAccounts(json.data.revenueAccounts as AccountSummary[])
        setPaymentAccounts(json.data.paymentAccounts as AccountSummary[])
      } catch (err: any) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Unexpected error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      controller.abort()
    }
  }, [searchQuery, selectedAccount, selectedCategory, startDate, endDate])

  const { totalRevenue, totalPayment } = useMemo(() => {
    const revenue = revenueAccounts.reduce((sum, acc) => sum + acc.total, 0)
    const payment = paymentAccounts.reduce((sum, acc) => sum + acc.total, 0)
    return { totalRevenue: revenue, totalPayment: payment }
  }, [revenueAccounts, paymentAccounts])

  return {
    statementData,
    revenueAccounts,
    paymentAccounts,
    totalRevenue,
    totalPayment,
    loading,
    error,
  }
}
