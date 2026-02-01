'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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
  AlertDialogDescription as AlertDialogDescriptionText,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

// Mock payments
const payments = [
  {
    id: 'PAY-2025-001',
    date: '2025-11-07',
    amount: 5000000,
    account: 'BCA - Main Operating',
    vendor: 'PT Supply Berkah',
    category: 'Expense',
    reference: 'REF-001',
    description: 'Payment for office supplies',
    paymentReceipt: 'receipt_001.pdf',
  },
  {
    id: 'PAY-2025-002',
    date: '2025-11-08',
    amount: 3200000,
    account: 'Mandiri - Purchases',
    vendor: 'CV Logistik Nusantara',
    category: 'Logistics',
    reference: 'REF-002',
    description: 'Payment for logistics services',
    paymentReceipt: null,
  },
]

const accounts = [
  { id: '1', name: 'BCA - Main Operating' },
  { id: '2', name: 'Mandiri - Purchases' },
  { id: '3', name: 'BRI - Savings Account' },
]

const vendors = [
  { id: '1', name: 'PT Supply Berkah' },
  { id: '2', name: 'CV Logistik Nusantara' },
  { id: '3', name: 'PT Teknologi Digital' },
]

const categories = [
  { id: '1', name: 'Expense' },
  { id: '2', name: 'Logistics' },
  { id: '3', name: 'Services' },
]

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function PaymentTab() {
  type PaymentRow = (typeof payments)[number]

  const [rows, setRows] = useState<PaymentRow[]>(payments)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRow | null>(null)
  const [formData, setFormData] = useState({
    vendor: '',
    date: '',
    amount: '',
    category: '',
    account: '',
    reference: '',
    description: '',
    paymentReceipt: '',
  })
  const [filters, setFilters] = useState({
    date: '',
    account: '',
    vendor: '',
    category: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    setCurrentPage(1) // Reset to first page on filter apply
  }

  const handleReset = () => {
    setFilters({
      date: '',
      account: '',
      vendor: '',
      category: '',
    })
    setCurrentPage(1)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        vendor: '',
        date: '',
        amount: '',
        category: '',
        account: '',
        reference: '',
        description: '',
        paymentReceipt: '',
      })
    }
  }

  const handleEdit = (payment: PaymentRow) => {
    setEditingId(payment.id)
    setFormData({
      vendor: vendors.find((v) => v.name === payment.vendor)?.id ?? '',
      date: payment.date,
      amount: String(payment.amount),
      category: categories.find((c) => c.name === payment.category)?.id ?? '',
      account: accounts.find((a) => a.name === payment.account)?.id ?? '',
      reference: payment.reference || '',
      description: payment.description || '',
      paymentReceipt: payment.paymentReceipt || '',
    })
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (payment: PaymentRow) => {
    setPaymentToDelete(payment)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!paymentToDelete) return
    setRows((prev) => prev.filter((p) => p.id !== paymentToDelete.id))
    setPaymentToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const vendorName = vendors.find((v) => v.id === formData.vendor)?.name ?? ''
    const categoryName = categories.find((c) => c.id === formData.category)?.name ?? ''
    const accountName = accounts.find((a) => a.id === formData.account)?.name ?? ''
    const nextAmount = Number(formData.amount) || 0

    if (editingId) {
      setRows((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                vendor: vendorName,
                date: formData.date,
                amount: nextAmount,
                category: categoryName,
                account: accountName,
                reference: formData.reference,
                description: formData.description,
                paymentReceipt: formData.paymentReceipt || null,
              }
            : p,
        ),
      )
    } else {
      const newId = `PAY-${new Date().getFullYear()}-${String(rows.length + 1).padStart(3, '0')}`
      const newRow: PaymentRow = {
        id: newId,
        vendor: vendorName,
        date: formData.date,
        amount: nextAmount,
        category: categoryName,
        account: accountName,
        reference: formData.reference,
        description: formData.description,
        paymentReceipt: formData.paymentReceipt || null,
      }
      setRows((prev) => [newRow, ...prev])
    }

    handleDialogOpenChange(false)
  }

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return rows.filter((payment) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const hay = [
          payment.id,
          payment.date,
          payment.account,
          payment.vendor,
          payment.category,
          payment.reference ?? '',
          payment.description ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.account) {
        const accountName = accounts.find(a => a.id === filters.account)?.name
        if (accountName && payment.account !== accountName) return false
      }
      if (filters.vendor) {
        const vendorName = vendors.find(v => v.id === filters.vendor)?.name
        if (vendorName && payment.vendor !== vendorName) return false
      }
      if (filters.category) {
        const categoryName = categories.find(c => c.id === filters.category)?.name
        if (categoryName && payment.category !== categoryName) return false
      }
      if (filters.date) {
        const filterDate = new Date(filters.date).toISOString().split('T')[0]
        if (payment.date !== filterDate) return false
      }
      return true
    })
  }, [filters, rows, search])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.date, filters.account, filters.vendor, filters.category, search])

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Payment</CardTitle>
            <CardDescription>Manage payments to vendors and suppliers.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={createDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="blue"
                size="sm"
                className="shadow-none h-7 px-4"
                title="Create"
                onClick={() => setEditingId(null)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Payment
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Payment' : 'Create New Payment'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-vendor">
                    Vendor <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })} required>
                    <SelectTrigger id="create-vendor">
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create vendor here.{' '}
                    <Link className="font-medium text-primary" href="/accounting/purchases?tab=supplier">
                      Create vendor
                    </Link>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input id="create-date" type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input id="create-amount" type="number" step="0.01" placeholder="Enter Amount" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                    <SelectTrigger id="create-category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create category here.{' '}
                    <Link className="font-medium text-primary" href="/accounting/setup?tab=category">
                      Create category
                    </Link>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-account">
                    Account <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.account} onValueChange={(value) => setFormData({ ...formData, account: value })} required>
                    <SelectTrigger id="create-account">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Create account here.{' '}
                    <Link className="font-medium text-primary" href="/accounting/bank-account">
                      Create account
                    </Link>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-reference">Reference</Label>
                  <Input id="create-reference" placeholder="Enter Reference" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-receipt">Payment Receipt</Label>
                  <Input id="create-receipt" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFormData({ ...formData, paymentReceipt: e.target.files?.[0]?.name ?? '' })} />
                  {formData.paymentReceipt ? (
                    <p className="text-xs text-muted-foreground">Selected: {formData.paymentReceipt}</p>
                  ) : null}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea id="create-description" placeholder="Enter Description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" type="button" className="shadow-none" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="blue" type="submit" className="shadow-none">
                {editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
        <CardContent className="px-6 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleApply()
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_14rem_14rem_auto] md:justify-start"
          >
            <div className="space-y-2">
              <Label htmlFor="payment-filter-date" className="text-sm font-medium">
                Date
              </Label>
              <DatePicker
                id="payment-filter-date"
                value={filters.date}
                onValueChange={(v) => handleFilterChange('date', v)}
                placeholder="Set a date"
                className="!h-9 px-3"
                iconPlacement="right"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Account</Label>
              <Select value={filters.account} onValueChange={(value) => handleFilterChange('account', value)}>
                <SelectTrigger
                  id="payment-filter-account"
                  className={`w-full !h-9 ${
                    !filters.account ? 'text-muted-foreground' : ''
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">Vendor</Label>
              <Select value={filters.vendor} onValueChange={(value) => handleFilterChange('vendor', value)}>
                <SelectTrigger
                  id="payment-filter-vendor"
                  className={`w-full !h-9 ${
                    !filters.vendor ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger
                  id="payment-filter-category"
                  className={`w-full !h-9 ${
                    !filters.category ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:pt-6">
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                title="Apply"
              >
                <Search className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
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

      {/* Payments Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Payment List</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
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
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Date</TableHead>
                  <TableHead className="px-6">Amount</TableHead>
                  <TableHead className="px-6">Account</TableHead>
                  <TableHead className="px-6">Vendor</TableHead>
                  <TableHead className="px-6">Category</TableHead>
                  <TableHead className="px-6">Reference</TableHead>
                  <TableHead className="px-6">Description</TableHead>
                  <TableHead className="px-6">Payment Receipt</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="px-6">
                        {formatDate(payment.date)}
                      </TableCell>
                      <TableCell className="px-6 font-medium">
                        {formatPrice(payment.amount)}
                      </TableCell>
                      <TableCell className="px-6">{payment.account}</TableCell>
                      <TableCell className="px-6">{payment.vendor}</TableCell>
                      <TableCell className="px-6">{payment.category}</TableCell>
                      <TableCell className="px-6">{payment.reference || '-'}</TableCell>
                      <TableCell className="px-6">{payment.description || '-'}</TableCell>
                      <TableCell className="px-6">
                        {payment.paymentReceipt ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                              title="Download"
                              onClick={() => console.log('Download:', payment.paymentReceipt)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                              title="Preview"
                              onClick={() => console.log('Preview:', payment.paymentReceipt)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            size="sm"
                            variant="outline"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => handleEdit(payment)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(payment)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="px-6 text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <div className="px-6 pb-6 pt-4">
              <SimplePagination
                totalCount={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
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
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescriptionText>
              Are you sure you want to delete this payment? This action cannot be undone.
            </AlertDialogDescriptionText>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPaymentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

