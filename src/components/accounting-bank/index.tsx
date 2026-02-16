'use client'

import { useMemo, useState, useEffect } from 'react'
import { Pencil, Plus, RefreshCw, Trash2, Search, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'

export function AccountTab() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<BankAccountRow | null>(null)
  const [formData, setFormData] = useState({
    chartOfAccount: '',
    paymentGateway: '',
    holderName: '',
    bank: '',
    accountNumber: '',
    openingBalance: '',
    contactNumber: '',
    bankAddress: '',
  })

  const [chartOfAccounts, setChartOfAccounts] = useState<{ value: string; label: string }[]>([])

  const paymentGateways = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Midtrans', label: 'Midtrans' },
    { value: 'Xendit', label: 'Xendit' },
    { value: 'PayPal', label: 'PayPal' },
  ]

  type BankAccountRow = {
    id: string
    chartOfAccount: string
    name: string
    bank: string
    accountNumber: string
    currentBalance: string
    contactNumber: string
    paymentGateway: string
  }

  const formatRupiah = (amount: number) =>
    `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount)}`

  const parseRupiahToNumber = (value: string) => {
    const digits = value.replace(/[^\d]/g, '')
    return digits ? Number(digits) : 0
  }

  const coaLabelFromValue = (value: string) => chartOfAccounts.find((c) => c.value === value)?.label ?? value

  const coaValueFromLabel = (label: string) => {
    const code = label.split(' - ')[0]?.trim()
    return chartOfAccounts.find((c) => c.value === code)?.value ?? ''
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        chartOfAccount: '',
        paymentGateway: '',
        holderName: '',
        bank: '',
        accountNumber: '',
        openingBalance: '',
        contactNumber: '',
        bankAddress: '',
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      chartCode: formData.chartOfAccount,
      holderName: formData.holderName,
      bank: formData.bank,
      accountNumber: formData.accountNumber,
      openingBalance: formData.openingBalance ? Number(formData.openingBalance) : 0,
      contactNumber: formData.contactNumber || null,
      bankAddress: formData.bankAddress || null,
      paymentGateway: formData.paymentGateway,
    }

    fetch('/api/bank-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) return
        await loadAccounts()
        handleDialogOpenChange(false)
      })
      .catch(() => {})

  }

  const [accounts, setAccounts] = useState<BankAccountRow[]>([])

  const loadAccounts = async () => {
    try {
      const res = await fetch('/api/bank-accounts', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      if (!json?.success || !Array.isArray(json.data)) return
      setAccounts(json.data as BankAccountRow[])
    } catch {}
  }

  const loadCOA = async () => {
    try {
      const res = await fetch('/api/chart-of-accounts', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      const list = Array.isArray(json?.data) ? (json.data as any[]) : []
      const assets = list.filter((a) => a.type === 'Assets')
      const options = assets.map((a) => ({
        value: String(a.code),
        label: `${a.code} - ${a.name}`,
      }))
      setChartOfAccounts(options)
    } catch {}
  }

  useEffect(() => {
    loadAccounts()
    loadCOA()
  }, [])

  const handleEdit = (row: BankAccountRow) => {
    setEditingId(row.id)
    setFormData({
      chartOfAccount: coaValueFromLabel(row.chartOfAccount),
      paymentGateway: row.paymentGateway,
      holderName: row.name,
      bank: row.bank,
      accountNumber: row.accountNumber,
      openingBalance: `${parseRupiahToNumber(row.currentBalance)}`,
      contactNumber: row.contactNumber,
      bankAddress: '',
    })
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const row = accounts.find((a) => a.id === id) ?? null
    setAccountToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!accountToDelete) return
    setAccounts((prev) => prev.filter((a) => a.id !== accountToDelete.id))
    setAccountToDelete(null)
    setDeleteDialogOpen(false)
  }

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return accounts
    
    const q = search.trim().toLowerCase()
    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(q) ||
        account.bank.toLowerCase().includes(q) ||
        account.accountNumber.toLowerCase().includes(q) ||
        account.chartOfAccount.toLowerCase().includes(q) ||
        account.paymentGateway.toLowerCase().includes(q)
    )
  }, [search, accounts])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Bank Account</CardTitle>
            <CardDescription>
              Daftar akun bank beserta saldo dan informasi gateway pembayaran.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 shadow-none">
              Export CSV
            </Button>
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="blue"
                  className="shadow-none h-7"
                  onClick={() => {
                    setEditingId(null)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Akun Bank
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Akun Bank' : 'Buat Akun Bank'}</DialogTitle>
                  <DialogDescription>
                    {editingId ? 'Perbarui informasi akun bank.' : 'Tambahkan akun bank baru ke sistem.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  {/* Row 1: Chart of Account | Payment Gateway */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chartOfAccount" className="form-label">
                        Account <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.chartOfAccount}
                        onValueChange={(value) => setFormData({ ...formData, chartOfAccount: value })}
                        required
                      >
                        <SelectTrigger id="chartOfAccount" className="w-full">
                          <SelectValue placeholder="Select Chart of Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {chartOfAccounts.map((coa) => (
                            <SelectItem key={coa.value} value={coa.value}>
                              {coa.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create account here. <span className="font-medium text-primary cursor-pointer">Create account</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentGateway" className="form-label">
                        Payment Gateway <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.paymentGateway}
                        onValueChange={(value) => setFormData({ ...formData, paymentGateway: value })}
                        required
                      >
                        <SelectTrigger id="paymentGateway" className="w-full">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentGateways.map((gateway) => (
                            <SelectItem key={gateway.value} value={gateway.value}>
                              {gateway.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Row 2: Bank Holder Name | Bank Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="holderName" className="form-label">
                        Bank Holder Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="holderName"
                        value={formData.holderName}
                        onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                        placeholder="Enter Bank Holder Name"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank" className="form-label">
                        Bank Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="bank"
                        value={formData.bank}
                        onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                        placeholder="Enter Bank Name"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  {/* Row 3: Account Number | Opening Balance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="form-label">
                        Account Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="Enter Account Number"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="openingBalance" className="form-label">
                        Opening Balance
                      </Label>
                      <Input
                        id="openingBalance"
                        type="number"
                        step="0.01"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                        placeholder="Enter Opening Balance"
                        className="w-full"
                      />
                    </div>
                  </div>
                  {/* Row 4: Contact Number (col-md-6) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber" className="form-label">
                        Contact Number
                      </Label>
                      <Input
                        id="contactNumber"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        placeholder="Enter Contact Number"
                        className="w-full"
                      />
                    </div>
                    <div></div>
                  </div>
                  {/* Row 5: Bank Address (col-md-12 mb-0) */}
                  <div className="space-y-2 mb-0">
                    <Label htmlFor="bankAddress" className="form-label">
                      Bank Address
                    </Label>
                    <Textarea
                      id="bankAddress"
                      value={formData.bankAddress}
                      onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                      placeholder="Enter Bank Address"
                      rows={3}
                      className="w-full"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="blue" className="shadow-none">
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Semua Akun</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
              />
              {search.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => handleSearchChange('')}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Chart of Account</TableHead>
                <TableHead className="px-6">Nama</TableHead>
                <TableHead className="px-6">Bank</TableHead>
                <TableHead className="px-6">No. Rekening</TableHead>
                <TableHead className="px-6 text-right">Saldo Saat Ini</TableHead>
                <TableHead className="px-6">Kontak</TableHead>
                <TableHead className="px-6">Payment Gateway</TableHead>
                <TableHead className="px-6 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="px-6">{a.chartOfAccount}</TableCell>
                    <TableCell className="px-6">{a.name}</TableCell>
                    <TableCell className="px-6">{a.bank}</TableCell>
                    <TableCell className="px-6 font-mono text-sm">{a.accountNumber}</TableCell>
                    <TableCell className="px-6 text-right">{a.currentBalance}</TableCell>
                    <TableCell className="px-6">{a.contactNumber}</TableCell>
                    <TableCell className="px-6">
                      <Badge variant="outline">{a.paymentGateway}</Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                          aria-label={`Edit ${a.name}`}
                          onClick={() => handleEdit(a)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                          aria-label={`Delete ${a.name}`}
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 text-center py-8 text-muted-foreground">
                    No accounts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalRecords > 0 && (
            <div className="px-6 pb-6 pt-4">
              <SimplePagination
                totalCount={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bank account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAccountToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function TransferTab() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({
    date: '',
    fromAccount: '',
    toAccount: '',
    amount: '',
    reference: '',
    description: '',
  })

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

  // Paginated data
  const paginatedTransfers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredTransfers.slice(startIndex, endIndex)
  }, [filteredTransfers, currentPage, pageSize])

  const totalRecords = filteredTransfers.length

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.date, filters.fromAccount, filters.toAccount])

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setFormData({
        date: '',
        fromAccount: '',
        toAccount: '',
        amount: '',
        reference: '',
        description: '',
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', formData)
    handleDialogOpenChange(false)
  }

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
      {/* Header */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Bank Balance Transfer</CardTitle>
            <CardDescription>
              Manage transfers between your bank accounts
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" variant="blue" className="shadow-none h-7">
                <Plus className="mr-2 h-4 w-4" />
                Create Bank Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Bank Transfer</DialogTitle>
                <DialogDescription>
                  Transfer balance between your bank accounts.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* Row 1: From Account | To Account */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromAccount" className="form-label">
                      From Account <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.fromAccount}
                      onValueChange={(value) => setFormData({ ...formData, fromAccount: value })}
                      required
                    >
                      <SelectTrigger id="fromAccount" className="w-full">
                        <SelectValue placeholder="Select Bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountOptions.map((option) => (
                          <SelectItem key={option.id} value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create account here. <span className="font-medium text-primary cursor-pointer">Create account</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toAccount" className="form-label">
                      To Account <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.toAccount}
                      onValueChange={(value) => setFormData({ ...formData, toAccount: value })}
                      required
                    >
                      <SelectTrigger id="toAccount" className="w-full">
                        <SelectValue placeholder="Select Bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountOptions.map((option) => (
                          <SelectItem key={option.id} value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create account here. <span className="font-medium text-primary cursor-pointer">Create account</span>
                    </p>
                  </div>
                </div>
                {/* Row 2: Amount | Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="form-label">
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter Amount"
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transfer-form-date" className="form-label">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      id="transfer-form-date"
                      value={formData.date}
                      onValueChange={(v) => setFormData({ ...formData, date: v })}
                      placeholder="Set a date"
                      className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3"
                    />
                    {/* Keep native required validation without showing a browser date input */}
                    <input
                      tabIndex={-1}
                      aria-hidden="true"
                      className="sr-only"
                      required
                      value={formData.date}
                      onChange={() => {}}
                    />
                  </div>
                </div>
                {/* Row 3: Reference (col-md-6) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference" className="form-label">
                      Reference
                    </Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="Enter Reference"
                      className="w-full"
                    />
                  </div>
                  <div></div>
                </div>
                {/* Row 4: Description (col-md-12 mb-0) */}
                <div className="space-y-2 mb-0">
                  <Label htmlFor="description" className="form-label">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter Description"
                    rows={3}
                    className="w-full"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="blue" className="shadow-none">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </CardHeader>
      </Card>

      {/* Filter Form */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-6 py-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="transfer-date">Date</Label>
              <DatePicker
                id="transfer-date"
                value={filters.date}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, date: v }))}
                className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3"
                placeholder="Set a date"
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
                  setCurrentPage(1)
                }}
                variant="outline"
                size="sm"
                className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                aria-label="Apply filter"
                title="Apply"
              >
                <Search className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Reset filter"
                title="Reset"
                onClick={() => {
                  setFilters({ date: '', fromAccount: '', toAccount: '' })
                  setCurrentPage(1)
                }}
                className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <CardTitle>Bank Transfers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Date</TableHead>
                <TableHead className="px-6">From Account</TableHead>
                <TableHead className="px-6">To Account</TableHead>
                <TableHead className="px-6 text-right">Amount</TableHead>
                <TableHead className="px-6">Reference</TableHead>
                <TableHead className="px-6">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransfers.length > 0 ? (
                paginatedTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="px-6">{formatDate(transfer.date)}</TableCell>
                    <TableCell className="px-6">
                      {transfer.fromAccount.bankName} {transfer.fromAccount.holderName}
                    </TableCell>
                    <TableCell className="px-6">
                      {transfer.toAccount.bankName} {transfer.toAccount.holderName}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      {formatCurrency(transfer.amount)}
                    </TableCell>
                    <TableCell className="px-6 font-mono text-sm">{transfer.reference}</TableCell>
                    <TableCell className="px-6">{transfer.description}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 text-center py-8 text-muted-foreground">
                    No transfers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalRecords > 0 && (
            <div className="px-6 pb-6 pt-4">
              <SimplePagination
                totalCount={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(page) => {
                  setCurrentPage(page)
                }}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
