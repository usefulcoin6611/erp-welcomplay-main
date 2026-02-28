import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  monthlyMonthList,
  quarterlyMonthList,
  halfYearlyMonthList,
  yearlyMonthList,
  calculateTotalExpense,
  type ExpenseData,
} from '../constants'

export function useExpenseSummaryData() {
  const [period, setPeriod] = useState<string>('monthly')
  const [year, setYear] = useState<string>(String(new Date().getFullYear()))
  const [category, setCategory] = useState<string>('All')
  const [vendor, setVendor] = useState<string>('All')

  // API data state
  const [paymentData, setPaymentData] = useState<ExpenseData[]>([])
  const [billData, setBillData] = useState<ExpenseData[]>([])
  const [monthLabels, setMonthLabels] = useState<string[]>(monthlyMonthList)
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['All'])
  const [vendorOptions, setVendorOptions] = useState<string[]>(['All'])
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
      if (vendor !== 'All') params.set('vendorId', vendor)

      const res = await fetch(`/api/reports/expense-summary?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch expense summary data')
      const json = await res.json()
      if (json.success && json.data) {
        setPaymentData(json.data.paymentData || [])
        setBillData(json.data.billData || [])
        setMonthLabels(json.data.monthLabels || monthlyMonthList)
        if (json.data.categories) setCategoryOptions(json.data.categories)
        if (json.data.vendors) {
          setVendorOptions(['All', ...json.data.vendors.filter((v: any) => v.id !== 'All').map((v: any) => v.name)])
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load expense summary data')
    } finally {
      setLoading(false)
    }
  }, [period, year, category, vendor])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalExpense = useMemo(() => {
    return calculateTotalExpense(paymentData, billData)
  }, [paymentData, billData])

  const formatDateRange = () => {
    if (period === 'yearly') {
      const years = yearlyMonthList
      return `${years[years.length - 1]} to ${years[0]}`
    }
    return `Jan ${year} to Dec ${year}`
  }

  const handleApplyFilters = useCallback(() => {
    fetchData()
  }, [fetchData])

  const handleReset = useCallback(() => {
    setPeriod('monthly')
    setYear(String(new Date().getFullYear()))
    setCategory('All')
    setVendor('All')
  }, [])

  return {
    period,
    setPeriod,
    year,
    setYear,
    category,
    setCategory,
    vendor,
    setVendor,
    categoryOptions,
    vendorOptions,
    paymentData,
    billData,
    totalExpense,
    monthLabels,
    handleApplyFilters,
    handleReset,
    formatDateRange,
    loading,
    error,
  }
}
