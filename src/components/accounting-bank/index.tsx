'use client'

import { useMemo, useState, useEffect } from 'react'
import { Pencil, Plus, RefreshCw, Trash2, Search, X } from 'lucide-react'

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
import { Textarea } from '@/components/ui/textarea'

export function AccountTab() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
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

  const chartOfAccounts = [
    { value: '1010', label: '1010 - Cash in Bank' },
    { value: '1011', label: '1011 - Cash' },
    { value: '1020', label: '1020 - Virtual Account' },
  ]

  const paymentGateways = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Midtrans', label: 'Midtrans' },
    { value: 'Xendit', label: 'Xendit' },
    { value: 'PayPal', label: 'PayPal' },
  ]

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
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
    // Handle form submission here
    console.log('Form data:', formData)
    handleDialogOpenChange(false)
  }

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
    {
      id: '4',
      chartOfAccount: '1010 - Cash in Bank',
      name: 'Savings Account',
      bank: 'Bank BNI',
      accountNumber: '5555 6666 7777',
      currentBalance: 'Rp 75,000,000',
      contactNumber: '+62 812-9999-0000',
      paymentGateway: 'Cash',
    },
    {
      id: '5',
      chartOfAccount: '1020 - Virtual Account',
      name: 'Xendit VA',
      bank: 'Bank BCA',
      accountNumber: 'VA 1234-5678-9999',
      currentBalance: 'Rp 45,000,000',
      contactNumber: '+62 812-7777-8888',
      paymentGateway: 'Xendit',
    },
  ]

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
  }, [search])

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
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h2 className="text-lg font-semibold">Bank Account</h2>
          <p className="text-sm text-muted-foreground">
            Daftar akun bank beserta saldo dan informasi gateway pembayaran.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" variant="blue" className="shadow-none h-7">
                <Plus className="mr-2 h-4 w-4" />
                Buat Akun Bank
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Bank Account</DialogTitle>
                <DialogDescription>
                  Add a new bank account to your system.
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
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="outline"
            className="h-7 shadow-none"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 focus-visible:border-0 shadow-none transition-colors"
              />
              {search.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => handleSearchChange('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader>
          <CardTitle>Semua Akun</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">Chart of Account</TableHead>
                <TableHead className="px-4 py-3">Nama</TableHead>
                <TableHead className="px-4 py-3">Bank</TableHead>
                <TableHead className="px-4 py-3">No. Rekening</TableHead>
                <TableHead className="px-4 py-3 text-right">Saldo Saat Ini</TableHead>
                <TableHead className="px-4 py-3">Kontak</TableHead>
                <TableHead className="px-4 py-3">Payment Gateway</TableHead>
                <TableHead className="px-4 py-3 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="px-4 py-3">{a.chartOfAccount}</TableCell>
                    <TableCell className="px-4 py-3">{a.name}</TableCell>
                    <TableCell className="px-4 py-3">{a.bank}</TableCell>
                    <TableCell className="px-4 py-3 font-mono text-sm">{a.accountNumber}</TableCell>
                    <TableCell className="px-4 py-3 text-right font-semibold">{a.currentBalance}</TableCell>
                    <TableCell className="px-4 py-3">{a.contactNumber}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="outline">{a.paymentGateway}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                          aria-label={`Edit ${a.name}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                          aria-label={`Delete ${a.name}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No accounts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalRecords > 0 && (
            <div className="mt-4 px-4 pb-4">
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
      {/* Header dengan Create Button */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Bank Balance Transfer</h2>
          <p className="text-sm text-muted-foreground">
            Manage transfers between your bank accounts
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="blue"
              className="shadow-none h-7"
            >
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
                    <Input
                      id="transfer-form-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full"
                      required
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
      </div>

      {/* Filter Form */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
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
                  setCurrentPage(1)
                }}
                variant="blue"
                size="sm"
                className="shadow-none h-7"
              >
                Apply
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Reset filter"
                onClick={() => {
                  setFilters({ date: '', fromAccount: '', toAccount: '' })
                  setCurrentPage(1)
                }}
                className="h-7 shadow-none"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Table */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader>
          <CardTitle>Bank Transfers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">Date</TableHead>
                <TableHead className="px-4 py-3">From Account</TableHead>
                <TableHead className="px-4 py-3">To Account</TableHead>
                <TableHead className="px-4 py-3 text-right">Amount</TableHead>
                <TableHead className="px-4 py-3">Reference</TableHead>
                <TableHead className="px-4 py-3">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransfers.length > 0 ? (
                paginatedTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="px-4 py-3">{formatDate(transfer.date)}</TableCell>
                    <TableCell className="px-4 py-3">
                      {transfer.fromAccount.bankName} {transfer.fromAccount.holderName}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {transfer.toAccount.bankName} {transfer.toAccount.holderName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(transfer.amount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-sm">{transfer.reference}</TableCell>
                    <TableCell className="px-4 py-3">{transfer.description}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transfers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalRecords > 0 && (
            <div className="mt-4 px-4 pb-4">
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
