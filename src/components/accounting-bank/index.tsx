'use client'

import { useMemo, useState } from 'react'
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export function AccountTab() {
  const accounts = [
    {
      id: '1',
      chartOfAccount: '1010 - Cash in Bank',
      name: 'Operating Account',
      bank: 'Bank BCA',
      accountNumber: '1234 5678 9012',
      currentBalance: 'Rp 150,000,000',
      contactNumber: '+62 812-1111-2222',
      paymentGateway: 'Cash',
    },
    {
      id: '2',
      chartOfAccount: '1011 - Cash',
      name: 'Petty Cash',
      bank: 'Bank Mandiri',
      accountNumber: '9988 7766 5544',
      currentBalance: 'Rp 12,500,000',
      contactNumber: '+62 812-3333-4444',
      paymentGateway: 'Cash',
    },
    {
      id: '3',
      chartOfAccount: '1020 - Virtual Account',
      name: 'Midtrans VA',
      bank: 'Bank Mandiri',
      accountNumber: 'VA 8877-1234-9999',
      currentBalance: 'Rp 28,750,000',
      contactNumber: '+62 812-8888-0000',
      paymentGateway: 'Midtrans',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h2 className="text-lg font-semibold">Bank Account</h2>
          <p className="text-sm text-muted-foreground">
            Daftar akun bank beserta saldo dan informasi gateway pembayaran.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
          >
            <Plus className="mr-2 size-4" />
            Buat Akun Bank
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-4 shadow-none"
          >
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Akun</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chart of Account</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>No. Rekening</TableHead>
                <TableHead className="text-right">Saldo Saat Ini</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Payment Gateway</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.chartOfAccount}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.bank}</TableCell>
                  <TableCell className="font-mono text-sm">{a.accountNumber}</TableCell>
                  <TableCell className="text-right font-semibold">{a.currentBalance}</TableCell>
                  <TableCell>{a.contactNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{a.paymentGateway}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${a.name}`}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label={`Delete ${a.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export function TransferTab() {
  // Mock data sesuai referensi Laravel
  const transfers = [
    {
      id: '1',
      date: '2025-11-10',
      fromAccount: {
        bankName: 'Bank BCA',
        holderName: 'Operating Account',
      },
      toAccount: {
        bankName: 'Bank Mandiri',
        holderName: 'Payroll',
      },
      amount: 5000000,
      reference: 'TRF-2025-001',
      description: 'Payroll funding',
    },
    {
      id: '2',
      date: '2025-11-15',
      fromAccount: {
        bankName: 'Bank Mandiri',
        holderName: 'Payroll',
      },
      toAccount: {
        bankName: 'Bank BCA',
        holderName: 'Operating Account',
      },
      amount: 2500000,
      reference: 'TRF-2025-002',
      description: 'Return unused payroll',
    },
    {
      id: '3',
      date: '2025-11-20',
      fromAccount: {
        bankName: 'Bank BCA',
        holderName: 'Operating Account',
      },
      toAccount: {
        bankName: 'Bank Mandiri',
        holderName: 'Virtual Account',
      },
      amount: 10000000,
      reference: 'TRF-2025-003',
      description: 'Monthly payment transfer',
    },
  ]

  const accountOptions = [
    { id: '1', label: 'Bank BCA - Operating Account', bankName: 'Bank BCA', holderName: 'Operating Account' },
    { id: '2', label: 'Bank Mandiri - Payroll', bankName: 'Bank Mandiri', holderName: 'Payroll' },
    { id: '3', label: 'Bank Mandiri - Virtual Account', bankName: 'Bank Mandiri', holderName: 'Virtual Account' },
  ]

  const [filters, setFilters] = useState({
    date: '',
    fromAccount: '',
    toAccount: '',
  })

  const filteredTransfers = useMemo(
    () =>
      transfers.filter((transfer) => {
        const matchDate = !filters.date || transfer.date === filters.date
        const matchFrom = !filters.fromAccount || 
          `${transfer.fromAccount.bankName} ${transfer.fromAccount.holderName}` === filters.fromAccount
        const matchTo = !filters.toAccount || 
          `${transfer.toAccount.bankName} ${transfer.toAccount.holderName}` === filters.toAccount
        return matchDate && matchFrom && matchTo
      }),
    [filters, transfers],
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Header dengan Create Button */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Bank Balance Transfer</h2>
          <p className="text-sm text-muted-foreground">
            Manage transfers between your bank accounts
          </p>
        </div>
        <Button
          size="sm"
          className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
        >
          <Plus className="mr-2 size-4" />
          Create Bank Transfer
        </Button>
      </div>

      {/* Filter Form */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="transfer-date">Date</Label>
              <Input
                id="transfer-date"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label>From Account</Label>
              <Select
                value={filters.fromAccount || undefined}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, fromAccount: value }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((option) => (
                    <SelectItem key={option.id} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Account</Label>
              <Select
                value={filters.toAccount || undefined}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, toAccount: value }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((option) => (
                    <SelectItem key={option.id} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => {
                  // Apply filter logic
                }}
                className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
              >
                Apply
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Reset filter"
                onClick={() => setFilters({ date: '', fromAccount: '', toAccount: '' })}
                className="h-9 w-9 shadow-none"
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Transfers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>From Account</TableHead>
                <TableHead>To Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>{formatDate(transfer.date)}</TableCell>
                    <TableCell>
                      {transfer.fromAccount.bankName} {transfer.fromAccount.holderName}
                    </TableCell>
                    <TableCell>
                      {transfer.toAccount.bankName} {transfer.toAccount.holderName}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(transfer.amount)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{transfer.reference}</TableCell>
                    <TableCell>{transfer.description}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${transfer.reference}`}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${transfer.reference}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No transfers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
