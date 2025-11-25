import { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'
import {
  CUSTOMER_BALANCE_DATA,
  RECEIVABLE_SUMMARY_DATA,
  RECEIVABLE_DETAILS_DATA,
  AGING_SUMMARY_DATA,
  AGING_DETAILS_DATA,
  ReceivableTab
} from '../constants'

export function useReceivablesData() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 1),
    to: new Date(2025, 6, 30),
  })
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<ReceivableTab>('customer-balance')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = useMemo(() => {
    if (selectedTab === 'customer-balance') {
      return CUSTOMER_BALANCE_DATA.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'receivable-summary') {
      return RECEIVABLE_SUMMARY_DATA.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transaction.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'receivable-details') {
      return RECEIVABLE_DETAILS_DATA.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transaction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'aging-summary') {
      return AGING_SUMMARY_DATA.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'aging-details') {
      return AGING_DETAILS_DATA.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transaction.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return []
  }, [selectedTab, searchQuery])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalBalance = useMemo(
    () => CUSTOMER_BALANCE_DATA.reduce((sum, row) => sum + row.balance, 0),
    []
  )

  const agingSummaryTotals = useMemo(() => {
    return AGING_SUMMARY_DATA.reduce((acc, row) => ({
      current: acc.current + row.current,
      days1_15: acc.days1_15 + row.days1_15,
      days16_30: acc.days16_30 + row.days16_30,
      days31_45: acc.days31_45 + row.days31_45,
      daysOver45: acc.daysOver45 + row.daysOver45,
      total: acc.total + row.total,
    }), { current: 0, days1_15: 0, days16_30: 0, days31_45: 0, daysOver45: 0, total: 0 })
  }, [])

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId as ReceivableTab)
    setCurrentPage(1)
    setSearchQuery('')
  }

  const handleReset = () => {
    setDateRange({
      from: new Date(2025, 5, 1),
      to: new Date(2025, 6, 30),
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  return {
    // State
    dateRange,
    setDateRange,
    isDateRangeOpen,
    setIsDateRangeOpen,
    selectedTab,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    
    // Data
    filteredData,
    paginatedData,
    totalBalance,
    agingSummaryTotals,
    
    // Handlers
    handleTabChange,
    handleReset,
  }
}
