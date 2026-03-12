'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Plus, Search, X, Eye, Pencil, Trash2, FileUp, FileDown } from 'lucide-react'
import { toast } from 'sonner'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function SupplierTab() {
  type SupplierRow = {
    id: string
    code: string
    name: string
    email: string
    phone: string
    contact: string
    balance: number
    taxNumber?: string
    billingName?: string
    billingPhone?: string
    billingAddress?: string
    billingCity?: string
    billingState?: string
    billingCountry?: string
    billingZip?: string
    shippingName?: string
    shippingPhone?: string
    shippingAddress?: string
    shippingCity?: string
    shippingState?: string
    shippingCountry?: string
    shippingZip?: string
  }

  const [rows, setRows] = useState<SupplierRow[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierRow | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    taxNumber: '',
    balance: '',
    billingName: '',
    billingPhone: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingCountry: '',
    billingZip: '',
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingCountry: '',
    shippingZip: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const mapCustomerToSupplier = (v: any): SupplierRow => ({
      id: v.id as string,
      code: (v.vendorCode as string) ?? '',
      name: (v.name as string) ?? '',
      email: (v.email as string) ?? '',
      phone: (v.billingPhone as string) ?? (v.shippingPhone as string) ?? '',
      contact: (v.contact as string) ?? '',
      balance: Number(v.balance) || 0,
      taxNumber: v.taxNumber ?? '',
      billingName: v.billingName ?? '',
      billingPhone: v.billingPhone ?? '',
      billingAddress: v.billingAddress ?? '',
      billingCity: v.billingCity ?? '',
      billingState: v.billingState ?? '',
      billingCountry: v.billingCountry ?? '',
      billingZip: v.billingZip ?? '',
      shippingName: v.shippingName ?? '',
      shippingPhone: v.shippingPhone ?? '',
      shippingAddress: v.shippingAddress ?? '',
      shippingCity: v.shippingCity ?? '',
      shippingState: v.shippingState ?? '',
      shippingCountry: v.shippingCountry ?? '',
      shippingZip: v.shippingZip ?? '',
    })

    const loadSuppliers = async () => {
      try {
        const res = await fetch('/api/vendors', { cache: 'no-store' })
        if (!res.ok) {
          toast.error('Gagal memuat data vendor')
          return
        }
        const json = await res.json().catch(() => null)
        if (!json?.success || !Array.isArray(json.data)) {
          toast.error(json?.message || 'Gagal memuat data vendor')
          return
        }
        const mapped: SupplierRow[] = json.data.map(mapCustomerToSupplier)
        setRows(mapped)
      } catch (error) {
        console.error('Error fetching suppliers:', error)
        toast.error('Terjadi kesalahan saat memuat data vendor')
      }
    }

    loadSuppliers()
  }, [])

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        name: '',
        contact: '',
        email: '',
        taxNumber: '',
        balance: '',
        billingName: '',
        billingPhone: '',
        billingAddress: '',
        billingCity: '',
        billingState: '',
        billingCountry: '',
        billingZip: '',
        shippingName: '',
        shippingPhone: '',
        shippingAddress: '',
        shippingCity: '',
        shippingState: '',
        shippingCountry: '',
        shippingZip: '',
      })
    }
  }

  const handleShippingSameAsBilling = () => {
    setFormData({
      ...formData,
      shippingName: formData.billingName,
      shippingPhone: formData.billingPhone,
      shippingAddress: formData.billingAddress,
      shippingCity: formData.billingCity,
      shippingState: formData.billingState,
      shippingCountry: formData.billingCountry,
      shippingZip: formData.billingZip,
    })
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return
    setIsSubmitting(true)

    const payload: any = {
      name: formData.name,
      email: formData.email,
      contact: formData.contact,
      taxNumber: formData.taxNumber || null,
      balance: Number(formData.balance) || 0,
      billingName: formData.billingName || null,
      billingPhone: formData.billingPhone || null,
      billingAddress: formData.billingAddress || null,
      billingCity: formData.billingCity || null,
      billingState: formData.billingState || null,
      billingCountry: formData.billingCountry || null,
      billingZip: formData.billingZip || null,
      shippingName: formData.shippingName || null,
      shippingPhone: formData.shippingPhone || null,
      shippingAddress: formData.shippingAddress || null,
      shippingCity: formData.shippingCity || null,
      shippingState: formData.shippingState || null,
      shippingCountry: formData.shippingCountry || null,
      shippingZip: formData.shippingZip || null,
    }

    const isEdit = Boolean(editingId)

    if (!isEdit) {
      const random = Math.floor(Math.random() * 1_000_000)
      const vendorCode = `VDR-${String(random).padStart(6, '0')}`
      payload.vendorCode = vendorCode
    }

    const url = isEdit ? `/api/vendors/${editingId}` : '/api/vendors'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null)

      if (!res) {
        toast.error('Terjadi kesalahan sistem')
        return
      }

      const json = await res.json().catch(() => null)
      if (!json?.success || !json.data) {
        toast.error(json?.message || 'Gagal menyimpan vendor')
        return
      }

      const c = json.data as any
      const updatedRow: SupplierRow = {
        id: c.id as string,
        code: (c.vendorCode as string) ?? '',
        name: (c.name as string) ?? '',
        email: (c.email as string) ?? '',
        phone: (c.billingPhone as string) ?? (c.shippingPhone as string) ?? '',
        contact: (c.contact as string) ?? '',
        balance: Number(c.balance) || 0,
        taxNumber: c.taxNumber ?? '',
        billingName: c.billingName ?? '',
        billingPhone: c.billingPhone ?? '',
        billingAddress: c.billingAddress ?? '',
        billingCity: c.billingCity ?? '',
        billingState: c.billingState ?? '',
        billingCountry: c.billingCountry ?? '',
        billingZip: c.billingZip ?? '',
        shippingName: c.shippingName ?? '',
        shippingPhone: c.shippingPhone ?? '',
        shippingAddress: c.shippingAddress ?? '',
        shippingCity: c.shippingCity ?? '',
        shippingState: c.shippingState ?? '',
        shippingCountry: c.shippingCountry ?? '',
        shippingZip: c.shippingZip ?? '',
      }

      if (isEdit) {
        setRows((prev) => prev.map((v) => (v.id === editingId ? updatedRow : v)))
        toast.success('Vendor berhasil diperbarui')
      } else {
        setRows((prev) => [updatedRow, ...prev])
        toast.success('Vendor berhasil dibuat')
      }

      handleDialogOpenChange(false)
    } catch (error) {
      console.error('Error saving supplier:', error)
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.trim().toLowerCase()
    return rows.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(q) ||
        vendor.id.toLowerCase().includes(q) ||
        vendor.email.toLowerCase().includes(q) ||
        vendor.contact.toLowerCase().includes(q) ||
        vendor.phone.toLowerCase().includes(q)
    )
  }, [search, rows])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const handleEdit = (vendor: SupplierRow) => {
    setEditingId(vendor.id)
    setFormData({
      name: vendor.name,
      contact: vendor.contact,
      email: vendor.email,
      taxNumber: vendor.taxNumber || '',
      balance: String(vendor.balance ?? 0),
      billingName: vendor.billingName || '',
      billingPhone: vendor.billingPhone || '',
      billingAddress: vendor.billingAddress || '',
      billingCity: vendor.billingCity || '',
      billingState: vendor.billingState || '',
      billingCountry: vendor.billingCountry || '',
      billingZip: vendor.billingZip || '',
      shippingName: vendor.shippingName || '',
      shippingPhone: vendor.shippingPhone || '',
      shippingAddress: vendor.shippingAddress || '',
      shippingCity: vendor.shippingCity || '',
      shippingState: vendor.shippingState || '',
      shippingCountry: vendor.shippingCountry || '',
      shippingZip: vendor.shippingZip || '',
    })
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (vendor: SupplierRow) => {
    setSupplierToDelete(vendor)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return
    try {
      const res = await fetch(`/api/vendors/${supplierToDelete.id}`, {
        method: 'DELETE',
      })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.success) {
        setRows((prev) => prev.filter((v) => v.id !== supplierToDelete.id))
        toast.success('Vendor berhasil dihapus')
      } else {
        toast.error(json?.message || 'Gagal menghapus vendor')
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setSupplierToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleExport = () => {
    const headers = ['Code', 'Name', 'Contact', 'Email', 'Phone', 'Balance', 'Tax Number', 'Billing Address', 'Shipping Address']
    const rows = filteredData.map(vendor => [
      vendor.code,
      vendor.name,
      vendor.contact,
      vendor.email,
      vendor.phone,
      vendor.balance.toString(),
      vendor.taxNumber || '',
      vendor.billingAddress || '',
      vendor.shippingAddress || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `vendors_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Vendor</CardTitle>
            <CardDescription>Manage vendors and purchase contacts.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="shadow-none h-7 px-4 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
            title="Import"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import Vendor
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shadow-none h-8 px-3 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
            title="Export"
            onClick={handleExport}
          >
            <FileDown className="mr-2 h-3.5 w-3.5" />
            <span className="text-xs">Export Vendor</span>
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
                Create Vendor
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[70vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Vendor' : 'Create New Vendor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-6 py-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold">Basic Info</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">
                        Contact <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="Enter Contact"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter Email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxNumber">Tax Number</Label>
                      <Input
                        id="taxNumber"
                        value={formData.taxNumber}
                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                        placeholder="Enter Tax Number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="balance">Balance</Label>
                      <Input
                        id="balance"
                        type="number"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        placeholder="Enter Balance"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold">Billing Address</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingName">Name</Label>
                      <Input
                        id="billingName"
                        value={formData.billingName}
                        onChange={(e) => setFormData({ ...formData, billingName: e.target.value })}
                        placeholder="Enter Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingPhone">Phone</Label>
                      <Input
                        id="billingPhone"
                        value={formData.billingPhone}
                        onChange={(e) => setFormData({ ...formData, billingPhone: e.target.value })}
                        placeholder="Enter Phone"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="billingAddress">Address</Label>
                      <Textarea
                        id="billingAddress"
                        value={formData.billingAddress}
                        onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                        placeholder="Enter Address"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingCity">City</Label>
                      <Input
                        id="billingCity"
                        value={formData.billingCity}
                        onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                        placeholder="Enter City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingState">State</Label>
                      <Input
                        id="billingState"
                        value={formData.billingState}
                        onChange={(e) => setFormData({ ...formData, billingState: e.target.value })}
                        placeholder="Enter State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingCountry">Country</Label>
                      <Input
                        id="billingCountry"
                        value={formData.billingCountry}
                        onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
                        placeholder="Enter Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingZip">Zip Code</Label>
                      <Input
                        id="billingZip"
                        value={formData.billingZip}
                        onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })}
                        placeholder="Enter Zip Code"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold">Shipping Address</h5>
                    <Button
                      type="button"
                      variant="blue"
                      size="sm"
                      className="shadow-none"
                      onClick={handleShippingSameAsBilling}
                    >
                      Shipping Same As Billing
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingName">Name</Label>
                      <Input
                        id="shippingName"
                        value={formData.shippingName}
                        onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
                        placeholder="Enter Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingPhone">Phone</Label>
                      <Input
                        id="shippingPhone"
                        value={formData.shippingPhone}
                        onChange={(e) => setFormData({ ...formData, shippingPhone: e.target.value })}
                        placeholder="Enter Phone"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="shippingAddress">Address</Label>
                      <Textarea
                        id="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                        placeholder="Enter Address"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingCity">City</Label>
                      <Input
                        id="shippingCity"
                        value={formData.shippingCity}
                        onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                        placeholder="Enter City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingState">State</Label>
                      <Input
                        id="shippingState"
                        value={formData.shippingState}
                        onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
                        placeholder="Enter State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingCountry">Country</Label>
                      <Input
                        id="shippingCountry"
                        value={formData.shippingCountry}
                        onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                        placeholder="Enter Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingZip">Zip Code</Label>
                      <Input
                        id="shippingZip"
                        value={formData.shippingZip}
                        onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                        placeholder="Enter Zip Code"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="shadow-none" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="blue" className="shadow-none" disabled={isSubmitting}>
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Vendors Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Vendor List</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
              />
              {search.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => {
                    setSearch('')
                    setCurrentPage(1)
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">#</TableHead>
                  <TableHead className="px-6">Name</TableHead>
                  <TableHead className="px-6">Contact</TableHead>
                  <TableHead className="px-6">Email</TableHead>
                  <TableHead className="px-6">Balance</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="px-6">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="shadow-none"
                        >
                          <Link href={`/accounting/vender/${vendor.id}`}>
                            {vendor.code || vendor.id}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="px-6 font-medium">{vendor.name}</TableCell>
                      <TableCell className="px-6">{vendor.contact}</TableCell>
                      <TableCell className="px-6">{vendor.email}</TableCell>
                      <TableCell className="px-6 font-medium">
                        {formatPrice(vendor.balance)}
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                            title="View"
                            asChild
                          >
                            <Link href={`/accounting/vender/${vendor.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => handleEdit(vendor)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(vendor)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 text-center py-8 text-muted-foreground">
                      No vendors found
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
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vendor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSupplierToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
