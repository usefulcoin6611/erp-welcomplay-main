'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { 
  Plus, 
  Pencil, 
  Trash2,
  Eye,
  Search,
  FileUp,
  FileDown,
  X
} from 'lucide-react'

// Mock data
const customers = [
  {
    id: 1,
    customerCode: 'CUST-001',
    name: 'PT Teknologi Digital Indonesia',
    email: 'admin@teknologidigital.co.id',
    contact: 'Budi Santoso',
    balance: 245000000,
  },
  {
    id: 2,
    customerCode: 'CUST-002',
    name: 'CV Mitra Sejahtera',
    email: 'info@mitrasejahtera.com',
    contact: 'Sari Wijaya',
    balance: 156000000,
  },
]

export function CustomerTab() {
  type CustomerRow = (typeof customers)[number] & {
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

  const [rows, setRows] = useState<CustomerRow[]>(() =>
    customers.map((c) => ({
      ...c,
      taxNumber: '',
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
    })),
  )
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<CustomerRow | null>(null)
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

  // Filter customers by search
  const filteredCustomers = rows.filter((customer) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      customer.name.toLowerCase().includes(q) ||
      customer.customerCode.toLowerCase().includes(q) ||
      customer.email.toLowerCase().includes(q) ||
      customer.contact.toLowerCase().includes(q)
    )
  })

  // Paginated customers
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalRecords = filteredCustomers.length

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      setRows((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: formData.name,
                contact: formData.contact,
                email: formData.email,
                balance: Number(formData.balance) || 0,
                taxNumber: formData.taxNumber,
                billingName: formData.billingName,
                billingPhone: formData.billingPhone,
                billingAddress: formData.billingAddress,
                billingCity: formData.billingCity,
                billingState: formData.billingState,
                billingCountry: formData.billingCountry,
                billingZip: formData.billingZip,
                shippingName: formData.shippingName,
                shippingPhone: formData.shippingPhone,
                shippingAddress: formData.shippingAddress,
                shippingCity: formData.shippingCity,
                shippingState: formData.shippingState,
                shippingCountry: formData.shippingCountry,
                shippingZip: formData.shippingZip,
              }
            : c,
        ),
      )
    } else {
      const nextId = rows.length > 0 ? Math.max(...rows.map((c) => c.id)) + 1 : 1
      const nextCode = `CUST-${String(nextId).padStart(3, '0')}`
      const newCustomer: CustomerRow = {
        id: nextId,
        customerCode: nextCode,
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        balance: Number(formData.balance) || 0,
        taxNumber: formData.taxNumber,
        billingName: formData.billingName,
        billingPhone: formData.billingPhone,
        billingAddress: formData.billingAddress,
        billingCity: formData.billingCity,
        billingState: formData.billingState,
        billingCountry: formData.billingCountry,
        billingZip: formData.billingZip,
        shippingName: formData.shippingName,
        shippingPhone: formData.shippingPhone,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingState: formData.shippingState,
        shippingCountry: formData.shippingCountry,
        shippingZip: formData.shippingZip,
      }
      setRows((prev) => [newCustomer, ...prev])
    }

    handleDialogOpenChange(false)
  }

  const handleEdit = (customer: CustomerRow) => {
    setEditingId(customer.id)
    setFormData({
      name: customer.name,
      contact: customer.contact,
      email: customer.email,
      taxNumber: customer.taxNumber || '',
      balance: String(customer.balance ?? 0),
      billingName: customer.billingName || '',
      billingPhone: customer.billingPhone || '',
      billingAddress: customer.billingAddress || '',
      billingCity: customer.billingCity || '',
      billingState: customer.billingState || '',
      billingCountry: customer.billingCountry || '',
      billingZip: customer.billingZip || '',
      shippingName: customer.shippingName || '',
      shippingPhone: customer.shippingPhone || '',
      shippingAddress: customer.shippingAddress || '',
      shippingCity: customer.shippingCity || '',
      shippingState: customer.shippingState || '',
      shippingCountry: customer.shippingCountry || '',
      shippingZip: customer.shippingZip || '',
    })
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (customer: CustomerRow) => {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!customerToDelete) return
    setRows((prev) => prev.filter((c) => c.id !== customerToDelete.id))
    setCustomerToDelete(null)
    setDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Customer</CardTitle>
            <CardDescription>Manage customers, contacts, and balances.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="shadow-none h-7 px-4 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                title="Import"
              >
                <FileUp className="mr-2 h-4 w-4" />
                Import Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Import customer CSV file</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to import customers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input id="csv-file" type="file" accept=".csv" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="shadow-none" onClick={() => setImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="blue" className="shadow-none">
                  Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
            title="Export"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Customer
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
                Create Customer
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-[70vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Customer' : 'Create Customer'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="space-y-6 py-4">
                {/* Basic Info Section */}
                <div>
                  <h5 className="text-sm font-semibold mb-4">Basic Info</h5>
                  <div className="grid grid-cols-3 gap-4">
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
                        step="0.01"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        placeholder="Enter Balance"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address Section */}
                <div>
                  <h5 className="text-sm font-semibold mb-4">Billing Address</h5>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-2 col-span-2">
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

                {/* Shipping Address Section */}
                <div>
                  <div className="flex justify-end mb-4">
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
                  <h5 className="text-sm font-semibold mb-4">Shipping Address</h5>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-2 col-span-2">
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
                <Button variant="outline" type="button" className="shadow-none" onClick={() => handleDialogOpenChange(false)}>
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

      {/* Customers Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Customer List</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
              />
              {search.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
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
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-6">
                      <Button variant="outline" size="sm" className="shadow-none">
                        {customer.customerCode}
                      </Button>
                    </TableCell>
                    <TableCell className="px-6 font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="px-6">
                      {customer.contact}
                    </TableCell>
                    <TableCell className="px-6">
                      {customer.email}
                    </TableCell>
                    <TableCell className="px-6">
                      Rp {customer.balance.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                          title="Edit"
                          onClick={() => handleEdit(customer)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                          title="Delete"
                          onClick={() => handleDeleteClick(customer)}
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
                    No customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCustomerToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

