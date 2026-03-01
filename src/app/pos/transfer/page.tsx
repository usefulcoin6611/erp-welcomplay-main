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
import { Plus, Search, X, Trash, Loader2, ArrowRight, Eye, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

type Transfer = {
  id: string
  transferId: string
  fromWarehouseId: string
  fromWarehouseName: string
  toWarehouseId: string
  toWarehouseName: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  note: string | null
  branchId: string | null
  transferDate: string
  createdAt: string
}

type Warehouse = { id: string; name: string }
type Product = { id: string; name: string; sku: string; quantity: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function POSTransferPage() {
  // List state
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)

  // Reference data
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Form state
  const [openForm, setOpenForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formFromWarehouseId, setFormFromWarehouseId] = useState(NO_SELECTION)
  const [formToWarehouseId, setFormToWarehouseId] = useState(NO_SELECTION)
  const [formProductId, setFormProductId] = useState(NO_SELECTION)
  const [formQuantity, setFormQuantity] = useState(1)
  const [formNote, setFormNote] = useState('')
  const [formTransferDate, setFormTransferDate] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // View state
  const [viewDetail, setViewDetail] = useState<Transfer | null>(null)
  const [openView, setOpenView] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTransferId, setDeleteTransferId] = useState<string | null>(null)

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchTransfers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pos/transfers')
      const data = await res.json()
      if (data.success) {
        setTransfers(data.data)
      } else {
        toast.error(data.message ?? 'Failed to load transfers')
      }
    } catch {
      toast.error('Failed to load transfers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransfers()
    fetch('/api/pos/warehouses?active=false').then(r => r.json()).then(res => {
      if (res.success) setWarehouses(res.data.map((w: any) => ({ id: w.id, name: w.name })))
    }).catch(() => {})
    fetch('/api/products').then(r => r.json()).then(res => {
      if (res.success) setProducts(res.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku ?? '',
        quantity: Number(p.quantity) || 0,
      })))
    }).catch(() => {})
  }, [fetchTransfers])

  // ─── Filtering & Pagination ─────────────────────────────────────────────────

  const filteredData = useMemo(() => {
    if (!search.trim()) return transfers
    const q = search.trim().toLowerCase()
    return transfers.filter(
      (t) =>
        t.transferId.toLowerCase().includes(q) ||
        t.fromWarehouseName.toLowerCase().includes(q) ||
        t.toWarehouseName.toLowerCase().includes(q) ||
        t.productName.toLowerCase().includes(q)
    )
  }, [search, transfers])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  // ─── Form Helpers ───────────────────────────────────────────────────────────

  const resetForm = () => {
    setEditingId(null)
    setFormFromWarehouseId(NO_SELECTION)
    setFormToWarehouseId(NO_SELECTION)
    setFormProductId(NO_SELECTION)
    setFormQuantity(1)
    setFormNote('')
    setFormTransferDate(new Date().toISOString().slice(0, 10))
    setFormErrors({})
  }

  const openCreateForm = () => {
    resetForm()
    setOpenForm(true)
  }

  const openEditForm = async (id: string) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/pos/transfers/${id}`)
      const data = await res.json()
      if (!data.success) {
        toast.error(data.message ?? 'Failed to load transfer')
        return
      }
      const t = data.data
      setEditingId(t.id)
      setFormFromWarehouseId(toSelectValue(t.fromWarehouseId))
      setFormToWarehouseId(toSelectValue(t.toWarehouseId))
      setFormProductId(toSelectValue(t.productId))
      setFormQuantity(Number(t.quantity) || 1)
      setFormNote(t.note ?? '')
      setFormTransferDate(t.transferDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
      setFormErrors({})
      setOpenForm(true)
    } catch {
      toast.error('Failed to load transfer')
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleView = async (id: string) => {
    setLoadingDetail(true)
    setOpenView(true)
    try {
      const res = await fetch(`/api/pos/transfers/${id}`)
      const data = await res.json()
      if (data.success) {
        const t = data.data
        setViewDetail({
          id: t.id,
          transferId: t.transferId,
          fromWarehouseId: t.fromWarehouseId,
          fromWarehouseName: t.fromWarehouseName ?? '—',
          toWarehouseId: t.toWarehouseId,
          toWarehouseName: t.toWarehouseName ?? '—',
          productId: t.productId,
          productName: t.productName ?? '—',
          productSku: t.productSku ?? '',
          quantity: Number(t.quantity) || 0,
          note: t.note ?? null,
          branchId: t.branchId ?? null,
          transferDate: t.transferDate ?? '',
          createdAt: t.createdAt ?? '',
        })
      } else {
        toast.error(data.message ?? 'Failed to load transfer')
        setOpenView(false)
      }
    } catch {
      toast.error('Failed to load transfer')
      setOpenView(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    const fromId = fromSelectValue(formFromWarehouseId)
    const toId = fromSelectValue(formToWarehouseId)
    const productId = fromSelectValue(formProductId)

    if (!fromId) errors.fromWarehouse = 'Source warehouse is required'
    if (!toId) errors.toWarehouse = 'Destination warehouse is required'
    if (fromId && toId && fromId === toId) {
      errors.toWarehouse = 'Source and destination warehouse cannot be the same'
    }
    if (!productId) errors.product = 'Product is required'
    if (!formQuantity || formQuantity <= 0) errors.quantity = 'Quantity must be greater than 0'
    if (!formTransferDate) errors.transferDate = 'Transfer date is required'

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
        fromWarehouseId: fromSelectValue(formFromWarehouseId),
        toWarehouseId: fromSelectValue(formToWarehouseId),
        productId: fromSelectValue(formProductId),
        quantity: formQuantity,
        note: formNote.trim() || null,
        transferDate: formTransferDate,
      }

      const isEdit = !!editingId
      const url = isEdit ? `/api/pos/transfers/${editingId}` : '/api/pos/transfers'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(isEdit ? '✅ Transfer updated successfully' : `✅ Transfer ${data.data.transferId} created successfully`)
        setOpenForm(false)
        setEditingId(null)
        fetchTransfers()
      } else {
        toast.error(data.message ?? (isEdit ? 'Failed to update transfer' : 'Failed to create transfer'))
      }
    } catch {
      toast.error(editingId ? 'Failed to update transfer' : 'Failed to create transfer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/pos/transfers/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(`🗑️ Transfer ${deleteTransferId} deleted successfully`)
        setDeleteId(null)
        setDeleteTransferId(null)
        fetchTransfers()
      } else {
        toast.error(data.message ?? 'Failed to delete transfer')
      }
    } catch {
      toast.error('Failed to delete transfer')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <POSPageLayout
      title="Warehouse Transfer"
      breadcrumbLabel="Transfer"
      actionButton={
        <Button size="sm" variant="blue" className="shadow-none h-7" onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      }
    >
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-base font-medium">Transfer List</h5>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transfer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
            />
            {search.length > 0 && (
              <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => { setSearch(''); setCurrentPage(1) }}>
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
                  <TableHead className="px-4 py-3 font-normal">Transfer ID</TableHead>
                  <TableHead className="px-4 py-3 font-normal">From Warehouse</TableHead>
                  <TableHead className="px-4 py-3 font-normal w-8 text-center"></TableHead>
                  <TableHead className="px-4 py-3 font-normal">To Warehouse</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Product</TableHead>
                  <TableHead className="px-4 py-3 font-normal text-right">Qty</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Date</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No transfer found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 shadow-none text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleView(row.id)}
                        >
                          {row.transferId}
                        </Button>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">{row.fromWarehouseName}</TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">{row.toWarehouseName}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium">{row.productName}</p>
                          {row.productSku && <p className="text-xs text-muted-foreground font-mono">{row.productSku}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-right font-medium">{row.quantity}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">{formatDate(row.transferDate)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                            title="View"
                            onClick={() => handleView(row.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                            title="Edit"
                            disabled={loadingDetail}
                            onClick={() => openEditForm(row.id)}
                          >
                            {loadingDetail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => { setDeleteId(row.id); setDeleteTransferId(row.transferId) }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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

      {/* ─── Create / Edit Transfer Dialog ────────────────────────────────────── */}
      <Dialog open={openForm} onOpenChange={(open) => { if (!open) setEditingId(null); setOpenForm(open) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Warehouse Transfer' : 'Create Warehouse Transfer'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* From Warehouse */}
            <div className="space-y-2">
              <Label htmlFor="trf-from" className="text-sm font-medium">
                From Warehouse <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formFromWarehouseId}
                onValueChange={v => { setFormFromWarehouseId(v); setFormErrors(p => ({ ...p, fromWarehouse: '' })) }}
              >
                <SelectTrigger
                  id="trf-from"
                  className={`h-9 ${formErrors.fromWarehouse ? 'border-red-400' : ''}`}
                >
                  <SelectValue placeholder="Select source warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>Select source warehouse</SelectItem>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.fromWarehouse && <p className="text-xs text-red-500">{formErrors.fromWarehouse}</p>}
            </div>

            {/* To Warehouse */}
            <div className="space-y-2">
              <Label htmlFor="trf-to" className="text-sm font-medium">
                To Warehouse <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formToWarehouseId}
                onValueChange={v => { setFormToWarehouseId(v); setFormErrors(p => ({ ...p, toWarehouse: '' })) }}
              >
                <SelectTrigger
                  id="trf-to"
                  className={`h-9 ${formErrors.toWarehouse ? 'border-red-400' : ''}`}
                >
                  <SelectValue placeholder="Select destination warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>Select destination warehouse</SelectItem>
                  {warehouses
                    .filter(w => w.id !== fromSelectValue(formFromWarehouseId))
                    .map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formErrors.toWarehouse && <p className="text-xs text-red-500">{formErrors.toWarehouse}</p>}
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label htmlFor="trf-product" className="text-sm font-medium">
                Product <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formProductId}
                onValueChange={v => { setFormProductId(v); setFormErrors(p => ({ ...p, product: '' })) }}
              >
                <SelectTrigger
                  id="trf-product"
                  className={`h-9 ${formErrors.product ? 'border-red-400' : ''}`}
                >
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>Select product</SelectItem>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.product && <p className="text-xs text-red-500">{formErrors.product}</p>}
            </div>

            {/* Quantity + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trf-qty" className="text-sm font-medium">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="trf-qty"
                  type="number"
                  min={1}
                  value={formQuantity}
                  onChange={e => { setFormQuantity(Number(e.target.value) || 1); setFormErrors(p => ({ ...p, quantity: '' })) }}
                  className={`h-9 ${formErrors.quantity ? 'border-red-400' : ''}`}
                />
                {formErrors.quantity && <p className="text-xs text-red-500">{formErrors.quantity}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trf-date" className="text-sm font-medium">
                  Transfer Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="trf-date"
                  type="date"
                  value={formTransferDate}
                  onChange={e => { setFormTransferDate(e.target.value); setFormErrors(p => ({ ...p, transferDate: '' })) }}
                  className={`h-9 ${formErrors.transferDate ? 'border-red-400' : ''}`}
                />
                {formErrors.transferDate && <p className="text-xs text-red-500">{formErrors.transferDate}</p>}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="trf-note" className="text-sm font-medium">Note</Label>
              <Textarea
                id="trf-note"
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                placeholder="Optional notes about this transfer..."
                rows={2}
                className="resize-none text-sm"
              />
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
                ) : editingId ? (
                  'Update Transfer'
                ) : (
                  'Create Transfer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── View Detail Dialog ───────────────────────────────────────────────── */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewDetail?.transferId ?? 'Transfer Detail'}</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : viewDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">From Warehouse</Label>
                  <p className="text-sm font-medium">{viewDetail.fromWarehouseName}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">To Warehouse</Label>
                  <p className="text-sm font-medium">{viewDetail.toWarehouseName}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Product</Label>
                <div>
                  <p className="text-sm font-medium">{viewDetail.productName}</p>
                  {viewDetail.productSku && <p className="text-xs text-muted-foreground font-mono">{viewDetail.productSku}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Quantity</Label>
                  <p className="text-sm font-medium">{viewDetail.quantity}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Transfer Date</Label>
                  <p className="text-sm">{formatDate(viewDetail.transferDate)}</p>
                </div>
              </div>
              {viewDetail.note && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Note</Label>
                  <p className="text-sm text-muted-foreground">{viewDetail.note}</p>
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" className="shadow-none" onClick={() => setOpenView(false)}>Close</Button>
            {viewDetail && (
              <Button
                variant="blue"
                className="shadow-none"
                onClick={() => { setOpenView(false); openEditForm(viewDetail.id) }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) { setDeleteId(null); setDeleteTransferId(null) } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transfer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete transfer <strong className="text-foreground">{deleteTransferId}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Transfer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </POSPageLayout>
  )
}
