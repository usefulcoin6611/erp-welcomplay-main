'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import {
  Printer,
  FileDown,
  Filter,
  Columns2,
  Search,
  RefreshCw,
} from 'lucide-react'

// Mock data based on reference structure
const totalAccounts = [
  {
    Type: 'Income',
    account: [
      [
        {
          account_name: 'Sales Revenue',
          account_code: '4000',
          netAmount: 420_000_000,
          account_id: 1,
          account: '',
        },
        {
          account_name: 'Service Revenue',
          account_code: '4100',
          netAmount: 80_000_000,
          account_id: 2,
          account: '',
        },
        {
          account_name: 'Total Income',
          account_code: '',
          netAmount: 500_000_000,
          account_id: 0,
          account: '',
        },
      ],
    ],
  },
  {
    Type: 'Costs of Goods Sold',
    account: [
      [
        {
          account_name: 'Cost of Goods Sold',
          account_code: '5000',
          netAmount: 220_000_000,
          account_id: 3,
          account: '',
        },
        {
          account_name: 'Total Costs of Goods Sold',
          account_code: '',
          netAmount: 220_000_000,
          account_id: 0,
          account: '',
        },
      ],
    ],
  },
  {
    Type: 'Expenses',
    account: [
      [
        {
          account_name: 'Operating Expenses',
          account_code: '6000',
          netAmount: 90_000_000,
          account_id: 4,
          account: '',
        },
        {
          account_name: 'Marketing Expenses',
          account_code: '6100',
          netAmount: 25_000_000,
          account_id: 5,
          account: '',
        },
        {
          account_name: 'Total Expenses',
          account_code: '',
          netAmount: 115_000_000,
          account_id: 0,
          account: '',
        },
      ],
    ],
  },
]

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ProfitLossTab() {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState('2025-01-01')
  const [endDate, setEndDate] = useState('2025-12-31')
  const [showFilter, setShowFilter] = useState(false)

  const userName = user?.name || 'Company'
  const startDateRange = startDate || '2025-01-01'
  const endDateRange = endDate || '2025-12-31'

  let totalIncome = 0
  let totalCosts = 0
  let grossProfit = 0
  let netProfit = 0

  totalAccounts.forEach((accounts) => {
    if (accounts.Type === 'Income') {
      accounts.account.forEach((records) => {
        records.forEach((record) => {
          if (record.account_name === 'Total Income') {
            totalIncome = record.netAmount
          }
        })
      })
    }
    if (accounts.Type === 'Costs of Goods Sold') {
      accounts.account.forEach((records) => {
        records.forEach((record) => {
          if (record.account_name === 'Total Costs of Goods Sold') {
            totalCosts = record.netAmount
          }
        })
      })
    }
  })

  grossProfit = totalIncome - totalCosts

  totalAccounts.forEach((accounts) => {
    if (accounts.Type === 'Expenses') {
      accounts.account.forEach((records) => {
        records.forEach((record) => {
          if (record.account_name === 'Total Expenses') {
            netProfit = grossProfit - record.netAmount
          }
        })
      })
    }
  })

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 px-6 py-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Profit &amp; Loss</CardTitle>
            <CardDescription>View profit and loss report for a period.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
          onClick={() => {
            const printContents = document.getElementById('printableArea')?.innerHTML
            if (printContents) {
              const originalContents = document.body.innerHTML
              document.body.innerHTML = printContents
              window.print()
              document.body.innerHTML = originalContents
            }
          }}
          title="Print"
        >
          <Printer className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
          title="Export"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export Profit &amp; Loss
        </Button>
        <Button
          variant="blue"
          size="sm"
          className="shadow-none h-7"
          onClick={() => setShowFilter(!showFilter)}
          title="Filter"
        >
          <Filter className="h-3 w-3" />
        </Button>
        <Button variant="secondary" size="sm" className="shadow-none h-7" title="Horizontal View">
          <Columns2 className="h-3 w-3" />
        </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      {showFilter && (
        <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
          <CardContent className="px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setShowFilter(false)
              }}
              className="flex flex-col gap-4 md:flex-row md:items-end"
            >
              <div className="w-full md:w-44 space-y-3">
                <label className="block text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="startDate"
                />
              </div>
              <div className="w-full md:w-44 space-y-3">
                <label className="block text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="endDate"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="outline" size="sm" className="shadow-none h-9 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Apply">
                  <Search className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-9 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                  onClick={() => {
                    setStartDate('2025-01-01')
                    setEndDate('2025-12-31')
                  }}
                  title="Reset"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Profit & Loss */}
      <div id="printableArea">
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <div className="border-b border-border px-6 py-4">
                <h5 className="text-lg font-semibold text-foreground">
                  Profit & Loss of {userName} as of {startDateRange} to {endDateRange}
                </h5>
              </div>
              <CardContent className="overflow-auto p-0">
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm font-semibold">
                    <span className="min-w-0 flex-1">Account</span>
                    <span className="w-28 shrink-0 text-center">Account Code</span>
                    <span className="w-32 shrink-0 text-end">Total</span>
                  </div>

                  {totalAccounts.map((accounts) => {
                    if (accounts.Type === 'Income') {
                      return (
                        <div key={accounts.Type} className="border-b border-border/60 py-3">
                          <p className="mb-2 mt-1 text-sm font-bold text-foreground">{accounts.Type}</p>
                          {accounts.account.map((records) =>
                            records
                              .filter((record) => record.account_name !== 'Total Income')
                              .map((record) => (
                                <div
                                  key={record.account_id}
                                  className="flex items-center justify-between gap-4 py-2.5 text-sm"
                                >
                                  <span className="min-w-0 flex-1 pl-4">
                                    <a
                                      href={`/accounting/double-entry/ledger?account=${record.account_id}`}
                                      className="text-primary hover:underline"
                                    >
                                      {record.account_name}
                                    </a>
                                  </span>
                                  <span className="w-28 shrink-0 text-center">{record.account_code}</span>
                                  <span className="w-32 shrink-0 text-end tabular-nums text-foreground">
                                    {formatPrice(record.netAmount)}
                                  </span>
                                </div>
                              ))
                          )}
                          <div className="flex items-center justify-between gap-4 py-3 font-bold text-sm">
                            <span className="min-w-0 flex-1">Total Income</span>
                            <span className="w-28 shrink-0 text-center" />
                            <span className="w-32 shrink-0 text-end tabular-nums">{formatPrice(totalIncome)}</span>
                          </div>
                        </div>
                      )
                    }

                    if (accounts.Type === 'Costs of Goods Sold') {
                      return (
                        <div key={accounts.Type} className="border-b border-border/60 py-3">
                          <p className="mb-2 mt-1 text-sm font-bold text-foreground">{accounts.Type}</p>
                          {accounts.account.map((records) =>
                            records
                              .filter((record) => record.account_name !== 'Total Costs of Goods Sold')
                              .map((record) => {
                                const netAmount =
                                  record.netAmount > 0 ? record.netAmount : -record.netAmount
                                return (
                                  <div
                                    key={record.account_id}
                                    className="flex items-center justify-between gap-4 py-2.5 text-sm"
                                  >
                                    <span className="min-w-0 flex-1 pl-4">
                                      <a
                                        href={`/accounting/double-entry/ledger?account=${record.account_id}`}
                                        className="text-primary hover:underline"
                                      >
                                        {record.account_name}
                                      </a>
                                    </span>
                                    <span className="w-28 shrink-0 text-center">{record.account_code}</span>
                                    <span className="w-32 shrink-0 text-end tabular-nums text-foreground">
                                      {formatPrice(netAmount)}
                                    </span>
                                  </div>
                                )
                              })
                          )}
                          <div className="flex items-center justify-between gap-4 py-3 font-bold text-sm">
                            <span className="min-w-0 flex-1">Total Costs of Goods Sold</span>
                            <span className="w-28 shrink-0 text-center" />
                            <span className="w-32 shrink-0 text-end tabular-nums">
                              {formatPrice(totalCosts > 0 ? totalCosts : -totalCosts)}
                            </span>
                          </div>
                        </div>
                      )
                    }

                    if (accounts.Type === 'Expenses') {
                      let totalExpenses = 0
                      accounts.account.forEach((records) => {
                        records.forEach((record) => {
                          if (record.account_name === 'Total Expenses') {
                            totalExpenses = record.netAmount
                          }
                        })
                      })

                      return (
                        <div key={accounts.Type} className="border-b border-border/60 py-3">
                          <p className="mb-2 mt-1 text-sm font-bold text-foreground">{accounts.Type}</p>
                          {accounts.account.map((records) =>
                            records
                              .filter((record) => record.account_name !== 'Total Expenses')
                              .map((record) => {
                                const netAmount =
                                  record.netAmount > 0 ? record.netAmount : -record.netAmount
                                return (
                                  <div
                                    key={record.account_id}
                                    className="flex items-center justify-between gap-4 py-2.5 text-sm"
                                  >
                                    <span className="min-w-0 flex-1 pl-4">
                                      <a
                                        href={`/accounting/double-entry/ledger?account=${record.account_id}`}
                                        className="text-primary hover:underline"
                                      >
                                        {record.account_name}
                                      </a>
                                    </span>
                                    <span className="w-28 shrink-0 text-center">{record.account_code}</span>
                                    <span className="w-32 shrink-0 text-end tabular-nums text-foreground">
                                      {formatPrice(netAmount)}
                                    </span>
                                  </div>
                                )
                              })
                          )}
                          <div className="flex items-center justify-between gap-4 py-3 font-bold text-sm">
                            <span className="min-w-0 flex-1">Total Expenses</span>
                            <span className="w-28 shrink-0 text-center" />
                            <span className="w-32 shrink-0 text-end tabular-nums">
                              {formatPrice(totalExpenses > 0 ? totalExpenses : -totalExpenses)}
                            </span>
                          </div>
                        </div>
                      )
                    }

                    return null
                  })}

                  <div className="flex items-center justify-between gap-4 border-b border-border py-3 font-bold text-sm">
                    <span className="min-w-0 flex-1" />
                    <span className="w-28 shrink-0 text-center">Gross Profit</span>
                    <span className="w-32 shrink-0 text-end tabular-nums">{formatPrice(grossProfit)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-border py-3 font-bold text-sm">
                    <span className="min-w-0 flex-1" />
                    <span className="w-28 shrink-0 text-center">Net Profit/Loss</span>
                    <span className="w-32 shrink-0 text-end tabular-nums">{formatPrice(netProfit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

