import { useState, useEffect, useCallback } from 'react'
import type { CashFlowData, ViewType } from '../constants'
import { mockCashFlowData, calculateTotals } from '../constants'

export function useCashFlowData() {
  // Filter states
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()))
  const [viewType, setViewType] = useState<ViewType>('monthly')

  // API data state - initialize with mock data to avoid undefined errors
  const [cashFlowData, setCashFlowData] = useState<CashFlowData>(mockCashFlowData)
  const [totalIncome, setTotalIncome] = useState<number[]>(Array(12).fill(0))
  const [totalExpense, setTotalExpense] = useState<number[]>(Array(12).fill(0))
  const [netProfit, setNetProfit] = useState<number[]>(Array(12).fill(0))
  const [summaryStats, setSummaryStats] = useState({
    yearTotalIncome: 0,
    yearTotalExpense: 0,
    yearNetProfit: 0,
    avgMonthlyIncome: 0,
    avgMonthlyExpense: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('year', selectedYear)

      const res = await fetch(`/api/reports/cash-flow?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch cash flow data')
      const json = await res.json()
      if (json.success && json.data) {
        // cashFlowData must be CashFlowData format: { revenue, invoice, payment, bill }
        const data = json.data.cashFlowData
        if (data && data.revenue && data.invoice && data.payment && data.bill) {
          setCashFlowData(data)
        } else {
          // Fallback to empty structure
          setCashFlowData({ revenue: [], invoice: [], payment: [], bill: [] })
        }
        setTotalIncome(json.data.totalIncome || Array(12).fill(0))
        setTotalExpense(json.data.totalExpense || Array(12).fill(0))
        setNetProfit(json.data.netProfit || Array(12).fill(0))
        setSummaryStats(json.data.summaryStats || {
          yearTotalIncome: 0,
          yearTotalExpense: 0,
          yearNetProfit: 0,
          avgMonthlyIncome: 0,
          avgMonthlyExpense: 0,
        })
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load cash flow data')
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }, [selectedYear])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handlers
  const handleApplyFilters = useCallback(() => {
    fetchData()
  }, [fetchData])

  const handleReset = useCallback(() => {
    setSelectedYear(String(new Date().getFullYear()))
    setViewType('monthly')
  }, [])

  return {
    // Filter states
    selectedYear,
    setSelectedYear,
    viewType,
    setViewType,
    loading,
    error,
    
    // Data
    cashFlowData,
    totalIncome,
    totalExpense,
    netProfit,
    summaryStats,
    
    // Handlers
    handleApplyFilters,
    handleReset,
  }
}
