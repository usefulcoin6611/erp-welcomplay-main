'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Download, Search, RefreshCw } from 'lucide-react'

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Ledger</h2>
          <p className="text-sm text-muted-foreground">
            View ledger summary by account and date range.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-end sm:ml-auto sm:self-auto">
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
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
            className="flex flex-col gap-4 md:flex-row md:items-end"
          >
            <div className="w-full md:w-44">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="w-full md:w-44">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="w-full md:w-52">
              <label className="text-sm font-medium">Account</label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="h-9">
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
            <div className="flex items-end gap-2">
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
        <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
          <CardContent className="p-0">
            <div className="table-responsive overflow-x-auto">
              <Table className="w-full min-w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3">Account Name</TableHead>
                    <TableHead className="px-4 py-3">Name</TableHead>
                    <TableHead className="px-4 py-3">Transaction Type</TableHead>
                    <TableHead className="px-4 py-3">Transaction Date</TableHead>
                    <TableHead className="px-4 py-3">Debit</TableHead>
                    <TableHead className="px-4 py-3">Credit</TableHead>
                    <TableHead className="px-4 py-3">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountArrays.map((accounts, idx) => {
                    let runningBalance = 0
                    return accounts.map((account, accIdx) => {
                      const total = account.debit + account.credit
                      if (account.debit != 0) {
                        runningBalance -= total
                      } else {
                        runningBalance += total
                      }
                      return (
                        <TableRow key={`${idx}-${accIdx}`}>
                          <TableCell className="px-4 py-3">{account.account_name}</TableCell>
                          <TableCell className="px-4 py-3">{account.user_name || '-'}</TableCell>
                          <TableCell className="px-4 py-3">{account.reference}</TableCell>
                          <TableCell className="px-4 py-3">{account.date}</TableCell>
                          <TableCell className="px-4 py-3">{formatPrice(account.debit)}</TableCell>
                          <TableCell className="px-4 py-3">{formatPrice(account.credit)}</TableCell>
                          <TableCell className="px-4 py-3">{formatPrice(runningBalance)}</TableCell>
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

