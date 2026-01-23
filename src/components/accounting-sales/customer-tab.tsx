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
  const [importDialogOpen, setImportDialogOpen] = useState(false)
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

  // Filter customers by search
  const filteredCustomers = customers.filter((customer) => {
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

  return (
    <div className="space-y-4">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="!bg-amber-600 hover:!bg-amber-700 !text-white !border-amber-600 shadow-none h-7" title="Import">
              <FileUp className="h-3 w-3" />
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
        <Button variant="secondary" size="sm" className="shadow-none h-7" title="Export">
          <FileDown className="h-3 w-3" />
        </Button>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7" title="Create">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[70vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Customer</DialogTitle>
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

      {/* Search */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

      {/* Customers Table */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            Manage and view all your customers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
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
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-4 py-3">
                      <Button variant="outline" size="sm" className="shadow-none">
                        {customer.customerCode}
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {customer.contact}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {customer.email}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      Rp {customer.balance.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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

