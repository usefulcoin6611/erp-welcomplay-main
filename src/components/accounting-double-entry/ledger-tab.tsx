'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download, Search, RefreshCw, X } from 'lucide-react'
import { Label } from '@/components/ui/label'

// Mock data based on reference structure
const chart_accounts = [
  {
    id: 1,
    account_name: 'Cash & Bank',
  },
]

const accountArrays = [
  [
    {
      account_name: 'Cash & Bank',
      user_name: 'John Doe',
      reference: 'Invoice #001',
      date: '2025-01-15',
      debit: 5_000_000,
      credit: 0,
    },
    {
      account_name: 'Cash & Bank',
      user_name: 'Jane Smith',
      reference: 'Payment #002',
      date: '2025-01-20',
      debit: 0,
      credit: 2_500_000,
    },
    {
      account_name: 'Cash & Bank',
      user_name: 'Bob Johnson',
      reference: 'Invoice #003',
      date: '2025-01-25',
      debit: 3_000_000,
      credit: 0,
    },
  ],
]

const accounts = [
  { id: 0, name: 'Select', code: '', parent: 0 },
  { id: 1, name: 'Cash & Bank', code: '1000', parent: 0 },
  { id: 2, name: 'Accounts Receivable', code: '1100', parent: 0 },
]

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function LedgerTab() {
  const [startDate, setStartDate] = useState('2025-01-01')
  const [endDate, setEndDate] = useState('2025-12-31')
  const [selectedAccount, setSelectedAccount] = useState('1')
  const [search, setSearch] = useState('')

  let balance = 0
  let totalDebit = 0
  let totalCredit = 0

  accountArrays.forEach((accounts) => {
    accounts.forEach((account) => {
      totalDebit += account.debit
      totalCredit += account.credit
      const total = account.debit + account.credit
      if (account.debit != 0) {
        balance -= total
      } else {
        balance += total
      }
    })
  })

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Ledger</CardTitle>
            <CardDescription>View ledger summary by account and date range.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
              onClick={() => {
                const element = document.getElementById('printableArea')
                if (element) {
                  // In real app, would use html2pdf library
                  console.log('Download ledger as PDF')
                }
              }}
              title="Download"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Ledger
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
        <CardContent className="px-6 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_14rem_auto] md:justify-start"
          >
            <div className="space-y-2">
              <Label htmlFor="ledger-start-date" className="text-sm font-medium">
                Start Date
              </Label>
              <DatePicker
                id="ledger-start-date"
                value={startDate}
                onValueChange={setStartDate}
                placeholder="Set a date"
                className="!h-9 px-3"
                iconPlacement="right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ledger-end-date" className="text-sm font-medium">
                End Date
              </Label>
              <DatePicker
                id="ledger-end-date"
                value={endDate}
                onValueChange={setEndDate}
                placeholder="Set a date"
                className="!h-9 px-3"
                iconPlacement="right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger
                  className={`w-full !h-9 ${
                    selectedAccount === '0' ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 md:pt-6">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                title="Apply"
              >
                <Search className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                onClick={() => {
                  setStartDate('2025-01-01')
                  setEndDate('2025-12-31')
                  setSelectedAccount('1')
                }}
                title="Reset"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <div id="printableArea">
        <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
            <CardTitle>Ledger Details</CardTitle>
            <div className="flex w-full max-w-md items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search ledger..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
                />
                {search.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="table-responsive overflow-x-auto">
              <Table className="w-full min-w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Account Name</TableHead>
                    <TableHead className="px-6">Name</TableHead>
                    <TableHead className="px-6">Transaction Type</TableHead>
                    <TableHead className="px-6">Transaction Date</TableHead>
                    <TableHead className="px-6">Debit</TableHead>
                    <TableHead className="px-6">Credit</TableHead>
                    <TableHead className="px-6">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountArrays.map((accounts, idx) => {
                    let runningBalance = 0
                    const filteredAccounts = !search.trim()
                      ? accounts
                      : accounts.filter((a) => {
                          const q = search.trim().toLowerCase()
                          const hay = [
                            a.account_name,
                            a.user_name ?? '',
                            a.reference,
                            a.date,
                          ]
                            .join(' ')
                            .toLowerCase()
                          return hay.includes(q)
                        })

                    return filteredAccounts.map((account, accIdx) => {
                      const total = account.debit + account.credit
                      if (account.debit != 0) {
                        runningBalance -= total
                      } else {
                        runningBalance += total
                      }
                      return (
                        <TableRow key={`${idx}-${accIdx}`}>
                          <TableCell className="px-6">{account.account_name}</TableCell>
                          <TableCell className="px-6">{account.user_name || '-'}</TableCell>
                          <TableCell className="px-6">{account.reference}</TableCell>
                          <TableCell className="px-6">{account.date}</TableCell>
                          <TableCell className="px-6">{formatPrice(account.debit)}</TableCell>
                          <TableCell className="px-6">{formatPrice(account.credit)}</TableCell>
                          <TableCell className="px-6">{formatPrice(runningBalance)}</TableCell>
                        </TableRow>
                      )
                    })
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

