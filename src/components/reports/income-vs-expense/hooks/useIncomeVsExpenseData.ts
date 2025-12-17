'use client'

import { useState } from 'react'
import type { IncomeVsExpenseFilter } from '../constants'
import {
  monthlyMonthList,
  quarterlyMonthList,
  halfYearlyMonthList,
  yearlyMonthList,
  mockRevenueTotal,
  mockInvoiceTotal,
  mockPaymentTotal,
  mockBillTotal,
  mockQuarterlyRevenueTotal,
  mockQuarterlyInvoiceTotal,
  mockQuarterlyPaymentTotal,
  mockQuarterlyBillTotal,
  mockYearlyRevenueTotal,
  mockYearlyInvoiceTotal,
  mockYearlyPaymentTotal,
  mockYearlyBillTotal,
  calculateIncome,
  calculateExpense,
  calculateProfit,
} from '../constants'

export function useIncomeVsExpenseData() {
  const [filters, setFilters] = useState<IncomeVsExpenseFilter>({
    period: 'monthly',
    year: '2025',
    category: 'All',
    customer: 'All',
    vendor: 'All',
  })

  const handleFilterChange = (key: keyof IncomeVsExpenseFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Get data based on selected period
  const getDataForPeriod = () => {
    switch (filters.period) {
      case 'quarterly':
        return {
          monthList: quarterlyMonthList,
          revenueTotal: mockQuarterlyRevenueTotal,
          invoiceTotal: mockQuarterlyInvoiceTotal,
          paymentTotal: mockQuarterlyPaymentTotal,
          billTotal: mockQuarterlyBillTotal,
        }
      case 'half-yearly':
        // Half-yearly uses monthly data but grouped in 2 halves
        const halfYearRevenueTotal = [
          mockRevenueTotal.slice(0, 6).reduce((sum, val) => sum + val, 0),
          mockRevenueTotal.slice(6).reduce((sum, val) => sum + val, 0),
        ]
        const halfYearInvoiceTotal = [
          mockInvoiceTotal.slice(0, 6).reduce((sum, val) => sum + val, 0),
          mockInvoiceTotal.slice(6).reduce((sum, val) => sum + val, 0),
        ]
        const halfYearPaymentTotal = [
          mockPaymentTotal.slice(0, 6).reduce((sum, val) => sum + val, 0),
          mockPaymentTotal.slice(6).reduce((sum, val) => sum + val, 0),
        ]
        const halfYearBillTotal = [
          mockBillTotal.slice(0, 6).reduce((sum, val) => sum + val, 0),
          mockBillTotal.slice(6).reduce((sum, val) => sum + val, 0),
        ]
        return {
          monthList: ['H1', 'H2'],
          revenueTotal: halfYearRevenueTotal,
          invoiceTotal: halfYearInvoiceTotal,
          paymentTotal: halfYearPaymentTotal,
          billTotal: halfYearBillTotal,
        }
      case 'yearly':
        return {
          monthList: yearlyMonthList,
          revenueTotal: mockYearlyRevenueTotal,
          invoiceTotal: mockYearlyInvoiceTotal,
          paymentTotal: mockYearlyPaymentTotal,
          billTotal: mockYearlyBillTotal,
        }
      default: // monthly
        return {
          monthList: monthlyMonthList,
          revenueTotal: mockRevenueTotal,
          invoiceTotal: mockInvoiceTotal,
          paymentTotal: mockPaymentTotal,
          billTotal: mockBillTotal,
        }
    }
  }

  const periodData = getDataForPeriod()
  
  // Calculate income, expense, and profit totals
  const incomeTotal = calculateIncome(periodData.revenueTotal, periodData.invoiceTotal)
  const expenseTotal = calculateExpense(periodData.paymentTotal, periodData.billTotal)
  const profitTotal = calculateProfit(incomeTotal, expenseTotal)

  // Prepare chart data
  const chartData = periodData.monthList.map((month, index) => ({
    month,
    profit: profitTotal[index],
  }))

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
    monthList: periodData.monthList,
    revenueTotal: periodData.revenueTotal,
    invoiceTotal: periodData.invoiceTotal,
    paymentTotal: periodData.paymentTotal,
    billTotal: periodData.billTotal,
    incomeTotal,
    expenseTotal,
    profitTotal,
    chartData,
    periodLabel: getPeriodLabel(),
  }
}
