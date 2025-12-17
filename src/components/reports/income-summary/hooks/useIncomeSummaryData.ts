import { useState, useMemo } from 'react'
import {
  mockRevenueData,
  mockInvoiceData,
  mockQuarterlyRevenueData,
  mockQuarterlyInvoiceData,
  mockYearlyRevenueData,
  mockYearlyInvoiceData,
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
  const [year, setYear] = useState<string>('2025')
  const [category, setCategory] = useState<string>('All')
  const [customer, setCustomer] = useState<string>('All')

  // Get appropriate data based on period
  const { revenueData, invoiceData, monthLabels } = useMemo(() => {
    let revenue: IncomeData[] = []
    let invoice: IncomeData[] = []
    let labels: string[] = []

    switch (period) {
      case 'quarterly':
        revenue = mockQuarterlyRevenueData
        invoice = mockQuarterlyInvoiceData
        labels = quarterlyMonthList
        break
      case 'half-yearly':
        revenue = mockRevenueData
        invoice = mockInvoiceData
        labels = halfYearlyMonthList
        break
      case 'yearly':
        revenue = mockYearlyRevenueData
        invoice = mockYearlyInvoiceData
        labels = yearlyMonthList
        break
      case 'monthly':
      default:
        revenue = mockRevenueData
        invoice = mockInvoiceData
        labels = monthlyMonthList
        break
    }

    // Filter by category if not "All"
    if (category !== 'All') {
      revenue = revenue.filter((item) => item.category === category)
      invoice = invoice.filter((item) => item.category === category)
    }

    return { revenueData: revenue, invoiceData: invoice, monthLabels: labels }
  }, [period, category])

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
  const handleApplyFilters = () => {
    // Trigger re-render with current filter values
    console.log('Applying filters:', { period, year, category, customer })
  }

  const handleReset = () => {
    setPeriod('monthly')
    setYear('2025')
    setCategory('All')
    setCustomer('All')
  }

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
