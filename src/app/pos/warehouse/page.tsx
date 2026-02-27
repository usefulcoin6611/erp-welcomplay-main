'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Search, X, Pencil, Trash, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Switch } from '@/components/ui/switch'

type Warehouse = {
  id: string
  name: string
  address: string | null
  phone: string | null
  isActive: boolean
  branchId: string | null
  createdAt: string
  updatedAt: string
}

type WarehouseFormData = {
  name: string
  address: string
  phone: string
  isActive: boolean
}

const DEFAULT_FORM: WarehouseFormData = {
  name: '',
  address: '',
  phone: '',
  isActive: true,
}

export default function POSWarehousePage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Modal state
  const [openForm, setOpenForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<WarehouseFormData>(DEFAULT_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchWarehouses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pos/warehouses?active=false')
      const data = await res.json()
      if (data.success) {
        setWarehouses(data.data)
      } else {
        toast.error('Failed to load warehouses')
      }
    } catch {
      toast.error('Failed to load warehouses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWarehouses()
  }, [fetchWarehouses])

  const filteredData = useMemo(() => {
    if (!search.trim()) return warehouses
    const q = search.trim().toLowerCase()
    return warehouses.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        (w.address ?? '').toLowerCase().includes(q) ||
        (w.phone ?? '').toLowerCase().includes(q)
    )
  }, [search, warehouses])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const openCreateForm = () => {
    setEditingId(null)
    setFormData(DEFAULT_FORM)
    setOpenForm(true)
  }

  const openEditForm = (warehouse: Warehouse) => {
    setEditingId(warehouse.id)
    setFormData({
      name: warehouse.name,
      address: warehouse.address ?? '',
      phone: warehouse.phone ?? '',
      isActive: warehouse.isActive,
    })
    setOpenForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Warehouse name is required')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId ? `/api/pos/warehouses/${editingId}` : '/api/pos/warehouses'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          address: formData.address.trim() || null,
          phone: formData.phone.trim() || null,
          isActive: formData.isActive,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Warehouse updated' : 'Warehouse created')
        setOpenForm(false)
        fetchWarehouses()
      } else {
        toast.error(data.message ?? 'Failed to save warehouse')
      }
    } catch {
      toast.error('Failed to save warehouse')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/pos/warehouses/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Warehouse deleted')
        setDeleteId(null)
        fetchWarehouses()
      } else {
        toast.error(data.message ?? 'Failed to delete warehouse')
      }
    } catch {
      toast.error('Failed to delete warehouse')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <POSPageLayout
      title="Warehouse"
      breadcrumbLabel="Warehouse"
      actionButton={
        <Button size="sm" variant="blue" className="shadow-none h-7" onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      }
    >
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-base font-medium">Warehouse List</h5>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search warehouse..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
            />
            {search.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => handleSearchChange('')}
              >
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
                  <TableHead className="px-4 py-3 font-normal">Name</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Address</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Phone</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Status</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-4 py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 py-3 font-medium">{row.name}</TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">{row.address ?? '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">{row.phone ?? '-'}</TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {row.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                            title="Edit"
                            onClick={() => openEditForm(row)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => setDeleteId(row.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No warehouse found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <div className="px-4 py-3 border-t">
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

      {/* Create/Edit Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wh-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="wh-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Warehouse name"
                className="h-9"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-address">Address</Label>
              <Input
                id="wh-address"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                placeholder="Warehouse address"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-phone">Phone</Label>
              <Input
                id="wh-phone"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Phone number"
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="wh-active" className="cursor-pointer">Active</Label>
              <Switch
                id="wh-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, isActive: checked }))}
                className="data-[state=checked]:bg-blue-500"
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
                ) : (
                  editingId ? 'Update' : 'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Warehouse</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this warehouse? This action cannot be undone.
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
