'use client'

import { useState } from 'react'
import { monthList, mockIncomeTaxes, mockExpenseTaxes, getDateRange } from '../constants'

export function useTaxSummaryData() {
  const [year, setYear] = useState('2025')

  const handleYearChange = (value: string) => {
    setYear(value)
  }

  const dateRange = getDateRange(year)

  return {
    year,
    handleYearChange,
    monthList,
    incomeTaxes: mockIncomeTaxes,
    expenseTaxes: mockExpenseTaxes,
    dateRange,
  }
}
