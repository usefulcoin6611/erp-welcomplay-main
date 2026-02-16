import { useState, useMemo, useEffect } from 'react'
import {
  monthlyMonthList,
  quarterlyMonthList,
  halfYearlyMonthList,
  yearlyMonthList,
  calculateTotalExpense,
  type ExpenseData,
} from '../constants'

type PaymentRecord = {
  date: string
  category: string
  total: number
}

type BillRecord = {
  date: string
  category: string
  total: number
  vendorName: string
}

function normalizeDateString(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') {
    if (value.length >= 10) return value.slice(0, 10)
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10)
    }
    return ''
  }
  const d = new Date(value as any)
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10)
  }
  return ''
}

function getYearFromDate(date: string): number | null {
  if (!date || date.length < 4) return null
  const y = Number(date.slice(0, 4))
  if (Number.isNaN(y)) return null
  return y
}

function getMonthIndexFromDate(date: string): number | null {
  if (!date || date.length < 7) return null
  const m = Number(date.slice(5, 7))
  if (Number.isNaN(m) || m < 1 || m > 12) return null
  return m - 1
}

function aggregateMonthlyByCategory(
  records: { date: string; category: string; total: number }[],
): ExpenseData[] {
  const result: Record<string, number[]> = {}
  records.forEach((r) => {
    const idx = getMonthIndexFromDate(r.date)
    if (idx === null || idx < 0 || idx >= 12) return
    const key = r.category || 'Uncategorized'
    if (!result[key]) {
      result[key] = Array(12).fill(0)
    }
    result[key][idx] += r.total
  })
  return Object.entries(result).map(([category, data]) => ({ category, data }))
}

function aggregateToBucketsFromMonthly(
  monthlyData: ExpenseData[],
  bucketCount: number,
  monthsPerBucket: number,
): ExpenseData[] {
  return monthlyData.map((item) => {
    const bucketData = Array(bucketCount).fill(0)
    item.data.forEach((value, monthIndex) => {
      const bucketIndex = Math.floor(monthIndex / monthsPerBucket)
      if (bucketIndex >= 0 && bucketIndex < bucketCount) {
        bucketData[bucketIndex] += value
      }
    })
    return {
      category: item.category,
      data: bucketData,
    }
  })
}

function aggregateYearlyByCategory(
  records: { date: string; category: string; total: number }[],
  years: number[],
): ExpenseData[] {
  const result: Record<string, number[]> = {}
  records.forEach((r) => {
    const y = getYearFromDate(r.date)
    if (!y) return
    const idx = years.indexOf(y)
    if (idx === -1) return
    const key = r.category || 'Uncategorized'
    if (!result[key]) {
      result[key] = Array(years.length).fill(0)
    }
    result[key][idx] += r.total
  })
  return Object.entries(result).map(([category, data]) => ({ category, data }))
}

export function useExpenseSummaryData() {
  const [period, setPeriod] = useState<string>('monthly')
  const [year, setYear] = useState<string>('2025')
  const [category, setCategory] = useState<string>('All')
  const [vendor, setVendor] = useState<string>('All')

  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [bills, setBills] = useState<BillRecord[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [expenseRes, billRes] = await Promise.all([
          fetch('/api/expenses', { cache: 'no-store' }),
          fetch('/api/bills', { cache: 'no-store' }),
        ])

        if (!expenseRes.ok && expenseRes.status !== 404) {
          throw new Error('Gagal mengambil data expense')
        }
        if (!billRes.ok && billRes.status !== 404) {
          throw new Error('Gagal mengambil data bill')
        }

        let expenseData: any[] = []
        let billDataRaw: any[] = []

        if (expenseRes.ok) {
          const json = await expenseRes.json()
          if (json?.success && Array.isArray(json.data)) {
            expenseData = json.data
          }
        }

        if (billRes.ok) {
          const json = await billRes.json()
          if (json?.success && Array.isArray(json.data)) {
            billDataRaw = json.data
          }
        }

        if (cancelled) return

        const mappedPayments: PaymentRecord[] = expenseData.map((e) => ({
          date: normalizeDateString(e.date),
          category: String(e.category || ''),
          total: Number(e.total) || 0,
        }))

        const mappedBills: BillRecord[] = billDataRaw.map((b) => ({
          date: normalizeDateString(b.billDate),
          category: String(b.category || ''),
          total: Number(b.total) || 0,
          vendorName: String(b.vendorName || ''),
        }))

        setPayments(mappedPayments)
        setBills(mappedBills)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Terjadi kesalahan saat memuat data')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    payments.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    bills.forEach((b) => {
      if (b.category) set.add(b.category)
    })
    const list = Array.from(set).sort()
    return ['All', ...list]
  }, [payments, bills])

  const vendorOptions = useMemo(() => {
    const set = new Set<string>()
    bills.forEach((b) => {
      if (b.vendorName) set.add(b.vendorName)
    })
    const list = Array.from(set).sort()
    return ['All', ...list]
  }, [bills])

  const { paymentData, billData, monthLabels } = useMemo(() => {
    const selectedYear = Number(year)
    const hasSelectedYear = !Number.isNaN(selectedYear)

    const applyCategoryFilter = <T extends { category: string }>(items: T[]): T[] => {
      if (category === 'All') return items
      return items.filter((item) => item.category === category)
    }

    const applyVendorFilter = (items: BillRecord[]): BillRecord[] => {
      if (vendor === 'All') return items
      return items.filter((item) => item.vendorName === vendor)
    }

    if (period === 'yearly') {
      const years = yearlyMonthList
        .map((y) => Number(y))
        .filter((y) => !Number.isNaN(y))
      const filteredPayments = applyCategoryFilter(payments)
      const filteredBills = applyCategoryFilter(applyVendorFilter(bills))
      const paymentYearly = aggregateYearlyByCategory(filteredPayments, years)
      const billYearly = aggregateYearlyByCategory(filteredBills, years)
      return {
        paymentData: paymentYearly,
        billData: billYearly,
        monthLabels: yearlyMonthList,
      }
    }

    const filterByYear = <T extends { date: string }>(items: T[]): T[] => {
      if (!hasSelectedYear) return items
      return items.filter((item) => {
        const y = getYearFromDate(item.date)
        return y === selectedYear
      })
    }

    const filteredPaymentsByYear = filterByYear(payments)
    const filteredBillsByYear = filterByYear(bills)

    const filteredPayments = applyCategoryFilter(filteredPaymentsByYear)
    const filteredBills = applyCategoryFilter(applyVendorFilter(filteredBillsByYear))

    const paymentMonthly = aggregateMonthlyByCategory(filteredPayments)
    const billMonthly = aggregateMonthlyByCategory(filteredBills)

    if (period === 'quarterly') {
      const paymentQuarterly = aggregateToBucketsFromMonthly(paymentMonthly, 4, 3)
      const billQuarterly = aggregateToBucketsFromMonthly(billMonthly, 4, 3)
      return {
        paymentData: paymentQuarterly,
        billData: billQuarterly,
        monthLabels: quarterlyMonthList,
      }
    }

    if (period === 'half-yearly') {
      const paymentHalf = aggregateToBucketsFromMonthly(paymentMonthly, 2, 6)
      const billHalf = aggregateToBucketsFromMonthly(billMonthly, 2, 6)
      return {
        paymentData: paymentHalf,
        billData: billHalf,
        monthLabels: halfYearlyMonthList,
      }
    }

    return {
      paymentData: paymentMonthly,
      billData: billMonthly,
      monthLabels: monthlyMonthList,
    }
  }, [period, year, category, vendor, payments, bills])

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

  const handleApplyFilters = () => {
    console.log('Applying filters:', { period, year, category, vendor })
  }

  const handleReset = () => {
    setPeriod('monthly')
    setYear('2025')
    setCategory('All')
    setVendor('All')
  }

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
