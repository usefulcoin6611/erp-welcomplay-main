'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import {
  IconPrinter,
  IconFileExport,
  IconFilter,
  IconSeparatorVertical,
  IconSearch,
} from '@tabler/icons-react'

// Mock data based on reference structure
const totalAccounts = {
  Assets: [
    {
      subType: 'Current Assets',
      account: [
        [
          {
            account_name: 'Cash & Bank',
            account_code: '1000',
            netAmount: 250_000_000,
            account_id: 1,
            account: '',
          },
          {
            account_name: 'Accounts Receivable',
            account_code: '1100',
            netAmount: 125_000_000,
            account_id: 2,
            account: '',
          },
        ],
      ],
    },
  ],
  Liabilities: [
    {
      subType: 'Current Liabilities',
      account: [
        [
          {
            account_name: 'Accounts Payable',
            account_code: '2000',
            netAmount: 75_000_000,
            account_id: 3,
            account: '',
          },
          {
            account_name: 'Taxes Payable',
            account_code: '2100',
            netAmount: 20_000_000,
            account_id: 4,
            account: '',
          },
        ],
      ],
    },
  ],
  Equity: [
    {
      subType: 'Equity',
      account: [
        [
          {
            account_name: 'Owner Equity',
            account_code: '3000',
            netAmount: 250_000_000,
            account_id: 5,
            account: '',
          },
          {
            account_name: 'Current Year Earnings',
            account_code: '3100',
            netAmount: 110_000_000,
            account_id: 6,
            account: '',
          },
        ],
      ],
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

export function BalanceSheetTab() {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState('2025-01-01')
  const [endDate, setEndDate] = useState('2025-12-31')
  const [showFilter, setShowFilter] = useState(false)

  const userName = user?.name || 'Company'
  const startDateRange = startDate || '2025-01-01'
  const endDateRange = endDate || '2025-12-31'

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="shadow-none h-7"
          onClick={() => {
            const printContents = document.getElementById('printableArea')?.innerHTML
            if (printContents) {
              const originalContents = document.body.innerHTML
              document.body.innerHTML = printContents
              window.print()
              document.body.innerHTML = originalContents
            }
          }}
        >
          <IconPrinter className="h-3 w-3" />
        </Button>
        <Button variant="secondary" size="sm" className="shadow-none h-7">
          <IconFileExport className="h-3 w-3" />
        </Button>
        <Button
          variant="blue"
          size="sm"
          className="shadow-none h-7"
          onClick={() => setShowFilter(!showFilter)}
        >
          <IconFilter className="h-3 w-3" />
        </Button>
        <Button variant="secondary" size="sm" className="shadow-none h-7 bg-light-blue-subtitle">
          <IconSeparatorVertical className="h-3 w-3" />
        </Button>
      </div>

      {/* Filters */}
      {showFilter && (
        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setShowFilter(false)
              }}
              className="flex flex-col gap-4 md:flex-row md:items-end md:justify-end"
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
                <Button type="submit" variant="blue" size="sm" className="shadow-none h-7">
                  <IconSearch className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="shadow-none h-7"
                  onClick={() => {
                    setStartDate('2025-01-01')
                    setEndDate('2025-12-31')
                  }}
                >
                  <IconSearch className="h-3 w-3 rotate-180" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Balance Sheet */}
      <div id="printableArea">
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <Card>
              <div className="card-header p-4 border-b">
                <h5 className="text-lg font-semibold">
                  Balance Sheet of {userName} as of {startDateRange} to {endDateRange}
                </h5>
              </div>
              <CardContent className="p-0 overflow-auto">
                <div className="account-table-inner">
                  <div className="account-title flex items-center justify-between border-t border-b py-2 px-4">
                    <h6 className="mb-0 font-semibold">Account</h6>
                    <h6 className="mb-0 text-center font-semibold">Account Code</h6>
                    <h6 className="mb-0 text-end font-semibold">Total</h6>
                  </div>

                  {Object.entries(totalAccounts).map(([type, accounts]) => {
                    let total = 0
                    const isAssets = type === 'Assets'
                    const isLiabilitiesOrEquity = type === 'Liabilities' || type === 'Equity'

                    return (
                      <div key={type} className="account-main-inner py-2">
                        {isLiabilitiesOrEquity && (
                          <p className="fw-bold mb-3 px-4 font-bold">Liabilities & Equity</p>
                        )}
                        <p className="fw-bold ps-2 mb-2 px-4 font-bold">{type}</p>

                        {accounts.map((accountGroup, idx) => (
                          <div key={idx} className="border-bottom py-2">
                            {accountGroup.account.map((records) =>
                              records.map((record) => {
                                const netAmount = isAssets ? -record.netAmount : record.netAmount
                                total += netAmount

                                return (
                                  <div
                                    key={record.account_id}
                                    className="account-inner flex items-center justify-between ps-md-5 ps-3 px-4"
                                  >
                                    <p className="mb-2 ms-3">
                                      <a
                                        href={`/accounting/double-entry/ledger?account=${record.account_id}`}
                                        className="text-primary hover:underline"
                                      >
                                        {record.account_name}
                                      </a>
                                    </p>
                                    <p className="mb-2 text-center">{record.account_code}</p>
                                    <p className="text-primary mb-2 float-end text-end">
                                      {formatPrice(netAmount)}
                                    </p>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        ))}

                        <div className="account-title flex items-center justify-between border-bottom py-2 px-2 pe-0">
                          <h6 className="fw-bold mb-0 font-bold">Total for {type}</h6>
                          <h6 className="fw-bold mb-0 text-end font-bold">{formatPrice(total)}</h6>
                        </div>
                      </div>
                    )
                  })}

                  <div className="account-title flex items-center justify-between border-bottom py-2 px-0">
                    <h6 className="fw-bold mb-0 font-bold">Total for Liabilities & Equity</h6>
                    <h6 className="fw-bold mb-0 text-end font-bold">
                      {formatPrice(
                        Object.entries(totalAccounts).reduce((sum, [type, accounts]) => {
                          if (type === 'Assets') return sum
                          const typeTotal = accounts.reduce((accTotal, accountGroup) => {
                            return (
                              accTotal +
                              accountGroup.account.reduce((groupTotal, records) => {
                                return (
                                  groupTotal +
                                  records.reduce((recordTotal, record) => {
                                    return recordTotal + record.netAmount
                                  }, 0)
                                )
                              }, 0)
                            )
                          }, 0)
                          return sum + typeTotal
                        }, 0)
                      )}
                    </h6>
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
