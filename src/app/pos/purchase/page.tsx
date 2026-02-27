'use client'

// Sentinel value for "no selection" in Select components (empty string is not allowed as SelectItem value)
const NO_SELECTION = '__none__'

function toSelectValue(val: string | null | undefined): string {
  return val && val !== '' ? val : NO_SELECTION
}

function fromSelectValue(val: string): string | null {
  return val === NO_SELECTION ? null : val
}

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Search, X, Eye, Pencil, Trash, Loader2, PackagePlus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
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

type PurchaseStatus = 'draft' | 'sent' | 'partial' | 'unpaid' | 'paid'

type PurchaseItem = {
  id?: string
  productId: string
  itemName: string
  quantity: number
  price: number
  discount: number
  taxRate: number
  amount: number
  description?: string
}

type Purchase = {
  id: string
  billNumber: string
  billDate: string
  dueDate: string
  vendorId: string | null
  vendorName: string
  category: string
  total: number
  status: PurchaseStatus
  statusLabel: string
}

type PurchaseDetail = {
  id: string
  billId: string
  vendorId: string
  branchId: string | null
  categoryId: string | null
  billDate: string
  dueDate: string
  status: string
  total: number
  reference: string | null
  description: string | null
  vendor: { id: string; name: string }
  items: PurchaseItem[]
}

type Vendor = { id: string; name: string }
type Category = { id: string; name: string }
type Product = { id: string; name: string; purchasePrice: number; taxRate: number }

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: PurchaseStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  { value: 'partial', label: 'Partial', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'unpaid', label: 'Unpaid', color: 'bg-orange-100 text-orange-700' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-700' },
]

const EMPTY_ITEM: Omit<PurchaseItem, 'id'> = {
  productId: NO_SELECTION,
  itemName: '',
  quantity: 1,
  price: 0,
  discount: 0,
  taxRate: 0,
  amount: 0,
  description: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function calcItemAmount(item: Omit<PurchaseItem, 'id' | 'amount'>): number {
  const base = item.quantity * item.price
  const afterDiscount = base - item.discount
  const afterTax = afterDiscount * (1 + item.taxRate / 100)
  return Math.round(afterTax * 100) / 100
}

function calcTotal(items: Omit<PurchaseItem, 'id'>[]): number {
  return items.reduce((sum, it) => sum + calcItemAmount(it), 0)
}

function getStatusConfig(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0]
}

// ─── Form Section Header ──────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function POSPurchasePage() {
  // List state
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  // Reference data
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Form state (Sheet)
  const [openForm, setOpenForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formVendorId, setFormVendorId] = useState(NO_SELECTION)
  const [formCategoryId, setFormCategoryId] = useState(NO_SELECTION)
  const [formBillDate, setFormBillDate] = useState('')
  const [formDueDate, setFormDueDate] = useState('')
  const [formStatus, setFormStatus] = useState<PurchaseStatus>('draft')
  const [formReference, setFormReference] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formItems, setFormItems] = useState<Omit<PurchaseItem, 'id'>[]>([{ ...EMPTY_ITEM }])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // View state
  const [viewDetail, setViewDetail] = useState<PurchaseDetail | null>(null)
  const [openView, setOpenView] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchPurchases = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bills')
      const data = await res.json()
      if (data.success) {
        setPurchases(data.data)
      } else {
        toast.error(data.message ?? 'Failed to load purchases')
      }
    } catch {
      toast.error('Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPurchases()
    fetch('/api/vendors').then(r => r.json()).then(res => {
      if (res.success) setVendors(res.data.map((v: any) => ({ id: v.id, name: v.name })))
    }).catch(() => {})
    fetch('/api/categories').then(r => r.json()).then(res => {
      if (res.success) setCategories(res.data.map((c: any) => ({ id: c.id, name: c.name })))
    }).catch(() => {})
    fetch('/api/products').then(r => r.json()).then(res => {
      if (res.success) setProducts(res.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        purchasePrice: p.purchasePrice ?? 0,
        taxRate: p.taxRate ?? 0,
      })))
    }).catch(() => {})
  }, [fetchPurchases])

  // ─── Filtering & Pagination ─────────────────────────────────────────────────

  const filteredData = useMemo(() => {
    if (!search.trim()) return purchases
    const q = search.trim().toLowerCase()
    return purchases.filter(
      (p) =>
        p.billNumber.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }, [search, purchases])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  // ─── Form Helpers ───────────────────────────────────────────────────────────

  const resetForm = () => {
    setEditingId(null)
    setFormVendorId(NO_SELECTION)
    setFormCategoryId(NO_SELECTION)
    setFormBillDate(new Date().toISOString().slice(0, 10))
    setFormDueDate(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10))
    setFormStatus('draft')
    setFormReference('')
    setFormDescription('')
    setFormItems([{ ...EMPTY_ITEM }])
    setFormErrors({})
  }

  const openCreateForm = () => {
    resetForm()
    setOpenForm(true)
  }

  const openEditForm = async (billId: string) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/bills/${billId}`)
      const data = await res.json()
      if (!data.success) {
        toast.error(data.message ?? 'Failed to load purchase details')
        return
      }
      const bill = data.data
      setEditingId(bill.billId)
      setFormVendorId(toSelectValue(bill.vendorId))
      setFormCategoryId(toSelectValue(bill.categoryId))
      setFormBillDate(bill.billDate?.slice(0, 10) ?? '')
      setFormDueDate(bill.dueDate?.slice(0, 10) ?? '')
      setFormStatus(bill.status as PurchaseStatus)
      setFormReference(bill.reference ?? '')
      setFormDescription(bill.description ?? '')
      setFormItems(
        bill.items?.length > 0
          ? bill.items.map((it: any) => ({
              productId: toSelectValue(it.productId),
              itemName: it.itemName ?? '',
              quantity: Number(it.quantity) || 1,
              price: Number(it.price) || 0,
              discount: Number(it.discount) || 0,
              taxRate: Number(it.taxRate) || 0,
              amount: Number(it.amount) || 0,
              description: it.description ?? '',
            }))
          : [{ ...EMPTY_ITEM }]
      )
      setFormErrors({})
      setOpenForm(true)
    } catch {
      toast.error('Failed to load purchase details')
    } finally {
      setLoadingDetail(false)
    }
  }

  // ─── Item Management ────────────────────────────────────────────────────────

  const updateItem = (idx: number, field: keyof Omit<PurchaseItem, 'id'>, value: string | number) => {
    setFormItems(prev => {
      const updated = [...prev]
      const item = { ...updated[idx], [field]: value }
      if (field === 'productId' && value !== NO_SELECTION) {
        const product = products.find(p => p.id === value)
        if (product) {
          item.itemName = product.name
          item.price = product.purchasePrice
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
    if (!fromSelectValue(formVendorId)) errors.vendor = 'Vendor is required'
    if (!formBillDate) errors.billDate = 'Purchase date is required'
    if (!formDueDate) errors.dueDate = 'Due date is required'
    if (formBillDate && formDueDate && formDueDate < formBillDate) {
      errors.dueDate = 'Due date must be after purchase date'
    }
    const invalidItems = formItems.filter(it => it.productId === NO_SELECTION)
    if (invalidItems.length > 0) errors.items = 'All items must have a product selected'
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
        vendorId: fromSelectValue(formVendorId),
        categoryId: fromSelectValue(formCategoryId),
        billDate: formBillDate,
        dueDate: formDueDate,
        status: formStatus,
        reference: formReference || null,
        description: formDescription || null,
        total: formTotal,
        items: formItems.map(it => ({
          productId: fromSelectValue(it.productId) ?? it.productId,
          quantity: it.quantity,
          price: it.price,
          discount: it.discount,
          taxRate: it.taxRate,
          description: it.description || null,
        })),
      }

      const url = editingId ? `/api/bills/${editingId}` : '/api/bills'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(editingId ? '✅ Purchase updated successfully' : '✅ Purchase created successfully')
        setOpenForm(false)
        fetchPurchases()
      } else {
        toast.error(data.message ?? 'Failed to save purchase')
      }
    } catch {
      toast.error('Failed to save purchase')
    } finally {
      setSubmitting(false)
    }
  }

  const handleView = async (billId: string) => {
    setLoadingDetail(true)
    setOpenView(true)
    try {
      const res = await fetch(`/api/bills/${billId}`)
      const data = await res.json()
      if (data.success) {
        setViewDetail({
          ...data.data,
          billDate: data.data.billDate?.slice(0, 10) ?? '',
          dueDate: data.data.dueDate?.slice(0, 10) ?? '',
        })
      } else {
        toast.error(data.message ?? 'Failed to load purchase details')
        setOpenView(false)
      }
    } catch {
      toast.error('Failed to load purchase details')
      setOpenView(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/bills/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('🗑️ Purchase deleted successfully')
        setDeleteId(null)
        fetchPurchases()
      } else {
        toast.error(data.message ?? 'Failed to delete purchase')
      }
    } catch {
      toast.error('Failed to delete purchase')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (billId: string, newStatus: PurchaseStatus) => {
    try {
      const res = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Status updated to "${newStatus}"`)
        fetchPurchases()
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
      title="Manage Purchase"
      breadcrumbLabel="Purchase"
      actionButton={
        <Button size="sm" variant="blue" className="shadow-none h-7" onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase
        </Button>
      }
    >
      {/* ─── Purchase List ──────────────────────────────────────────────────── */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-base font-medium">Purchase List</h5>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by purchase #, vendor, or category..."
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
                <TableRow className="bg-muted/20">
                  <TableHead className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Purchase #</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Vendor</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Category</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Purchase Date</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Due Date</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide text-right">Total</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Status</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-sm">Loading purchases...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <ShoppingCart className="h-10 w-10 opacity-30" />
                        <div>
                          <p className="font-medium text-sm">No purchases found</p>
                          <p className="text-xs mt-0.5">
                            {search ? 'Try a different search term' : 'Create your first purchase order'}
                          </p>
                        </div>
                        {!search && (
                          <Button size="sm" variant="blue" className="shadow-none mt-1" onClick={openCreateForm}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Purchase
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => {
                    const statusConfig = getStatusConfig(row.status)
                    return (
                      <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4 py-3">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                            onClick={() => handleView(row.billNumber)}
                          >
                            {row.billNumber}
                          </button>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium">{row.vendorName}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-muted-foreground">{row.category || '—'}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-muted-foreground">{formatDate(row.billDate)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-muted-foreground">{formatDate(row.dueDate)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-right font-semibold">{formatPrice(row.total)}</TableCell>
                        <TableCell className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-yellow-700 hover:bg-yellow-50"
                              title="View details"
                              onClick={() => handleView(row.billNumber)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-blue-700 hover:bg-blue-50"
                              title="Edit"
                              disabled={loadingDetail}
                              onClick={() => openEditForm(row.billNumber)}
                            >
                              {loadingDetail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                              onClick={() => setDeleteId(row.billNumber)}
                            >
                              <Trash className="h-3.5 w-3.5" />
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

      {/* ─── Create / Edit Sheet (Best Practice: Side Panel for Complex Forms) ── */}
      <Sheet open={openForm} onOpenChange={setOpenForm}>
        <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
          {/* Sheet Header */}
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <PackagePlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <SheetTitle className="text-base font-semibold">
                  {editingId ? 'Edit Purchase Order' : 'New Purchase Order'}
                </SheetTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingId ? `Editing ${editingId}` : 'Fill in the details to create a new purchase order'}
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable Form Body */}
          <form id="purchase-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-6">

              {/* Section 1: Vendor & Category */}
              <div>
                <SectionHeader title="Supplier Information" description="Select the vendor and category for this purchase" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="pur-vendor" className="text-sm font-medium">
                      Vendor <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formVendorId} onValueChange={v => { setFormVendorId(v); setFormErrors(p => ({ ...p, vendor: '' })) }}>
                      <SelectTrigger
                        id="pur-vendor"
                        className={`h-9 ${formErrors.vendor ? 'border-red-400 focus:ring-red-400' : ''}`}
                      >
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_SELECTION}>Select vendor</SelectItem>
                        {vendors.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.vendor && <p className="text-xs text-red-500">{formErrors.vendor}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pur-category" className="text-sm font-medium">Category</Label>
                    <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                      <SelectTrigger id="pur-category" className="h-9">
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
              </div>

              <Separator />

              {/* Section 2: Dates & Status */}
              <div>
                <SectionHeader title="Order Details" description="Set the purchase date, due date, and order status" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="pur-bill-date" className="text-sm font-medium">
                      Purchase Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pur-bill-date"
                      type="date"
                      value={formBillDate}
                      onChange={e => { setFormBillDate(e.target.value); setFormErrors(p => ({ ...p, billDate: '' })) }}
                      className={`h-9 ${formErrors.billDate ? 'border-red-400' : ''}`}
                    />
                    {formErrors.billDate && <p className="text-xs text-red-500">{formErrors.billDate}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pur-due-date" className="text-sm font-medium">
                      Due Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pur-due-date"
                      type="date"
                      value={formDueDate}
                      onChange={e => { setFormDueDate(e.target.value); setFormErrors(p => ({ ...p, dueDate: '' })) }}
                      className={`h-9 ${formErrors.dueDate ? 'border-red-400' : ''}`}
                    />
                    {formErrors.dueDate && <p className="text-xs text-red-500">{formErrors.dueDate}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pur-status" className="text-sm font-medium">Status</Label>
                    <Select value={formStatus} onValueChange={v => setFormStatus(v as PurchaseStatus)}>
                      <SelectTrigger id="pur-status" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s.value} value={s.value}>
                            <span className="flex items-center gap-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${s.color.split(' ')[0]}`} />
                              {s.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pur-reference" className="text-sm font-medium">Reference No.</Label>
                    <Input
                      id="pur-reference"
                      value={formReference}
                      onChange={e => setFormReference(e.target.value)}
                      placeholder="e.g. PO-2026-001"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="pur-description" className="text-sm font-medium">Notes</Label>
                  <Textarea
                    id="pur-description"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Add any notes or special instructions..."
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>
              </div>

              <Separator />

              {/* Section 3: Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <SectionHeader
                    title="Order Items"
                    description="Add products to this purchase order"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 shadow-none text-xs shrink-0"
                    onClick={addItem}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Item
                  </Button>
                </div>

                {formErrors.items && (
                  <div className="mb-3 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-xs text-red-600">
                    {formErrors.items}
                  </div>
                )}

                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-muted/20 p-3 space-y-3"
                    >
                      {/* Item header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Item {idx + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(idx)}
                          title="Remove item"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Product select */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Product</Label>
                        <Select
                          value={item.productId}
                          onValueChange={v => updateItem(idx, 'productId', v)}
                        >
                          <SelectTrigger className="h-8 text-sm bg-white">
                            <SelectValue placeholder="Select a product..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NO_SELECTION}>Select a product...</SelectItem>
                            {products.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Qty, Price, Discount, Tax */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Qty</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => updateItem(idx, 'quantity', Number(e.target.value) || 1)}
                            className="h-8 text-sm bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Price (IDR)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={item.price}
                            onChange={e => updateItem(idx, 'price', Number(e.target.value) || 0)}
                            className="h-8 text-sm bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Discount</Label>
                          <Input
                            type="number"
                            min={0}
                            value={item.discount}
                            onChange={e => updateItem(idx, 'discount', Number(e.target.value) || 0)}
                            className="h-8 text-sm bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Tax %</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={item.taxRate}
                            onChange={e => updateItem(idx, 'taxRate', Number(e.target.value) || 0)}
                            className="h-8 text-sm bg-white"
                          />
                        </div>
                      </div>

                      {/* Item total */}
                      <div className="flex justify-end">
                        <span className="text-xs text-muted-foreground">
                          Amount: <span className="font-semibold text-foreground">{formatPrice(calcItemAmount(item))}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 rounded-lg border border-border bg-white p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Order Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(formSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Discount</span>
                    <span className="text-red-600">- {formatPrice(formTotalDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-blue-600">+ {formatPrice(Math.max(0, formTotalTax))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Total</span>
                    <span className="text-blue-600 text-base">{formatPrice(formTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Sticky Footer */}
          <SheetFooter className="px-6 py-4 border-t bg-white shrink-0 flex-row gap-3 justify-end">
            <SheetClose asChild>
              <Button type="button" variant="outline" className="shadow-none" disabled={submitting}>
                Cancel
              </Button>
            </SheetClose>
            <Button
              type="submit"
              form="purchase-form"
              variant="blue"
              className="shadow-none min-w-[120px]"
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                editingId ? 'Update Purchase' : 'Create Purchase'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ─── View Detail Dialog ───────────────────────────────────────────────── */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Purchase Detail
            </DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : viewDetail ? (
            <div className="space-y-5 text-sm">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Purchase #</p>
                  <p className="font-semibold text-blue-600">{viewDetail.billId}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Vendor</p>
                  <p className="font-medium">{viewDetail.vendor?.name ?? '—'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Purchase Date</p>
                  <p>{formatDate(viewDetail.billDate)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Due Date</p>
                  <p>{formatDate(viewDetail.dueDate)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Status</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusConfig(viewDetail.status).color}`}>
                    {getStatusConfig(viewDetail.status).label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total</p>
                  <p className="font-bold text-blue-600 text-base">{formatPrice(viewDetail.total)}</p>
                </div>
                {viewDetail.reference && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Reference</p>
                    <p className="font-mono text-xs bg-muted px-2 py-0.5 rounded w-fit">{viewDetail.reference}</p>
                  </div>
                )}
                {viewDetail.description && (
                  <div className="col-span-2 space-y-0.5">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Notes</p>
                    <p className="text-muted-foreground">{viewDetail.description}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Items ({viewDetail.items?.length ?? 0})</p>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="px-3 py-2 text-xs font-medium">Product</TableHead>
                        <TableHead className="px-3 py-2 text-xs font-medium text-right w-12">Qty</TableHead>
                        <TableHead className="px-3 py-2 text-xs font-medium text-right">Price</TableHead>
                        <TableHead className="px-3 py-2 text-xs font-medium text-right">Disc.</TableHead>
                        <TableHead className="px-3 py-2 text-xs font-medium text-right w-14">Tax</TableHead>
                        <TableHead className="px-3 py-2 text-xs font-medium text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewDetail.items?.map((item, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/20">
                          <TableCell className="px-3 py-2 text-xs font-medium">{item.itemName}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right">{item.quantity}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right">{formatPrice(item.price)}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right text-red-600">{item.discount > 0 ? `- ${formatPrice(item.discount)}` : '—'}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right">{item.taxRate > 0 ? `${item.taxRate}%` : '—'}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-semibold">{formatPrice(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Quick status change */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all border-2 ${
                        viewDetail.status === s.value
                          ? `${s.color} border-current`
                          : 'bg-white text-muted-foreground border-border hover:border-gray-400'
                      }`}
                      onClick={() => handleStatusChange(viewDetail.billId, s.value)}
                    >
                      {viewDetail.status === s.value && (
                        <span className="mr-1.5">✓</span>
                      )}
                      {s.label}
                    </button>
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
                onClick={() => { setOpenView(false); openEditForm(viewDetail.billId) }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Purchase
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong className="text-foreground">{deleteId}</strong>?
              This action cannot be undone and all associated items will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Purchase'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </POSPageLayout>
  )
}
