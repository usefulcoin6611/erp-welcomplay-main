'use client'

// Sentinel value for "no selection" in Select components
const NO_SELECTION = '__none__'

function toSelectValue(val: string | null | undefined): string {
  return val && val !== '' ? val : NO_SELECTION
}

function fromSelectValue(val: string): string | null {
  return val === NO_SELECTION ? null : val
}

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Search, X, Eye, Pencil, Trash, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type QuotationStatus = 0 | 1 | 2 | 3 // 0=Draft, 1=Sent, 2=Accepted, 3=Declined

type QuotationItem = {
  id?: string
  productId: string
  itemName: string
  quantity: number
  price: number
  discount: number
  taxRate: number
  amount: number
}

type Quotation = {
  id: string
  estimateId: string
  customerId: string
  customerName: string
  category: string
  categoryId: string
  issueDate: string
  status: QuotationStatus
  total: number
  description: string
  items?: QuotationItem[]
}

type Customer = { id: string; name: string; customerCode: string }
type Category = { id: string; name: string }
type Product = { id: string; name: string; salePrice: number; taxRate: number }

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: QuotationStatus; label: string; color: string }[] = [
  { value: 0, label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  { value: 1, label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  { value: 2, label: 'Accepted', color: 'bg-green-100 text-green-700' },
  { value: 3, label: 'Declined', color: 'bg-red-100 text-red-700' },
]

const EMPTY_ITEM: Omit<QuotationItem, 'id'> = {
  productId: NO_SELECTION,
  itemName: '',
  quantity: 1,
  price: 0,
  discount: 0,
  taxRate: 0,
  amount: 0,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function calcItemAmount(item: Omit<QuotationItem, 'id' | 'amount'>): number {
  const base = item.quantity * item.price
  const afterDiscount = base - item.discount
  const afterTax = afterDiscount * (1 + item.taxRate / 100)
  return Math.round(afterTax * 100) / 100
}

function calcTotal(items: Omit<QuotationItem, 'id'>[]): number {
  return items.reduce((sum, it) => sum + calcItemAmount(it), 0)
}

function getStatusConfig(status: number) {
  return STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0]
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function POSQuotationPage() {
  // List state
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  // Reference data
  const [customers, setCustomers] = useState<Customer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Form state
  const [openForm, setOpenForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null) // estimateId
  const [submitting, setSubmitting] = useState(false)
  const [formCustomerId, setFormCustomerId] = useState(NO_SELECTION)
  const [formCategoryId, setFormCategoryId] = useState(NO_SELECTION)
  const [formIssueDate, setFormIssueDate] = useState('')
  const [formStatus, setFormStatus] = useState<QuotationStatus>(0)
  const [formDescription, setFormDescription] = useState('')
  const [formItems, setFormItems] = useState<Omit<QuotationItem, 'id'>[]>([{ ...EMPTY_ITEM }])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // View state
  const [viewDetail, setViewDetail] = useState<Quotation | null>(null)
  const [openView, setOpenView] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchQuotations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/estimates')
      const data = await res.json()
      if (data.success) {
        // Map API response fields to Quotation type
        // API returns: { id (=estimateId), customer (=name), customerCode, category, categoryId, issueDate, status, total, description, items }
        const mapped: Quotation[] = (data.data ?? []).map((e: any) => ({
          id: e.id,
          estimateId: e.id,           // API returns estimateId as 'id'
          customerId: e.customerId ?? '',
          customerName: e.customer ?? '—',  // API returns customer name as 'customer'
          category: e.category ?? '',
          categoryId: e.categoryId ?? '',
          issueDate: e.issueDate ?? '',
          status: e.status as QuotationStatus,
          total: Number(e.total) || 0,
          description: e.description ?? '',
          items: e.items,
        }))
        setQuotations(mapped)
      } else {
        toast.error(data.message ?? 'Failed to load quotations')
      }
    } catch {
      toast.error('Failed to load quotations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuotations()
    fetch('/api/customers').then(r => r.json()).then(res => {
      if (res.success) setCustomers(res.data.map((c: any) => ({ id: c.id, name: c.name, customerCode: c.customerCode })))
    }).catch(() => {})
    fetch('/api/categories').then(r => r.json()).then(res => {
      if (res.success) setCategories(res.data.map((c: any) => ({ id: c.id, name: c.name })))
    }).catch(() => {})
    fetch('/api/products').then(r => r.json()).then(res => {
      if (res.success) setProducts(res.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        salePrice: p.salePrice ?? 0,
        taxRate: p.taxRate ?? 0,
      })))
    }).catch(() => {})
  }, [fetchQuotations])

  // ─── Filtering & Pagination ─────────────────────────────────────────────────

  const filteredData = useMemo(() => {
    if (!search.trim()) return quotations
    const q = search.trim().toLowerCase()
    return quotations.filter(
      (r) =>
        r.estimateId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    )
  }, [search, quotations])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  // ─── Form Helpers ───────────────────────────────────────────────────────────

  const resetForm = () => {
    setEditingId(null)
    setFormCustomerId(NO_SELECTION)
    setFormCategoryId(NO_SELECTION)
    setFormIssueDate(new Date().toISOString().slice(0, 10))
    setFormStatus(0)
    setFormDescription('')
    setFormItems([{ ...EMPTY_ITEM }])
    setFormErrors({})
  }

  const openCreateForm = () => {
    resetForm()
    setOpenForm(true)
  }

  const openEditForm = async (estimateId: string) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/estimates/${estimateId}`)
      const data = await res.json()
      if (!data.success) {
        toast.error(data.message ?? 'Failed to load quotation details')
        return
      }
      const est = data.data
      setEditingId(est.estimateId)
      setFormCustomerId(toSelectValue(est.customerId))
      setFormCategoryId(toSelectValue(est.categoryId))
      setFormIssueDate(est.issueDate?.slice(0, 10) ?? '')
      setFormStatus(est.status as QuotationStatus)
      setFormDescription(est.description ?? '')
      setFormItems(
        est.items?.length > 0
          ? est.items.map((it: any) => ({
              productId: NO_SELECTION, // items don't have productId in estimate
              itemName: it.itemName ?? '',
              quantity: Number(it.quantity) || 1,
              price: Number(it.price) || 0,
              discount: Number(it.discount) || 0,
              taxRate: Number(it.taxRate) || 0,
              amount: Number(it.amount) || 0,
            }))
          : [{ ...EMPTY_ITEM }]
      )
      setFormErrors({})
      setOpenForm(true)
    } catch {
      toast.error('Failed to load quotation details')
    } finally {
      setLoadingDetail(false)
    }
  }

  // ─── Item Management ────────────────────────────────────────────────────────

  const updateItem = (idx: number, field: keyof Omit<QuotationItem, 'id'>, value: string | number) => {
    setFormItems(prev => {
      const updated = [...prev]
      const item = { ...updated[idx], [field]: value }
      if (field === 'productId' && value !== NO_SELECTION) {
        const product = products.find(p => p.id === value)
        if (product) {
          item.itemName = product.name
          item.price = product.salePrice
          item.taxRate = product.taxRate
        }
      } else if (field === 'productId' && value === NO_SELECTION) {
        item.itemName = ''
        item.price = 0
        item.taxRate = 0
      }
      item.amount = calcItemAmount(item)
      updated[idx] = item
      return updated
    })
  }

  const addItem = () => setFormItems(prev => [...prev, { ...EMPTY_ITEM }])

  const removeItem = (idx: number) => {
    if (formItems.length === 1) {
      toast.warning('At least one item is required')
      return
    }
    setFormItems(prev => prev.filter((_, i) => i !== idx))
  }

  const formTotal = calcTotal(formItems)
  const formSubtotal = formItems.reduce((sum, it) => sum + it.quantity * it.price, 0)
  const formTotalDiscount = formItems.reduce((sum, it) => sum + it.discount, 0)
  const formTotalTax = formTotal - (formSubtotal - formTotalDiscount)

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!fromSelectValue(formCustomerId)) errors.customer = 'Customer is required'
    if (!formIssueDate) errors.issueDate = 'Issue date is required'
    if (formItems.some(it => !it.itemName.trim())) {
      errors.items = 'All items must have a name'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ─── CRUD Operations ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setSubmitting(true)
    try {
      const body = {
        customerId: fromSelectValue(formCustomerId),
        categoryId: fromSelectValue(formCategoryId),
        issueDate: formIssueDate,
        status: formStatus,
        description: formDescription || '',
        total: formTotal,
        items: formItems.map(it => ({
          item: it.itemName,
          quantity: String(it.quantity),
          price: String(it.price),
          discount: String(it.discount),
          taxRate: String(it.taxRate),
          amount: it.amount,
          description: '',
        })),
      }

      const url = editingId ? `/api/estimates/${editingId}` : '/api/estimates'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(editingId ? '✅ Quotation updated successfully' : '✅ Quotation created successfully')
        setOpenForm(false)
        fetchQuotations()
      } else {
        toast.error(data.message ?? 'Failed to save quotation')
      }
    } catch {
      toast.error('Failed to save quotation')
    } finally {
      setSubmitting(false)
    }
  }

  const handleView = async (estimateId: string) => {
    setLoadingDetail(true)
    setOpenView(true)
    try {
      const res = await fetch(`/api/estimates/${estimateId}`)
      const data = await res.json()
      if (data.success) {
        const est = data.data
        setViewDetail({
          id: est.id,
          estimateId: est.estimateId,
          customerId: est.customerId,
          customerName: est.customer?.name ?? '—',
          category: '',
          categoryId: est.categoryId ?? '',
          issueDate: est.issueDate?.slice(0, 10) ?? '',
          status: est.status as QuotationStatus,
          total: Number(est.total) || 0,
          description: est.description ?? '',
          items: est.items?.map((it: any) => ({
            id: it.id,
            productId: NO_SELECTION,
            itemName: it.itemName,
            quantity: Number(it.quantity),
            price: Number(it.price),
            discount: Number(it.discount),
            taxRate: Number(it.taxRate),
            amount: Number(it.amount),
          })) ?? [],
        })
      } else {
        toast.error(data.message ?? 'Failed to load quotation details')
        setOpenView(false)
      }
    } catch {
      toast.error('Failed to load quotation details')
      setOpenView(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/estimates/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('🗑️ Quotation deleted successfully')
        setDeleteId(null)
        fetchQuotations()
      } else {
        toast.error(data.message ?? 'Failed to delete quotation')
      }
    } catch {
      toast.error('Failed to delete quotation')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (estimateId: string, newStatus: QuotationStatus) => {
    try {
      const res = await fetch(`/api/estimates/${estimateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Status updated to "${getStatusConfig(newStatus).label}"`)
        fetchQuotations()
        if (viewDetail) setViewDetail(prev => prev ? { ...prev, status: newStatus } : prev)
      } else {
        toast.error(data.message ?? 'Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <POSPageLayout
      title="Manage Quotation"
      breadcrumbLabel="Quotation"
      actionButton={
        <Button size="sm" variant="blue" className="shadow-none h-7" onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      }
    >
      {/* ─── Quotation List ─────────────────────────────────────────────────── */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-base font-medium">Quotation List</h5>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quotation..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
            />
            {search.length > 0 && (
              <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => setSearch('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 font-normal">Quotation ID</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Date</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Customer</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Category</TableHead>
                  <TableHead className="px-4 py-3 font-normal text-right">Total</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Status</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No quotation found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => {
                    const statusConfig = getStatusConfig(row.status)
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 shadow-none text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleView(row.estimateId)}
                          >
                            {row.estimateId}
                          </Button>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm">{formatDate(row.issueDate)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">{row.customerName}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-muted-foreground">{row.category || '—'}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-right font-medium">{formatPrice(row.total)}</TableCell>
                        <TableCell className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                              title="View"
                              onClick={() => handleView(row.estimateId)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                              title="Edit"
                              disabled={loadingDetail}
                              onClick={() => openEditForm(row.estimateId)}
                            >
                              {loadingDetail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                              title="Delete"
                              onClick={() => setDeleteId(row.estimateId)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {filteredData.length > 0 && (
            <div className="px-4 py-3 border-t">
              <SimplePagination
                totalCount={filteredData.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Create / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="!max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Quotation' : 'Create Quotation'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Customer + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quo-customer" className="text-sm font-medium">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formCustomerId}
                  onValueChange={v => { setFormCustomerId(v); setFormErrors(p => ({ ...p, customer: '' })) }}
                >
                  <SelectTrigger
                    id="quo-customer"
                    className={`h-9 ${formErrors.customer ? 'border-red-400' : ''}`}
                  >
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION}>Select customer</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.customer && <p className="text-xs text-red-500">{formErrors.customer}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="quo-category" className="text-sm font-medium">Category</Label>
                <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                  <SelectTrigger id="quo-category" className="h-9">
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION}>No Category</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Date + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quo-date" className="text-sm font-medium">
                  Issue Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quo-date"
                  type="date"
                  value={formIssueDate}
                  onChange={e => { setFormIssueDate(e.target.value); setFormErrors(p => ({ ...p, issueDate: '' })) }}
                  className={`h-9 ${formErrors.issueDate ? 'border-red-400' : ''}`}
                />
                {formErrors.issueDate && <p className="text-xs text-red-500">{formErrors.issueDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="quo-status" className="text-sm font-medium">Status</Label>
                <Select value={String(formStatus)} onValueChange={v => setFormStatus(Number(v) as QuotationStatus)}>
                  <SelectTrigger id="quo-status" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="quo-description" className="text-sm font-medium">Notes</Label>
              <Textarea
                id="quo-description"
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Items <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 shadow-none text-xs"
                  onClick={addItem}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Item
                </Button>
              </div>

              {formErrors.items && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {formErrors.items}
                </p>
              )}

              {/* Items grid layout */}
              <div className="space-y-2">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_60px_100px_90px_60px_100px_32px] gap-2 px-1">
                  <span className="text-xs font-medium text-muted-foreground">Product / Item Name</span>
                  <span className="text-xs font-medium text-muted-foreground">Qty</span>
                  <span className="text-xs font-medium text-muted-foreground">Price</span>
                  <span className="text-xs font-medium text-muted-foreground">Discount</span>
                  <span className="text-xs font-medium text-muted-foreground">Tax%</span>
                  <span className="text-xs font-medium text-muted-foreground text-right">Amount</span>
                  <span></span>
                </div>
                {/* Item rows */}
                {formItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_60px_100px_90px_60px_100px_32px] gap-2 items-center rounded-md border border-border bg-muted/10 px-2 py-2">
                    {/* Product select or manual name input */}
                    <div className="space-y-1">
                      <Select
                        value={item.productId}
                        onValueChange={v => updateItem(idx, 'productId', v)}
                      >
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_SELECTION}>Manual entry</SelectItem>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {item.productId === NO_SELECTION && (
                        <Input
                          value={item.itemName}
                          onChange={e => updateItem(idx, 'itemName', e.target.value)}
                          placeholder="Item name"
                          className="h-7 text-xs w-full"
                        />
                      )}
                    </div>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', Number(e.target.value) || 1)}
                      className="h-8 text-xs w-full"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={item.price}
                      onChange={e => updateItem(idx, 'price', Number(e.target.value) || 0)}
                      className="h-8 text-xs w-full"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={item.discount}
                      onChange={e => updateItem(idx, 'discount', Number(e.target.value) || 0)}
                      className="h-8 text-xs w-full"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={item.taxRate}
                      onChange={e => updateItem(idx, 'taxRate', Number(e.target.value) || 0)}
                      className="h-8 text-xs w-full"
                    />
                    <span className="text-xs font-medium text-right pr-1">
                      {formatPrice(calcItemAmount(item))}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                      onClick={() => removeItem(idx)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="flex justify-end">
                <div className="min-w-[220px] space-y-1.5 text-sm border rounded-md p-3 bg-muted/20">
                  <div className="flex justify-between gap-8">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(formSubtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-red-600">- {formatPrice(formTotalDiscount)}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-muted-foreground">Tax</span>
                    <span>+ {formatPrice(Math.max(0, formTotalTax))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between gap-8 font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(formTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="shadow-none"
                onClick={() => setOpenForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="blue" className="shadow-none" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  editingId ? 'Update' : 'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── View Detail Dialog ───────────────────────────────────────────────── */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotation Detail</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : viewDetail ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Quotation ID</p>
                  <p className="font-semibold text-blue-600">{viewDetail.estimateId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewDetail.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Issue Date</p>
                  <p>{formatDate(viewDetail.issueDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusConfig(viewDetail.status).color}`}>
                    {getStatusConfig(viewDetail.status).label}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold text-blue-600">{formatPrice(viewDetail.total)}</p>
                </div>
                {viewDetail.description && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-muted-foreground">{viewDetail.description}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Items */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Items</p>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="px-3 py-2 text-xs font-medium">Item</TableHead>
                        <TableHead className="px-3 py-2 text-xs font-medium text-right">Qty</TableHead>
                        <TableHead className="px-3 py-2 text-xs font-medium text-right">Price</TableHead>
                        <TableHead className="px-3 py-2 text-xs font-medium text-right">Discount</TableHead>
                        <TableHead className="px-3 py-2 text-xs font-medium text-right">Tax</TableHead>
                        <TableHead className="px-3 py-2 text-xs font-medium text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewDetail.items?.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="px-3 py-2 text-xs font-medium">{item.itemName}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right">{item.quantity}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right">{formatPrice(item.price)}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right">{item.discount > 0 ? formatPrice(item.discount) : '—'}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right">{item.taxRate > 0 ? `${item.taxRate}%` : '—'}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-medium">{formatPrice(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Quick status change */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Change Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map(s => (
                    <Button
                      key={s.value}
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`h-7 text-xs shadow-none ${viewDetail.status === s.value ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                      onClick={() => handleStatusChange(viewDetail.estimateId, s.value)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" className="shadow-none" onClick={() => setOpenView(false)}>Close</Button>
            {viewDetail && (
              <Button
                variant="blue"
                className="shadow-none"
                onClick={() => { setOpenView(false); openEditForm(viewDetail.estimateId) }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteId}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </POSPageLayout>
  )
}
