'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Download, Search, RefreshCw, X, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface Account {
  id: string
  name: string
  code: string
}

interface LedgerLine {
  id: string
  date: string
  reference: string
  description: string
  debit: number
  credit: number
  journalId: string
}

export function LedgerTab() {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [search, setSearch] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [ledgerData, setLedgerData] = useState<LedgerLine[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(true)

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/chart-of-accounts')
      const result = await response.json()
      if (result.success) {
        setAccounts(result.data)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const fetchLedger = useCallback(async () => {
    if (!selectedAccount) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        accountId: selectedAccount,
        startDate,
        endDate,
      })
      const response = await fetch(`/api/ledger?${params.toString()}`)
      const result = await response.json()
      if (result.success) {
        setLedgerData(result.data.lines)
      }
    } catch (error) {
      console.error('Error fetching ledger:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedAccount, startDate, endDate])

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
    if (selectedAccount) {
      fetchLedger()
    }
  }, [selectedAccount, fetchLedger])

  const handleReset = () => {
    setStartDate(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
    setEndDate(new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0])
    setSelectedAccount('')
    setSearch('')
  }

  const filteredLedger = ledgerData.filter((item) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      item.reference.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    )
  })

  let runningBalance = 0

  const handleDownload = () => {
    if (!selectedAccount || filteredLedger.length === 0) {
      return
    }

    const account = accounts.find(a => a.id === selectedAccount)
    const accountLabel = account ? `${account.code} - ${account.name}` : selectedAccount

    const rows: (string | number)[][] = []

    rows.push(['Account', accountLabel])
    rows.push(['Start Date', startDate])
    rows.push(['End Date', endDate])
    rows.push([])
    rows.push(['Date', 'Reference', 'Description', 'Debit', 'Credit', 'Balance'])

    let balance = 0
    filteredLedger.forEach(line => {
      balance += line.debit - line.credit
      const dateString = new Date(line.date).toISOString().split('T')[0]
      rows.push([
        dateString,
        line.reference,
        line.description || '',
        line.debit,
        line.credit,
        balance,
      ])
    })

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute(
      'download',
      `ledger_${accountLabel.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`,
    )
    link.setAttribute('href', encodedUri)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
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
              onClick={handleDownload}
              disabled={!selectedAccount || filteredLedger.length === 0}
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
            className="flex flex-wrap items-end justify-end gap-4"
          >
            <div className="w-full sm:w-[14rem] space-y-2">
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
            <div className="w-full sm:w-[14rem] space-y-2">
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
            <div className="w-full sm:w-[14rem] space-y-2 translate-y-[8px]">
              <Label className="text-sm font-medium">Account</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger
                  className={`w-full !h-9 ${
                    !selectedAccount ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder={loadingAccounts ? "Loading..." : "Select Account"} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                onClick={fetchLedger}
                title="Apply"
              >
                <Search className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                onClick={handleReset}
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading ledger data...
                      </TableCell>
                    </TableRow>
                  ) : !selectedAccount ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Please select an account to view ledger details.
                      </TableCell>
                    </TableRow>
                  ) : filteredLedger.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No transactions found for this account and date range.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLedger.map((item, idx) => {
                      // Note: We need to calculate running balance correctly
                      // In a real app, you might need the starting balance before the range
                      runningBalance += item.debit - item.credit
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="px-6">
                            {accounts.find(a => a.id === selectedAccount)?.name}
                          </TableCell>
                          <TableCell className="px-6">{item.description || '-'}</TableCell>
                          <TableCell className="px-6">
                            <Link 
                              href={`/accounting/journal-entry/${item.journalId}`}
                              className="text-blue-600 hover:underline"
                            >
                              {item.reference}
                            </Link>
                          </TableCell>
                          <TableCell className="px-6">
                            {new Date(item.date).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell className="px-6">{formatPrice(item.debit)}</TableCell>
                          <TableCell className="px-6">{formatPrice(item.credit)}</TableCell>
                          <TableCell className="px-6">{formatPrice(runningBalance)}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
