'use client'

import { useState, useEffect, useCallback } from 'react'

type TaxData = {
  name: string
  data: number[]
}

export function useTaxSummaryData() {
  const [year, setYear] = useState(String(new Date().getFullYear()))

  // API data state
  const [monthList, setMonthList] = useState<string[]>([
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ])
  const [incomeTaxes, setIncomeTaxes] = useState<TaxData[]>([])
  const [expenseTaxes, setExpenseTaxes] = useState<TaxData[]>([])
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
        setIncomeTaxes(json.data.incomeTaxes || [])
        setExpenseTaxes(json.data.expenseTaxes || [])
        setDateRangeState(json.data.dateRange || `Jan ${year} - Dec ${year}`)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load tax summary data')
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
