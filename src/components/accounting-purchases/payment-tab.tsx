'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return payments.filter((payment) => {
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
  }, [filters])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.date, filters.account, filters.vendor, filters.category])

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7" title="Create">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Payment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-vendor">
                    Vendor <span className="text-red-500">*</span>
                  </Label>
                  <Select required>
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
                  <Input id="create-date" type="date" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input id="create-amount" type="number" step="0.01" placeholder="Enter Amount" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select required>
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
                  <Select required>
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
                  <Input id="create-reference" placeholder="Enter Reference" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-receipt">Payment Receipt</Label>
                  <Input id="create-receipt" type="file" accept=".pdf,.jpg,.jpeg,.png" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea id="create-description" placeholder="Enter Description" rows={3} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" className="shadow-none" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="blue" className="shadow-none">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <form onSubmit={(e) => { e.preventDefault(); handleApply(); }} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Select
                  value={filters.account}
                  onValueChange={(value) => handleFilterChange('account', value)}
                >
                  <SelectTrigger id="account" className="h-9">
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
                <Label htmlFor="vendor">Vendor</Label>
                <Select
                  value={filters.vendor}
                  onValueChange={(value) => handleFilterChange('vendor', value)}
                >
                  <SelectTrigger id="vendor" className="h-9">
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
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger id="category" className="h-9">
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
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="shadow-none h-9 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                title="Apply"
              >
                <Search className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shadow-none h-9 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
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
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">Date</TableHead>
                  <TableHead className="px-4 py-3">Amount</TableHead>
                  <TableHead className="px-4 py-3">Account</TableHead>
                  <TableHead className="px-4 py-3">Vendor</TableHead>
                  <TableHead className="px-4 py-3">Category</TableHead>
                  <TableHead className="px-4 py-3">Reference</TableHead>
                  <TableHead className="px-4 py-3">Description</TableHead>
                  <TableHead className="px-4 py-3">Payment Receipt</TableHead>
                  <TableHead className="px-4 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="px-4 py-3">
                        {formatDate(payment.date)}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium">
                        {formatPrice(payment.amount)}
                      </TableCell>
                      <TableCell className="px-4 py-3">{payment.account}</TableCell>
                      <TableCell className="px-4 py-3">{payment.vendor}</TableCell>
                      <TableCell className="px-4 py-3">{payment.category}</TableCell>
                      <TableCell className="px-4 py-3">{payment.reference || '-'}</TableCell>
                      <TableCell className="px-4 py-3">{payment.description || '-'}</TableCell>
                      <TableCell className="px-4 py-3">
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
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            size="sm"
                            variant="outline"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => console.log('Edit payment:', payment.id)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => {
                              if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
                                console.log('Delete payment:', payment.id)
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
          <div className="mt-4 px-4 pb-4">
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
    </div>
  )
}

