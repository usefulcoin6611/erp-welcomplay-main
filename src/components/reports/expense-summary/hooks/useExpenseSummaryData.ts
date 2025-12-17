import { useState, useMemo } from 'react'
import {
  mockPaymentData,
  mockBillData,
  mockQuarterlyPaymentData,
  mockQuarterlyBillData,
  mockYearlyPaymentData,
  mockYearlyBillData,
  monthlyMonthList,
  quarterlyMonthList,
  halfYearlyMonthList,
  yearlyMonthList,
  calculateTotalExpense,
  type ExpenseData,
} from '../constants'

export function useExpenseSummaryData() {
  // Filter states
  const [period, setPeriod] = useState<string>('monthly')
  const [year, setYear] = useState<string>('2025')
  const [category, setCategory] = useState<string>('All')
  const [vendor, setVendor] = useState<string>('All')

  // Get appropriate data based on period
  const { paymentData, billData, monthLabels } = useMemo(() => {
    let payment: ExpenseData[] = []
    let bill: ExpenseData[] = []
    let labels: string[] = []

    switch (period) {
      case 'quarterly':
        payment = mockQuarterlyPaymentData
        bill = mockQuarterlyBillData
        labels = quarterlyMonthList
        break
      case 'half-yearly':
        payment = mockPaymentData
        bill = mockBillData
        labels = halfYearlyMonthList
        break
      case 'yearly':
        payment = mockYearlyPaymentData
        bill = mockYearlyBillData
        labels = yearlyMonthList
        break
      case 'monthly':
      default:
        payment = mockPaymentData
        bill = mockBillData
        labels = monthlyMonthList
        break
    }

    // Filter by category if not "All"
    if (category !== 'All') {
      payment = payment.filter((item) => item.category === category)
      bill = bill.filter((item) => item.category === category)
    }

    return { paymentData: payment, billData: bill, monthLabels: labels }
  }, [period, category])

  // Calculate total expense
  const totalExpense = useMemo(() => {
    return calculateTotalExpense(paymentData, billData)
  }, [paymentData, billData])

  // Format date range for display
  const formatDateRange = () => {
    if (period === 'yearly') {
      const years = yearlyMonthList
      return `${years[years.length - 1]} to ${years[0]}`
    }
    return `Jan ${year} to Dec ${year}`
  }

  // Handlers
  const handleApplyFilters = () => {
    // Trigger re-render with current filter values
    console.log('Applying filters:', { period, year, category, vendor })
  }

  const handleReset = () => {
    setPeriod('monthly')
    setYear('2025')
    setCategory('All')
    setVendor('All')
  }

  return {
    // Filter states
    period,
    setPeriod,
    year,
    setYear,
    category,
    setCategory,
    vendor,
    setVendor,

    // Data
    paymentData,
    billData,
    totalExpense,
    monthLabels,

    // Handlers
    handleApplyFilters,
    handleReset,
    formatDateRange,
  }
}
