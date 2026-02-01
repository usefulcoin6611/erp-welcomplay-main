'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { SimplePagination } from '@/components/ui/simple-pagination'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Download,
  Eye,
} from 'lucide-react'

// Mock data
const revenueData = [
  {
    id: 1,
    date: '2024-01-15',
    amount: 15000000,
    account: 'Bank BCA - Operating Account',
    customer: 'PT Teknologi Digital Indonesia',
    category: 'Web Development',
    reference: 'INV-001',
    description: 'Monthly web development services',
    paymentReceipt: 'receipt_001.pdf',
  },
  {
    id: 2,
    date: '2024-01-14',
    amount: 5000000,
    account: 'Bank Mandiri - Petty Cash',
    customer: 'CV Mitra Sejahtera',
    category: 'Consulting',
    reference: 'INV-002',
    description: 'Technical consultation services',
    paymentReceipt: null,
  },
  {
    id: 3,
    date: '2024-01-12',
    amount: 12000000,
    account: 'Bank BCA - Operating Account',
    customer: 'PT Global Solution',
    category: 'Cloud Services',
    reference: 'INV-003',
    description: 'Cloud infrastructure setup',
    paymentReceipt: 'receipt_003.pdf',
  },
]

const accounts = [
  { id: '1', name: 'Bank BCA - Operating Account' },
  { id: '2', name: 'Bank Mandiri - Petty Cash' },
  { id: '3', name: 'Bank BRI - Savings Account' },
]

const customers = [
  { id: '1', name: 'PT Teknologi Digital Indonesia' },
  { id: '2', name: 'CV Mitra Sejahtera' },
  { id: '3', name: 'PT Global Solution' },
]

const categories = [
  { id: '1', name: 'Web Development' },
  { id: '2', name: 'Consulting' },
  { id: '3', name: 'Cloud Services' },
  { id: '4', name: 'Software License' },
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

export function RevenueTab() {
  type RevenueRow = (typeof revenueData)[number]

  const [rows, setRows] = useState<RevenueRow[]>(revenueData)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [revenueToDelete, setRevenueToDelete] = useState<RevenueRow | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    account: '',
    customer: '',
    category: '',
    reference: '',
    description: '',
    paymentReceipt: '',
  })

  const [filters, setFilters] = useState({
    date: '',
    account: '',
    customer: '',
    category: '',
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    // Apply filters logic here
    console.log('Apply filters:', filters)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setFilters({
      date: '',
      account: '',
      customer: '',
      category: '',
    })
    setCurrentPage(1)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        date: '',
        amount: '',
        account: '',
        customer: '',
        category: '',
        reference: '',
        description: '',
        paymentReceipt: '',
      })
    }
  }

  const handleEdit = (revenue: RevenueRow) => {
    setEditingId(revenue.id)
    setFormData({
      date: revenue.date,
      amount: String(revenue.amount),
      account: accounts.find((a) => a.name === revenue.account)?.id ?? '',
      customer: customers.find((c) => c.name === revenue.customer)?.id ?? '',
      category: categories.find((c) => c.name === revenue.category)?.id ?? '',
      reference: revenue.reference || '',
      description: revenue.description || '',
      paymentReceipt: revenue.paymentReceipt || '',
    })
    setDialogOpen(true)
  }

  const handleDeleteClick = (revenue: RevenueRow) => {
    setRevenueToDelete(revenue)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!revenueToDelete) return
    setRows((prev) => prev.filter((r) => r.id !== revenueToDelete.id))
    setRevenueToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const accountName = accounts.find((a) => a.id === formData.account)?.name ?? ''
    const customerName = customers.find((c) => c.id === formData.customer)?.name ?? ''
    const categoryName = categories.find((c) => c.id === formData.category)?.name ?? ''

    if (editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                date: formData.date,
                amount: Number(formData.amount) || 0,
                account: accountName,
                customer: customerName,
                category: categoryName,
                reference: formData.reference,
                description: formData.description,
                paymentReceipt: formData.paymentReceipt || null,
              }
            : r,
        ),
      )
    } else {
      const nextId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1
      const newRow: RevenueRow = {
        id: nextId,
        date: formData.date,
        amount: Number(formData.amount) || 0,
        account: accountName,
        customer: customerName,
        category: categoryName,
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
    return rows.filter((revenue) => {
      if (filters.account) {
        const accountName = accounts.find((a) => a.id === filters.account)?.name
        if (accountName && revenue.account !== accountName) return false
      }
      if (filters.customer) {
        const customerName = customers.find((c) => c.id === filters.customer)?.name
        if (customerName && revenue.customer !== customerName) return false
      }
      if (filters.category) {
        const categoryName = categories.find((c) => c.id === filters.category)?.name
        if (categoryName && revenue.category !== categoryName) return false
      }
      if (filters.date) {
        // Simple date filter - can be enhanced with date range
        const filterDate = new Date(filters.date).toISOString().split('T')[0]
        if (revenue.date !== filterDate) return false
      }
      return true
    })
  }, [rows, filters.account, filters.category, filters.customer, filters.date])

  const totalRecords = filteredData.length

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Revenue</CardTitle>
            <CardDescription>Track incoming revenue and receipts.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="blue"
                size="sm"
                className="shadow-none h-7 px-4"
                title="Create Revenue"
                onClick={() => setEditingId(null)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Revenue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Revenue' : 'Create New Revenue'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-date">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="create-date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-amount">
                        Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="create-amount"
                        type="number"
                        step="0.01"
                        placeholder="Enter Amount"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-account">
                        Account <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.account}
                        onValueChange={(value) => setFormData({ ...formData, account: value })}
                        required
                      >
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
                        Create account here. <span className="font-medium text-primary cursor-pointer">Create account</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-customer">
                        Customer <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.customer}
                        onValueChange={(value) => setFormData({ ...formData, customer: value })}
                        required
                      >
                        <SelectTrigger id="create-customer">
                          <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create customer here. <span className="font-medium text-primary cursor-pointer">Create customer</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-description">Description</Label>
                    <Textarea
                      id="create-description"
                      placeholder="Enter Description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-category">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                      >
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
                        Create category here. <span className="font-medium text-primary cursor-pointer">Create category</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-reference">Reference</Label>
                      <Input
                        id="create-reference"
                        placeholder="Enter Reference"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-receipt">Payment Receipt</Label>
                    <Input
                      id="create-receipt"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentReceipt: e.target.files?.[0]?.name ?? '',
                        })
                      }
                    />
                    {formData.paymentReceipt ? (
                      <p className="text-xs text-muted-foreground">Selected: {formData.paymentReceipt}</p>
                    ) : null}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" className="shadow-none" onClick={() => handleDialogOpenChange(false)}>
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

      {/* Filters */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
        <CardContent className="px-6 py-4">
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_14rem_14rem_auto] md:justify-start"
            onSubmit={(e) => {
              e.preventDefault()
              handleApply()
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="revenue-filter-date" className="text-sm font-medium">
                Date
              </Label>
              <DatePicker
                id="revenue-filter-date"
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
                  id="revenue-filter-account"
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
              <Label className="text-sm font-medium">Customer</Label>
              <Select value={filters.customer} onValueChange={(value) => handleFilterChange('customer', value)}>
                <SelectTrigger
                  id="revenue-filter-customer"
                  className={`w-full !h-9 ${
                    !filters.customer ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger
                  id="revenue-filter-category"
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

            {/* Actions (aligned with input row on md+) */}
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
                title="Reset"
                onClick={handleReset}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Revenue Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <CardTitle>Revenue List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Date</TableHead>
                  <TableHead className="px-6">Amount</TableHead>
                  <TableHead className="px-6">Account</TableHead>
                  <TableHead className="px-6">Customer</TableHead>
                  <TableHead className="px-6">Category</TableHead>
                  <TableHead className="px-6">Reference</TableHead>
                  <TableHead className="px-6">Description</TableHead>
                  <TableHead className="px-6">Payment Receipt</TableHead>
                  <TableHead className="px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((revenue) => (
                    <TableRow key={revenue.id}>
                      <TableCell className="px-6">
                        {formatDate(revenue.date)}
                      </TableCell>
                      <TableCell className="px-6 font-medium">
                        {formatPrice(revenue.amount)}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.account}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.customer || '-'}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.category || '-'}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.reference || '-'}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.description || '-'}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.paymentReceipt ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                              title="Download"
                              onClick={() => {
                                // Handle download
                                console.log('Download:', revenue.paymentReceipt)
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                              title="Preview"
                              onClick={() => {
                                // Handle preview
                                console.log('Preview:', revenue.paymentReceipt)
                              }}
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
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => handleEdit(revenue)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(revenue)}
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
                      No revenue found
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
            <AlertDialogTitle>Delete Revenue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this revenue? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRevenueToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

