'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import Link from "next/link"
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  Download,
  Eye,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react"

// Mock invoice data
const mockInvoices = [
  {
    id: "INV-2025-001",
    issueDate: "2025-12-01",
    dueDate: "2025-12-31",
    dueAmount: 12500000,
    status: 0, // Draft
  },
  {
    id: "INV-2025-002",
    issueDate: "2025-12-03",
    dueDate: "2025-12-20",
    dueAmount: 9800000,
    status: 1, // Sent
  },
  {
    id: "INV-2025-003",
    issueDate: "2025-12-05",
    dueDate: "2025-12-15",
    dueAmount: 15000000,
    status: 2, // Unpaid
  },
  {
    id: "INV-2025-004",
    issueDate: "2025-12-07",
    dueDate: "2025-12-10",
    dueAmount: 7500000,
    status: 3, // Partial
  },
  {
    id: "INV-2025-005",
    issueDate: "2025-12-10",
    dueDate: "2025-12-25",
    dueAmount: 20000000,
    status: 4, // Paid
  },
]

const statusMap: {
  [key: number]: { label: string; color: string }
} = {
  0: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  1: { label: "Sent", color: "bg-yellow-100 text-yellow-700" },
  2: { label: "Unpaid", color: "bg-red-100 text-red-700" },
  3: { label: "Partial", color: "bg-cyan-100 text-cyan-700" },
  4: { label: "Paid", color: "bg-blue-100 text-blue-700" },
}

const mockCustomers = [
  { id: 1, name: 'PT Teknologi Digital Indonesia' },
  { id: 2, name: 'CV Mitra Sejahtera' },
  { id: 3, name: 'PT Maju Jaya' },
]

const mockCategories = [
  { id: 1, name: 'Income' },
  { id: 2, name: 'Expense' },
]

const mockProducts = [
  { id: 1, name: 'Product A', price: 100000, unit: 'pcs' },
  { id: 2, name: 'Product B', price: 200000, unit: 'pcs' },
  { id: 3, name: 'Service A', price: 500000, unit: 'hour' },
  { id: 4, name: 'Service B', price: 750000, unit: 'hour' },
]

const mockTaxes = [
  { id: 1, name: 'VAT', rate: 11 },
  { id: 2, name: 'PPN', rate: 10 },
]

export function InvoiceTab() {
  const [invoices, setInvoices] = useState(mockInvoices)
  const [filteredInvoices, setFilteredInvoices] = useState(mockInvoices)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dateFilter, setDateFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    customer: '',
    category: '',
    issueDate: '',
    dueDate: '',
    refNumber: '',
    description: '',
  })
  const [invoiceNumber] = useState(`INV-2025-${String(mockInvoices.length + 1).padStart(3, '0')}`)
  const [items, setItems] = useState<Array<{
    id: string
    item: string
    quantity: string
    price: string
    discount: string
    tax: string
    taxRate: string
    description: string
    amount: number
  }>>([])

  // Calculate item amount
  const calculateItemAmount = (item: typeof items[0]) => {
    const quantity = parseFloat(item.quantity) || 0
    const price = parseFloat(item.price) || 0
    const discount = parseFloat(item.discount) || 0
    const taxRate = parseFloat(item.taxRate) || 0
    
    const subtotal = (quantity * price) - discount
    const taxAmount = (taxRate / 100) * subtotal
    return subtotal + taxAmount
  }

  // Calculate totals
  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const price = parseFloat(item.price) || 0
      return sum + (quantity * price)
    }, 0)
    
    const totalDiscount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.discount) || 0)
    }, 0)
    
    const totalTax = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const price = parseFloat(item.price) || 0
      const discount = parseFloat(item.discount) || 0
      const taxRate = parseFloat(item.taxRate) || 0
      const subtotal = (quantity * price) - discount
      return sum + ((taxRate / 100) * subtotal)
    }, 0)
    
    const totalAmount = subTotal - totalDiscount + totalTax
    
    return { subTotal, totalDiscount, totalTax, totalAmount }
  }

  const addItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      item: '',
      quantity: '1',
      price: '0',
      discount: '0',
      tax: '',
      taxRate: '0',
      description: '',
      amount: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'item' && value) {
          const product = mockProducts.find(p => p.id.toString() === value)
          if (product) {
            updated.price = product.price.toString()
          }
        }
        if (['quantity', 'price', 'discount', 'taxRate'].includes(field)) {
          updated.amount = calculateItemAmount(updated)
        } else if (field === 'tax') {
          const tax = mockTaxes.find(t => t.id.toString() === value)
          updated.taxRate = tax?.rate.toString() || '0'
          updated.amount = calculateItemAmount({ ...updated, taxRate: updated.taxRate })
        }
        return updated
      }
      return item
    }))
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newId = `INV-2025-${String(invoices.length + 1).padStart(3, '0')}`
    const { totalAmount } = calculateTotals()
    const newInvoice = {
      id: newId,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      dueAmount: totalAmount,
      status: 0,
    }
    setInvoices([...invoices, newInvoice])
    setCreateDialogOpen(false)
    setFormData({
      customer: '',
      category: '',
      issueDate: '',
      dueDate: '',
      refNumber: '',
      description: '',
    })
    setItems([])
  }

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setFormData({
        customer: '',
        category: '',
        issueDate: '',
        dueDate: '',
        refNumber: '',
        description: '',
      })
      setItems([])
    }
  }

  // Filter invoices
  useEffect(() => {
    let filtered = [...invoices]
    
    if (dateFilter) {
      filtered = filtered.filter(i => i.issueDate === dateFilter)
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === parseInt(statusFilter))
    }
    
    setFilteredInvoices(filtered)
    setCurrentPage(1)
  }, [dateFilter, statusFilter, invoices])

  // Paginated invoices
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalRecords = filteredInvoices.length

  const handleReset = () => {
    setDateFilter('')
    setCustomerFilter('all')
    setStatusFilter('all')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" className="shadow-none h-7" title="Export">
          <Download className="h-3 w-3" />
        </Button>
        <Dialog open={createDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7" title="Create">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto" style={{ width: '95vw', maxWidth: '95vw' }}>
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>
                Create a new invoice. Fill in the required information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">
                      Customer <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.customer}
                      onValueChange={(value) => setFormData({ ...formData, customer: value })}
                      required
                    >
                      <SelectTrigger id="customer">
                        <SelectValue placeholder="Select Customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCustomers.map((customer) => (
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issueDate">
                        Issue Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="issueDate"
                        type="date"
                        value={formData.issueDate}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">
                        Due Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input
                        id="invoiceNumber"
                        type="text"
                        value={invoiceNumber}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCategories.map((category) => (
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
                      <Label htmlFor="refNumber">Ref Number</Label>
                      <Input
                        id="refNumber"
                        type="text"
                        value={formData.refNumber}
                        onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })}
                        placeholder="Enter Ref Number"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </div>

              {/* Product & Services Section */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-lg font-semibold">Product & Services</h5>
                  <Button type="button" variant="blue" size="sm" className="shadow-none" onClick={addItem}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add item
                  </Button>
                </div>

                {items.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-4 py-3 min-w-[200px]">Items <span className="text-red-500">*</span></TableHead>
                            <TableHead className="px-4 py-3 min-w-[120px]">Quantity <span className="text-red-500">*</span></TableHead>
                            <TableHead className="px-4 py-3 min-w-[150px]">Price <span className="text-red-500">*</span></TableHead>
                            <TableHead className="px-4 py-3 min-w-[130px]">Discount</TableHead>
                            <TableHead className="px-4 py-3 min-w-[150px]">Tax (%)</TableHead>
                            <TableHead className="px-4 py-3 text-right min-w-[150px]">Amount <br /><small className="text-xs text-muted-foreground">after tax & discount</small></TableHead>
                            <TableHead className="px-4 py-3 min-w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <React.Fragment key={item.id}>
                              <TableRow>
                                <TableCell className="px-4 py-3">
                                  <Select
                                    value={item.item}
                                    onValueChange={(value) => updateItem(item.id, 'item', value)}
                                    required
                                  >
                                    <SelectTrigger className="min-w-[180px]">
                                      <SelectValue placeholder="Select Item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockProducts.map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                          {product.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                      className="w-24"
                                      placeholder="Qty"
                                      required
                                      min="0"
                                      step="0.01"
                                    />
                                    {item.item && (
                                      <span className="text-xs text-muted-foreground">
                                        {mockProducts.find(p => p.id.toString() === item.item)?.unit || ''}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={item.price}
                                      onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                      className="w-32"
                                      placeholder="Price"
                                      required
                                      min="0"
                                      step="0.01"
                                    />
                                    <span className="text-xs text-muted-foreground">Rp</span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={item.discount}
                                      onChange={(e) => updateItem(item.id, 'discount', e.target.value)}
                                      className="w-28"
                                      placeholder="Discount"
                                      min="0"
                                      step="0.01"
                                    />
                                    <span className="text-xs text-muted-foreground">Rp</span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <Select
                                    value={item.tax || "none"}
                                    onValueChange={(value) => {
                                      if (value === "none") {
                                        updateItem(item.id, 'tax', '')
                                        updateItem(item.id, 'taxRate', '0')
                                      } else {
                                        const tax = mockTaxes.find(t => t.id.toString() === value)
                                        updateItem(item.id, 'tax', value)
                                        updateItem(item.id, 'taxRate', tax?.rate.toString() || '0')
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-40">
                                      <SelectValue placeholder="Select Tax" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">No Tax</SelectItem>
                                      {mockTaxes.map((tax) => (
                                        <SelectItem key={tax.id} value={tax.id.toString()}>
                                          {tax.name} ({tax.rate}%)
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right font-medium">
                                  Rp {item.amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                    onClick={() => removeItem(item.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={2} className="px-4 py-3">
                                  <Textarea
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                    placeholder="Description"
                                    rows={1}
                                    className="min-h-[60px]"
                                  />
                                </TableCell>
                                <TableCell colSpan={5}></TableCell>
                              </TableRow>
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    No items added. Click "Add item" to add products or services.
                  </div>
                )}

                {/* Totals Section */}
                {items.length > 0 && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">Sub Total (Rp)</span>
                          <span className="font-semibold">
                            Rp {calculateTotals().subTotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Discount (Rp)</span>
                          <span className="font-semibold">
                            Rp {calculateTotals().totalDiscount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Tax (Rp)</span>
                          <span className="font-semibold">
                            Rp {calculateTotals().totalTax.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between border-t-2 pt-2">
                          <span className="font-semibold text-blue-600">Total Amount (Rp)</span>
                          <span className="font-semibold text-blue-600">
                            Rp {calculateTotals().totalAmount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" className="shadow-none" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="blue" type="submit" className="shadow-none">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardContent className="px-4 py-3">
          <form 
            className="flex flex-col gap-4 md:flex-row md:items-end"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className="w-full md:w-64">
              <label className="mb-1 block text-sm font-medium">Issue Date</label>
              <Input 
                type="date" 
                name="issue_date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="w-full md:w-56">
              <label className="mb-1 block text-sm font-medium">Customer</label>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Customer</SelectItem>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-56">
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Status</SelectItem>
                  {Object.entries(statusMap).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="outline" size="sm" className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Apply">
                <Search className="h-3 w-3" />
              </Button>
              <Button type="button" variant="outline" size="sm" className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100" title="Reset" onClick={handleReset}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Invoice list table */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">Invoice</TableHead>
                  <TableHead className="px-4 py-3">Issue Date</TableHead>
                  <TableHead className="px-4 py-3">Due Date</TableHead>
                  <TableHead className="px-4 py-3">Due Amount</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                  <TableHead className="px-4 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="px-4 py-3">
                        <Button asChild variant="outline" size="sm" className="shadow-none">
                          <Link href={`/accounting/invoice/${invoice.id}`}>{invoice.id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell className="px-4 py-3">{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={isOverdue(invoice.dueDate) ? "text-red-500" : ""}>
                          {formatDate(invoice.dueDate)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        Rp {invoice.dueAmount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={statusMap[invoice.status].color}>
                          {statusMap[invoice.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-start">
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100" title="View" asChild>
                            <Link href={`/accounting/invoice/${invoice.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                          {(invoice.status !== 3 && invoice.status !== 4) && (
                            <Button variant="outline" size="sm" className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100" title="Edit" asChild>
                              <Link href={`/accounting/invoice/${invoice.id}/edit`}>
                                <Pencil className="h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100" title="Delete">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No invoices found
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

