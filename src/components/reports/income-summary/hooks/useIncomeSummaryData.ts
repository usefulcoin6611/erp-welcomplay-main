import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  monthlyMonthList,
  quarterlyMonthList,
  halfYearlyMonthList,
  yearlyMonthList,
  calculateTotalIncome,
  type IncomeData,
} from '../constants'

export function useIncomeSummaryData() {
  // Filter states
  const [period, setPeriod] = useState<string>('monthly')
  const [year, setYear] = useState<string>(String(new Date().getFullYear()))
  const [category, setCategory] = useState<string>('All')
  const [customer, setCustomer] = useState<string>('All')

  // API data state
  const [invoiceData, setInvoiceData] = useState<IncomeData[]>([])
  const [revenueData, setRevenueData] = useState<IncomeData[]>([])
  const [monthLabels, setMonthLabels] = useState<string[]>(monthlyMonthList)
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['All'])
  const [customerOptions, setCustomerOptions] = useState<{ id: string; name: string }[]>([{ id: 'All', name: 'All' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('period', period)
      params.set('year', year)
      if (category !== 'All') params.set('category', category)
      if (customer !== 'All') params.set('customerId', customer)

      const res = await fetch(`/api/reports/income-summary?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch income summary data')
      const json = await res.json()
      if (json.success && json.data) {
        setInvoiceData(json.data.invoiceData || [])
        setRevenueData(json.data.revenueData || [])
        setMonthLabels(json.data.monthLabels || monthlyMonthList)
        if (json.data.categories) setCategoryOptions(json.data.categories)
        if (json.data.customers) setCustomerOptions(json.data.customers)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load income summary data')
    } finally {
      setLoading(false)
    }
  }, [period, year, category, customer])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate total income
  const totalIncome = useMemo(() => {
    return calculateTotalIncome(revenueData, invoiceData)
  }, [revenueData, invoiceData])

  // Format date range for display
  const formatDateRange = () => {
    if (period === 'yearly') {
      const years = yearlyMonthList
      return `${years[years.length - 1]} to ${years[0]}`
    }
    return `Jan ${year} to Dec ${year}`
  }

  // Handlers
  const handleApplyFilters = useCallback(() => {
    fetchData()
  }, [fetchData])

  const handleReset = useCallback(() => {
    setPeriod('monthly')
    setYear(String(new Date().getFullYear()))
    setCategory('All')
    setCustomer('All')
  }, [])

  return {
    // Filter states
    period,
    setPeriod,
    year,
    setYear,
    category,
    setCategory,
    customer,
    setCustomer,
    categoryOptions,
    customerOptions,
    loading,
    error,

    // Data
    revenueData,
    invoiceData,
    totalIncome,
    monthLabels,

    // Handlers
    handleApplyFilters,
    handleReset,
    formatDateRange,
  }
}
