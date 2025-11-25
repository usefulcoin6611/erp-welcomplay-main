import { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { 
  VENDOR_BALANCE_DATA,
  PAYABLE_SUMMARY_DATA,
  PAYABLE_DETAILS_DATA,
  AGING_SUMMARY_DATA,
  AGING_DETAILS_DATA,
  PayableTab
} from '../constants'

export function usePayablesData() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 1),
    to: new Date(2025, 6, 30),
  })
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<PayableTab>('vendor-balance')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = useMemo(() => {
    if (selectedTab === 'vendor-balance') {
      return VENDOR_BALANCE_DATA.filter(item =>
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'payable-summary') {
      return PAYABLE_SUMMARY_DATA.filter(item =>
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transaction.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'payable-details') {
      return PAYABLE_DETAILS_DATA.filter(item =>
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transaction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'aging-summary') {
      return AGING_SUMMARY_DATA.filter(item =>
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (selectedTab === 'aging-details') {
      return AGING_DETAILS_DATA.filter(item =>
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const totalBalance = useMemo(() => {
    return VENDOR_BALANCE_DATA.reduce((acc, item) => ({
      closingBalance: acc.closingBalance + item.closingBalance
    }), { closingBalance: 0 })
  }, [])

  const agingSummaryTotals = useMemo(() => {
    return AGING_SUMMARY_DATA.reduce((acc, item) => ({
      current: acc.current + item.current,
      days1_15: acc.days1_15 + item.days1_15,
      days16_30: acc.days16_30 + item.days16_30,
      days31_45: acc.days31_45 + item.days31_45,
      over45Days: acc.over45Days + item.over45Days,
      total: acc.total + item.total
    }), { current: 0, days1_15: 0, days16_30: 0, days31_45: 0, over45Days: 0, total: 0 })
  }, [])

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId as PayableTab)
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
