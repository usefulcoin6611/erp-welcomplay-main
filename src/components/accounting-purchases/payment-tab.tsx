'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  IconCalendar,
  IconSearch,
  IconPlus,
  IconRefresh,
  IconDownload,
  IconEye,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react'

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

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7">
              <IconPlus className="h-3 w-3 mr-2" />
              Create Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Payment</DialogTitle>
              <DialogDescription>
                Record a new payment transaction.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
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
                  <Input id="create-amount" type="number" step="0.01" placeholder="0.00" required />
                </div>
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
              </div>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-reference">Reference</Label>
                <Input id="create-reference" placeholder="Enter reference" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea id="create-description" placeholder="Enter description" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-receipt">Payment Receipt</Label>
                <Input id="create-receipt" type="file" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="shadow-none">Cancel</Button>
              <Button variant="blue" className="shadow-none">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter payments by date, account, vendor, and category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleApply(); }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Select
                  value={filters.account}
                  onValueChange={(value) => handleFilterChange('account', value)}
                >
                  <SelectTrigger id="account">
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
                  <SelectTrigger id="vendor">
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
                  <SelectTrigger id="category">
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
            <div className="flex items-center gap-2 mt-4">
              <Button
                type="submit"
                variant="blue"
                size="sm"
                className="shadow-none h-7"
              >
                <IconSearch className="h-3 w-3 mr-2" />
                Apply
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="shadow-none h-7"
                onClick={handleReset}
              >
                <IconRefresh className="h-3 w-3 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment List</CardTitle>
          <CardDescription>
            Overview of vendor payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment Receipt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {formatDate(payment.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(payment.amount)}
                      </TableCell>
                      <TableCell>{payment.account}</TableCell>
                      <TableCell>{payment.vendor}</TableCell>
                      <TableCell>{payment.category}</TableCell>
                      <TableCell>{payment.reference || '-'}</TableCell>
                      <TableCell>{payment.description || '-'}</TableCell>
                      <TableCell>
                        {payment.paymentReceipt ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="shadow-none h-7 bg-blue-500 hover:bg-blue-600 text-white"
                              title="Download"
                              onClick={() => console.log('Download:', payment.paymentReceipt)}
                            >
                              <IconDownload className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="shadow-none h-7 bg-gray-500 hover:bg-gray-600 text-white"
                              title="Preview"
                              onClick={() => console.log('Preview:', payment.paymentReceipt)}
                            >
                              <IconEye className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                            title="Edit"
                            onClick={() => console.log('Edit payment:', payment.id)}
                          >
                            <IconEdit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="shadow-none h-7"
                            title="Delete"
                            onClick={() => {
                              if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
                                console.log('Delete payment:', payment.id)
                              }
                            }}
                          >
                            <IconTrash className="h-3 w-3" />
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
          <div className="mt-4">
            <SimplePagination
              totalCount={totalRecords}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
