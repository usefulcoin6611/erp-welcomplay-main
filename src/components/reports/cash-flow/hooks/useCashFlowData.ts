import { useState, useMemo } from 'react'
import { mockCashFlowData, calculateTotals, type ViewType } from '../constants'

export function useCashFlowData() {
  // Filter states
  const [selectedYear, setSelectedYear] = useState<string>('2025')
  const [viewType, setViewType] = useState<ViewType>('monthly')

  // Calculate totals
  const { totalIncome, totalExpense, netProfit } = useMemo(() => {
    return calculateTotals(mockCashFlowData)
  }, [])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const yearTotalIncome = totalIncome.reduce((sum, val) => sum + val, 0)
    const yearTotalExpense = totalExpense.reduce((sum, val) => sum + val, 0)
    const yearNetProfit = yearTotalIncome - yearTotalExpense
    const avgMonthlyIncome = yearTotalIncome / 12
    const avgMonthlyExpense = yearTotalExpense / 12

    return {
      yearTotalIncome,
      yearTotalExpense,
      yearNetProfit,
      avgMonthlyIncome,
      avgMonthlyExpense,
    }
  }, [totalIncome, totalExpense])

  // Handlers
  const handleApplyFilters = () => {
    // In real app, this would fetch data based on selected year
    console.log('Applying filters:', { selectedYear, viewType })
  }

  const handleReset = () => {
    setSelectedYear('2025')
    setViewType('monthly')
  }

  return {
    // Filter states
    selectedYear,
    setSelectedYear,
    viewType,
    setViewType,
    
    // Data
    cashFlowData: mockCashFlowData,
    totalIncome,
    totalExpense,
    netProfit,
    summaryStats,
    
    // Handlers
    handleApplyFilters,
    handleReset,
  }
}
