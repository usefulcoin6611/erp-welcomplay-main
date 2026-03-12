'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TaxData } from '../constants'
import { mockIncomeTaxes, mockExpenseTaxes } from '../constants'

export function useTaxSummaryData() {
  const [year, setYear] = useState(String(new Date().getFullYear()))

  // API data state - initialize with mock data to prevent undefined errors
  const [monthList, setMonthList] = useState<string[]>([
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ])
  const [incomeTaxes, setIncomeTaxes] = useState<TaxData[]>(mockIncomeTaxes)
  const [expenseTaxes, setExpenseTaxes] = useState<TaxData[]>(mockExpenseTaxes)
  const [dateRange, setDateRangeState] = useState<string>(`Jan ${new Date().getFullYear()} - Dec ${new Date().getFullYear()}`)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('year', year)

      const res = await fetch(`/api/reports/tax-summary?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch tax summary data')
      const json = await res.json()
      if (json.success && json.data) {
        setMonthList(json.data.monthList || monthList)
        setDateRangeState(json.data.dateRange || `Jan ${year} - Dec ${year}`)
        
        // Map API response { name, data } to TaxData { taxName, monthlyValues }
        const mapToTaxData = (items: { name: string; data: number[] }[]): TaxData[] =>
          (items || []).map(item => ({
            taxName: item.name,
            monthlyValues: Array.isArray(item.data) ? item.data : Array(12).fill(0),
          }))

        const mappedIncome = mapToTaxData(json.data.incomeTaxes || [])
        const mappedExpense = mapToTaxData(json.data.expenseTaxes || [])

        // Use mock data if API returns empty (no tax data in DB)
        setIncomeTaxes(mappedIncome.length > 0 ? mappedIncome : mockIncomeTaxes)
        setExpenseTaxes(mappedExpense.length > 0 ? mappedExpense : mockExpenseTaxes)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load tax summary data')
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleYearChange = (value: string) => {
    setYear(value)
  }

  return {
    year,
    handleYearChange,
    monthList,
    incomeTaxes,
    expenseTaxes,
    dateRange,
    loading,
    error,
  }
}
