'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Calendar,
  Download,
  Eye,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Copy,
  ArrowLeftRight
} from "lucide-react"

// Mock proposal data
const mockProposals = [
  {
    id: "PR-2025-001",
    customer: "PT Teknologi Digital Indonesia",
    category: "Income",
    issueDate: "2025-12-01",
    status: 0, // Draft
    total: 12500000,
  },
  {
    id: "PR-2025-002",
    customer: "CV Mitra Sejahtera",
    category: "Income",
    issueDate: "2025-12-03",
    status: 2, // Accepted
    total: 9800000,
  },
  {
    id: "PR-2025-003",
    customer: "PT Maju Jaya",
    category: "Income",
    issueDate: "2025-12-05",
    status: 1, // Sent
    total: 15000000,
  },
  {
    id: "PR-2025-004",
    customer: "CV Sejahtera Abadi",
    category: "Income",
    issueDate: "2025-12-07",
    status: 3, // Declined
    total: 7500000,
  },
  {
    id: "PR-2025-005",
    customer: "PT Global Teknologi",
    category: "Income",
    issueDate: "2025-12-10",
    status: 4, // Expired
    total: 20000000,
  },
  {
    id: "PR-2025-006",
    customer: "PT Nusantara Sejahtera",
    category: "Income",
    issueDate: "2025-12-12",
    status: 0, // Draft
    total: 11000000,
  },
  {
    id: "PR-2025-007",
    customer: "CV Mandiri Jaya",
    category: "Income",
    issueDate: "2025-12-15",
    status: 2, // Accepted
    total: 13500000,
  },
  {
    id: "PR-2025-008",
    customer: "PT Indah Sejahtera",
    category: "Income",
    issueDate: "2025-12-18",
    status: 1, // Sent
    total: 16500000,
  },
  {
    id: "PR-2025-009",
    customer: "CV Makmur Abadi",
    category: "Income",
    issueDate: "2025-12-20",
    status: 0, // Draft
    total: 9500000,
  },
  {
    id: "PR-2025-010",
    customer: "PT Bersama Jaya",
    category: "Income",
    issueDate: "2025-12-22",
    status: 2, // Accepted
    total: 18000000,
  },
  {
    id: "PR-2025-011",
    customer: "CV Sukses Mandiri",
    category: "Income",
    issueDate: "2025-12-25",
    status: 1, // Sent
    total: 12000000,
  },
  {
    id: "PR-2025-012",
    customer: "PT Harmoni Sejahtera",
    category: "Income",
    issueDate: "2025-12-28",
    status: 3, // Declined
    total: 14000000,
  },
]

const statusMap: {
  [key: number]: { label: string }
} = {
  0: { label: "Draft" },
  1: { label: "Sent" },
  2: { label: "Accepted" },
  3: { label: "Declined" },
  4: { label: "Expired" },
}

function getProposalStatusClasses(status: number) {
  switch (status) {
    case 0: return "bg-blue-100 text-blue-700 border-none"
    case 1: return "bg-cyan-100 text-cyan-700 border-none"
    case 2: return "bg-green-100 text-green-700 border-none"
    case 3: return "bg-yellow-100 text-yellow-700 border-none"
    case 4: return "bg-red-100 text-red-700 border-none"
    default: return "bg-gray-100 text-gray-700 border-none"
  }
}

export function EstimateTab() {
  type ProposalItem = {
    id: string
    item: string
    quantity: string
    price: string
    discount: string
    tax: string
    taxRate: string
    description: string
    amount: number
  }

  type ProposalRow = (typeof mockProposals)[number] & {
    customerId: string
    categoryId: string
    description: string
    items: ProposalItem[]
  }

  const [proposals, setProposals] = useState<ProposalRow[]>(() =>
    mockProposals.map((p) => ({
      ...p,
      customerId: '',
      categoryId: '',
      description: '',
      items: [],
    })),
  )
  const [filteredProposals, setFilteredProposals] = useState<ProposalRow[]>(() =>
    mockProposals.map((p) => ({
      ...p,
      customerId: '',
      categoryId: '',
      description: '',
      items: [],
    })),
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [proposalToDelete, setProposalToDelete] = useState<ProposalRow | null>(null)
  const [formData, setFormData] = useState({
    customer: '',
    category: '',
    issueDate: '',
    description: '',
  })
  const [items, setItems] = useState<ProposalItem[]>([])

  // Mock customers and categories
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

  const handleEdit = (proposal: ProposalRow) => {
    const customerId =
      proposal.customerId ||
      (mockCustomers.find((c) => c.name === proposal.customer)?.id.toString() ?? '')
    const categoryId =
      proposal.categoryId ||
      (mockCategories.find((c) => c.name === proposal.category)?.id.toString() ?? '')

    setEditingId(proposal.id)
    setFormData({
      customer: customerId,
      category: categoryId,
      issueDate: proposal.issueDate,
      description: proposal.description || '',
    })
    setItems(proposal.items || [])
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (proposal: ProposalRow) => {
    setProposalToDelete(proposal)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!proposalToDelete) return
    setProposals((prev) => prev.filter((p) => p.id !== proposalToDelete.id))
    setProposalToDelete(null)
    setDeleteDialogOpen(false)
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
        // Auto-fill price when item is selected
        if (field === 'item' && value) {
          const product = mockProducts.find(p => p.id.toString() === value)
          if (product) {
            updated.price = product.price.toString()
          }
        }
        // Recalculate amount when quantity, price, discount, or tax changes
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
    const { totalAmount } = calculateTotals()

    if (editingId) {
      setProposals((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                customerId: formData.customer,
                categoryId: formData.category,
                customer: mockCustomers.find((c) => c.id.toString() === formData.customer)?.name || p.customer,
                category: mockCategories.find((c) => c.id.toString() === formData.category)?.name || p.category,
                issueDate: formData.issueDate,
                description: formData.description,
                items,
                total: totalAmount,
              }
            : p,
        ),
      )
    } else {
      // Generate new proposal ID
      const newId = `PR-2025-${String(proposals.length + 1).padStart(3, '0')}`
      const newProposal: ProposalRow = {
        id: newId,
        customerId: formData.customer,
        categoryId: formData.category,
        customer: mockCustomers.find((c) => c.id.toString() === formData.customer)?.name || '',
        category: mockCategories.find((c) => c.id.toString() === formData.category)?.name || '',
        issueDate: formData.issueDate,
        status: 0, // Draft
        total: totalAmount,
        description: formData.description,
        items,
      }
      setProposals((prev) => [...prev, newProposal])
    }
    setCreateDialogOpen(false)
    setEditingId(null)
    setFormData({
      customer: '',
      category: '',
      issueDate: '',
      description: '',
    })
    setItems([])
  }

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        customer: '',
        category: '',
        issueDate: '',
        description: '',
      })
      setItems([])
    }
  }

  // Filter proposals
  useEffect(() => {
    let filtered = [...proposals]
    
    if (dateFilter) {
      filtered = filtered.filter(p => p.issueDate === dateFilter)
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === parseInt(statusFilter))
    }
    
    setFilteredProposals(filtered)
    setCurrentPage(1)
  }, [dateFilter, statusFilter, proposals])

  // Paginated proposals
  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalRecords = filteredProposals.length

  const handleReset = () => {
    setDateFilter('')
    setStatusFilter('all')
  }

  return (
    <div className="space-y-4 w-full">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Estimate</CardTitle>
            <CardDescription>Create and manage estimates for customers.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
            title="Export"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Estimate
          </Button>
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
                Create Estimate
              </Button>
            </DialogTrigger>
          <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto" style={{ width: '95vw', maxWidth: '95vw' }}>
            <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Proposal' : 'Create Proposal'}</DialogTitle>
              <DialogDescription>
                  {editingId ? 'Update proposal information.' : 'Create a new proposal. Fill in the required information.'}
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
                </div>
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
                          {items.map((item, index) => (
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
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardContent className="py-4">
          <form 
            className="flex flex-col gap-4 md:flex-row md:items-end"
            onSubmit={(e) => {
              e.preventDefault()
              // Filter is handled by useEffect
            }}
          >
            <div className="w-full md:w-56">
              <label className="mb-1 block text-sm font-medium">Date</label>
              <Input 
                type="date" 
                name="issue_date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="w-full md:w-56">
                <label className="mb-1 block text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full">
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

      {/* Proposal list table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="pl-8 pr-6">
          <CardTitle>Estimate List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProposals.length > 0 ? (
                  paginatedProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        <Button asChild variant="outline" size="sm" className="shadow-none">
                          <Link href={`/accounting/proposal/${proposal.id}`}>{proposal.id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell>{proposal.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          <span>{proposal.issueDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getProposalStatusClasses(proposal.status)}>
                          {statusMap[proposal.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-start">
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100" title="Convert Invoice">
                            <ArrowLeftRight className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Duplicate">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100" title="View" asChild>
                            <Link href={`/accounting/proposal/${proposal.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                            title="Edit"
                            onClick={() => handleEdit(proposal)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(proposal)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No proposals found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <div className="mt-4 pb-4">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this estimate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProposalToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

