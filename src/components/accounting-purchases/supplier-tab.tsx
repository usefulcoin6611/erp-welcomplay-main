'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  Plus,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
  FileUp,
  FileDown,
} from 'lucide-react'

// Mock suppliers (vendors)
const vendors = [
  {
    id: 'VDR-001',
    name: 'PT Supply Berkah',
    email: 'vendor@supplyberkah.id',
    phone: '+62 21 5555 8888',
    contact: 'Budi Santoso',
    balance: 150000000,
  },
  {
    id: 'VDR-002',
    name: 'CV Logistik Nusantara',
    email: 'info@logistiknusantara.co.id',
    phone: '+62 31 7777 8888',
    contact: 'Sari Wijaya',
    balance: 85000000,
  },
  {
    id: 'VDR-003',
    name: 'PT Teknologi Digital',
    email: 'contact@teknologidigital.id',
    phone: '+62 22 6666 9999',
    contact: 'Ahmad Fauzi',
    balance: 120000000,
  },
]

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function SupplierTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
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

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form data:', formData)
    setCreateDialogOpen(false)
    // Reset form
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

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search.trim()) return vendors
    const q = search.trim().toLowerCase()
    return vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(q) ||
        vendor.id.toLowerCase().includes(q) ||
        vendor.email.toLowerCase().includes(q) ||
        vendor.contact.toLowerCase().includes(q) ||
        vendor.phone.toLowerCase().includes(q)
    )
  }, [search])

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

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" className="shadow-none h-7 !bg-amber-600 hover:!bg-amber-700 !text-white !border-amber-600" title="Import">
          <FileUp className="h-3 w-3" />
        </Button>
        <Button variant="secondary" size="sm" className="shadow-none h-7" title="Export">
          <FileDown className="h-3 w-3" />
        </Button>
        <Dialog open={createDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7" title="Create">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[70vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Vendor</DialogTitle>
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
                <Button type="submit" variant="blue" className="shadow-none">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 focus-visible:border-0 shadow-none transition-colors"
              />
              {search.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">#</TableHead>
                  <TableHead className="px-4 py-3">Name</TableHead>
                  <TableHead className="px-4 py-3">Contact</TableHead>
                  <TableHead className="px-4 py-3">Email</TableHead>
                  <TableHead className="px-4 py-3">Balance</TableHead>
                  <TableHead className="px-4 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="px-4 py-3">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="shadow-none"
                        >
                          <Link href={`/accounting/vender/${vendor.id}`}>
                            {vendor.id}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium">{vendor.name}</TableCell>
                      <TableCell className="px-4 py-3">{vendor.contact}</TableCell>
                      <TableCell className="px-4 py-3">{vendor.email}</TableCell>
                      <TableCell className="px-4 py-3 font-medium">
                        {formatPrice(vendor.balance)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
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
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No suppliers found
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

