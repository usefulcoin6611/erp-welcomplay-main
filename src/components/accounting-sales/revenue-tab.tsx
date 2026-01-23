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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  }

  const handleReset = () => {
    setFilters({
      date: '',
      account: '',
      customer: '',
      category: '',
    })
  }

  // Filter data based on filters
  const filteredData = revenueData.filter((revenue) => {
    if (filters.account) {
      const accountName = accounts.find(a => a.id === filters.account)?.name
      if (accountName && revenue.account !== accountName) return false
    }
    if (filters.customer) {
      const customerName = customers.find(c => c.id === filters.customer)?.name
      if (customerName && revenue.customer !== customerName) return false
    }
    if (filters.category) {
      const categoryName = categories.find(c => c.id === filters.category)?.name
      if (categoryName && revenue.category !== categoryName) return false
    }
    if (filters.date) {
      // Simple date filter - can be enhanced with date range
      const filterDate = new Date(filters.date).toISOString().split('T')[0]
      if (revenue.date !== filterDate) return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7" title="Create Revenue">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Revenue</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <div className="grid gap-4 py-4">
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
                    <Input id="create-amount" type="number" step="0.01" placeholder="Enter Amount" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                      Create account here. <span className="font-medium text-primary cursor-pointer">Create account</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-customer">
                      Customer <span className="text-red-500">*</span>
                    </Label>
                    <Select required>
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
                  <Textarea id="create-description" placeholder="Enter Description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                      Create category here. <span className="font-medium text-primary cursor-pointer">Create category</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-reference">Reference</Label>
                    <Input id="create-reference" placeholder="Enter Reference" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-receipt">Payment Receipt</Label>
                  <Input id="create-receipt" type="file" accept=".pdf,.jpg,.jpeg,.png" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="shadow-none">
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

      {/* Filters */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); handleApply(); }}>
            <div className="flex items-end gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    placeholder="Select Date"
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
                  <Label htmlFor="customer">Customer</Label>
                  <Select
                    value={filters.customer}
                    onValueChange={(value) => handleFilterChange('customer', value)}
                  >
                    <SelectTrigger id="customer">
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
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                  title="Apply"
                >
                  <Search className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                  title="Reset"
                  onClick={handleReset}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Revenue Table */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">Date</TableHead>
                  <TableHead className="px-4 py-3">Amount</TableHead>
                  <TableHead className="px-4 py-3">Account</TableHead>
                  <TableHead className="px-4 py-3">Customer</TableHead>
                  <TableHead className="px-4 py-3">Category</TableHead>
                  <TableHead className="px-4 py-3">Reference</TableHead>
                  <TableHead className="px-4 py-3">Description</TableHead>
                  <TableHead className="px-4 py-3">Payment Receipt</TableHead>
                  <TableHead className="px-4 py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((revenue) => (
                    <TableRow key={revenue.id}>
                      <TableCell className="px-4 py-3">
                        {formatDate(revenue.date)}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium">
                        {formatPrice(revenue.amount)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {revenue.account}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {revenue.customer || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {revenue.category || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {revenue.reference || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {revenue.description || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
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
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => {
                              // Handle edit
                              console.log('Edit revenue:', revenue.id)
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => {
                              if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
                                console.log('Delete revenue:', revenue.id)
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
                      No revenue found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

