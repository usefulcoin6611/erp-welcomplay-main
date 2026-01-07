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
  const transfers = [
    {
      id: '1',
      date: '2025-11-10',
      fromAccount: 'Bank BCA - Operating Account',
      toAccount: 'Bank Mandiri - Payroll',
      amount: 'Rp 5,000,000',
      reference: 'TRF-2025-001',
      description: 'Payroll funding',
    },
    {
      id: '2',
      date: '2025-11-15',
      fromAccount: 'Bank Mandiri - Payroll',
      toAccount: 'Bank BCA - Operating Account',
      amount: 'Rp 2,500,000',
      reference: 'TRF-2025-002',
      description: 'Return unused payroll',
    },
  ]

  const accountOptions = [
    'Bank BCA - Operating Account',
    'Bank Mandiri - Payroll',
    'Bank Mandiri - Virtual Account',
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
        const matchFrom = !filters.fromAccount || transfer.fromAccount === filters.fromAccount
        const matchTo = !filters.toAccount || transfer.toAccount === filters.toAccount
        return matchDate && matchFrom && matchTo
      }),
    [filters, transfers],
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filter Transfer Bank</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-date">Tanggal</Label>
              <Input
                id="transfer-date"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>From Account</Label>
              <Select
                value={filters.fromAccount || undefined}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, fromAccount: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih akun asal" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih akun tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                className="flex-1 h-9 bg-blue-500 hover:bg-blue-600 shadow-none"
              >
                <Plus className="mr-2 size-4" />
                Buat Transfer
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

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transfer</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>From Account</TableHead>
                <TableHead>To Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{transfer.date}</TableCell>
                  <TableCell>{transfer.fromAccount}</TableCell>
                  <TableCell>{transfer.toAccount}</TableCell>
                  <TableCell className="font-semibold">{transfer.amount}</TableCell>
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
                        className="text-destructive"
                        aria-label={`Delete ${transfer.reference}`}
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
