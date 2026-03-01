'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type AccountDashboardData = {
  stats: { totalCustomers: number; totalVendors: number; totalInvoices: number; totalBills: number }
  incomeVsExpense: {
    incomeToday: number
    expenseToday: number
    incomeThisMonth: number
    expenseThisMonth: number
  }
  bankAccounts: Array<{
    id: string
    bank: string
    holderName: string
    accountNumber: string
    balance: number
    type: string
  }>
  incomeExpenseChart: Array<{ month: string; income: number; expense: number }>
  cashflowChart: Array<{ month: string; income: number; expense: number }>
  latestIncome: Array<{ id: number; date: string; customer: string; amountDue: number }>
  latestExpense: Array<{ id: number; date: string; vendor: string; amountDue: number }>
  incomeByCategory: Array<{ category: string; amount: number; fill: string }>
  expenseByCategory: Array<{ category: string; amount: number; fill: string }>
  recentInvoices: Array<{
    id: number
    number: string
    customer: string
    issueDate: string
    dueDate: string
    amount: number
    status: 'paid' | 'unpaid' | 'overdue'
  }>
  invoiceStats: {
    weekly: { totalGenerated: number; totalPaid: number; totalDue: number }
    monthly: { totalGenerated: number; totalPaid: number; totalDue: number }
  }
  recentBills: Array<{
    id: number
    number: string
    vendor: string
    billDate: string
    dueDate: string
    amount: number
    status: 'paid' | 'unpaid' | 'overdue'
  }>
  billStats: {
    weekly: { totalGenerated: number; totalPaid: number; totalDue: number }
    monthly: { totalGenerated: number; totalPaid: number; totalDue: number }
  }
  goals: Array<{
    id: number
    name: string
    type: 'bill' | 'invoice' | 'payment' | 'revenue'
    duration: { start: string; end: string }
    current: number
    target: number
    progress: number
  }>
  storage: { usedMB: number; limitMB: number | null }
}

const defaultData: AccountDashboardData = {
  stats: { totalCustomers: 0, totalVendors: 0, totalInvoices: 0, totalBills: 0 },
  incomeVsExpense: { incomeToday: 0, expenseToday: 0, incomeThisMonth: 0, expenseThisMonth: 0 },
  bankAccounts: [],
  incomeExpenseChart: [],
  cashflowChart: [],
  latestIncome: [],
  latestExpense: [],
  incomeByCategory: [{ category: 'product', amount: 100, fill: 'var(--color-product)' }],
  expenseByCategory: [
    { category: 'rentOrLease', amount: 50, fill: 'var(--color-rentOrLease)' },
    { category: 'travel', amount: 50, fill: 'var(--color-travel)' },
  ],
  recentInvoices: [],
  invoiceStats: {
    weekly: { totalGenerated: 0, totalPaid: 0, totalDue: 0 },
    monthly: { totalGenerated: 0, totalPaid: 0, totalDue: 0 },
  },
  recentBills: [],
  billStats: {
    weekly: { totalGenerated: 0, totalPaid: 0, totalDue: 0 },
    monthly: { totalGenerated: 0, totalPaid: 0, totalDue: 0 },
  },
  goals: [],
  storage: { usedMB: 0, limitMB: null },
}

const AccountDashboardContext = createContext<{
  data: AccountDashboardData
  loading: boolean
  error: boolean
}>({ data: defaultData, loading: true, error: false })

export function AccountDashboardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AccountDashboardData>(defaultData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/account-dashboard')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json?.success || !json?.data) return
        setData(json.data as AccountDashboardData)
      })
      .catch(() => setError(true))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <AccountDashboardContext.Provider value={{ data, loading, error }}>
      {children}
    </AccountDashboardContext.Provider>
  )
}

export function useAccountDashboard() {
  const ctx = useContext(AccountDashboardContext)
  if (!ctx) throw new Error('useAccountDashboard must be used within AccountDashboardProvider')
  return ctx
}
