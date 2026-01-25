'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import {
  Printer,
  FileDown,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react'

// Mock data based on reference structure
const totalAccounts = {
  Assets: [
    {
      account_name: 'Cash & Bank',
      account_code: '1000',
      totalDebit: 250_000_000,
      totalCredit: 0,
      account_id: 1,
      account: '',
    },
    {
      account_name: 'Accounts Receivable',
      account_code: '1100',
      totalDebit: 125_000_000,
      totalCredit: 0,
      account_id: 2,
      account: '',
    },
  ],
  Liabilities: [
    {
      account_name: 'Accounts Payable',
      account_code: '2000',
      totalDebit: 0,
      totalCredit: 75_000_000,
      account_id: 3,
      account: '',
    },
  ],
  Equity: [
    {
      account_name: 'Owner Equity',
      account_code: '3000',
      totalDebit: 0,
      totalCredit: 300_000_000,
      account_id: 4,
      account: '',
    },
  ],
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function TrialBalanceTab() {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState('2025-01-01')
  const [endDate, setEndDate] = useState('2025-12-31')
  const [showFilter, setShowFilter] = useState(false)

  const userName = user?.name || 'Company'
  const startDateRange = startDate || '2025-01-01'
  const endDateRange = endDate || '2025-12-31'

  let totalDebit = 0
  let totalCredit = 0

  Object.values(totalAccounts).forEach((accounts) => {
    accounts.forEach((record) => {
      if (record.account !== 'parentTotal') {
        totalDebit += record.totalDebit
        totalCredit += record.totalCredit
      }
    })
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Trial Balance</h2>
          <p className="text-sm text-muted-foreground">
            Review balances for all accounts in a period.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-end sm:ml-auto sm:self-auto">
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
          Export Trial Balance
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
        </div>
      </div>

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
              <div className="w-full md:w-44">
                <label className="mb-1 block text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="startDate"
                />
              </div>
              <div className="w-full md:w-44">
                <label className="mb-1 block text-sm font-medium">End Date</label>
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

      {/* Trial Balance */}
      <div id="printableArea">
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <div className="p-4 border-b">
                <h5 className="text-lg font-semibold">
                  Trial Balance of {userName} as of {startDateRange} to {endDateRange}
                </h5>
              </div>
              <CardContent className="p-0 overflow-auto">
                <div className="account-table-inner">
                  <div className="account-title flex items-center justify-between border-t border-b py-2 px-4">
                    <h6 className="mb-0 font-semibold">Account</h6>
                    <h6 className="mb-0 text-center font-semibold">Account Code</h6>
                    <h6 className="mb-0 text-end font-semibold">Debit</h6>
                    <h6 className="mb-0 text-end font-semibold">Credit</h6>
                  </div>

                  {Object.entries(totalAccounts).map(([type, accounts]) => (
                    <div key={type} className="account-main-inner border-bottom py-2">
                      <p className="fw-bold ps-2 mb-2 px-4 font-bold">{type}</p>
                      {accounts.map((record) => (
                        <div
                          key={record.account_id}
                          className="account-inner flex items-center justify-between ps-3 px-4"
                        >
                          <p className="mb-2 ms-md-3">
                            <a
                              href={`/accounting/double-entry/ledger?account=${record.account_id}`}
                              className="text-primary hover:underline"
                            >
                              {record.account_name}
                            </a>
                          </p>
                          <p className="mb-2 text-center">{record.account_code}</p>
                          <p className="mb-2 text-end">{formatPrice(record.totalDebit)}</p>
                          <p className="mb-2 text-end">{formatPrice(record.totalCredit)}</p>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div className="account-title flex items-center justify-between border-top border-bottom py-2 px-2 pe-0">
                    <h6 className="fw-bold mb-0 font-bold">Total</h6>
                    <h6 className="fw-bold mb-0 font-bold"></h6>
                    <h6 className="fw-bold mb-0 text-end ms-4 font-bold">{formatPrice(totalDebit)}</h6>
                    <h6 className="fw-bold mb-0 text-end font-bold">{formatPrice(totalCredit)}</h6>
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

