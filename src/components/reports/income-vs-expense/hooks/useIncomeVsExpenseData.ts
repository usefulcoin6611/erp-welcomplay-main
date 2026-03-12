'use client'

import { useState, useEffect, useCallback } from 'react'
import type { IncomeVsExpenseFilter } from '../constants'

export function useIncomeVsExpenseData() {
  const [filters, setFilters] = useState<IncomeVsExpenseFilter>({
    period: 'monthly',
    year: String(new Date().getFullYear()),
    category: 'All',
    customer: 'All',
    vendor: 'All',
  })

  // API data state
  const [monthList, setMonthList] = useState<string[]>([])
  const [revenueTotal, setRevenueTotal] = useState<number[]>([])
  const [invoiceTotal, setInvoiceTotal] = useState<number[]>([])
  const [paymentTotal, setPaymentTotal] = useState<number[]>([])
  const [billTotal, setBillTotal] = useState<number[]>([])
  const [incomeTotal, setIncomeTotal] = useState<number[]>([])
  const [expenseTotal, setExpenseTotal] = useState<number[]>([])
  const [profitTotal, setProfitTotal] = useState<number[]>([])
  const [chartData, setChartData] = useState<{ month: string; profit: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('period', filters.period)
      params.set('year', filters.year)
      if (filters.category !== 'All') params.set('category', filters.category)
      if (filters.customer !== 'All') params.set('customerId', filters.customer)
      if (filters.vendor !== 'All') params.set('vendorId', filters.vendor)

      const res = await fetch(`/api/reports/income-vs-expense?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch income vs expense data')
      const json = await res.json()
      if (json.success && json.data) {
        setMonthList(json.data.monthList || [])
        setRevenueTotal(json.data.revenueTotal || [])
        setInvoiceTotal(json.data.invoiceTotal || [])
        setPaymentTotal(json.data.paymentTotal || [])
        setBillTotal(json.data.billTotal || [])
        setIncomeTotal(json.data.incomeTotal || [])
        setExpenseTotal(json.data.expenseTotal || [])
        setProfitTotal(json.data.profitTotal || [])
        setChartData(json.data.chartData || [])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load income vs expense data')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFilterChange = (key: keyof IncomeVsExpenseFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Get period label for display
  const getPeriodLabel = () => {
    if (filters.period === 'yearly') {
      return 'Last 4 Years'
    }
    return `${filters.period.charAt(0).toUpperCase() + filters.period.slice(1)} - ${filters.year}`
  }

  return {
    filters,
    handleFilterChange,
    monthList,
    revenueTotal,
    invoiceTotal,
    paymentTotal,
    billTotal,
    incomeTotal,
    expenseTotal,
    profitTotal,
    chartData,
    periodLabel: getPeriodLabel(),
    loading,
    error,
  }
}
