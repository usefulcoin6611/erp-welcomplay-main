"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, Pencil, Trash2, Plus, Search, RefreshCw, FileUp, FileDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Types
interface ProductService {
  id: string
  name: string
  sku: string
  sale_price: number
  purchase_price: number
  tax?: string
  category: string
  unit: string
  quantity?: number
  type: 'product' | 'service'
}

// Mock data
const mockProducts: ProductService[] = [
  {
    id: '1',
    name: 'Lisensi ERP Cloud',
    sku: 'ERP-CLD-001',
    sale_price: 25000000,
    purchase_price: 15000000,
    tax: 'PPN 11%',
    category: 'Software',
    unit: 'Paket',
    quantity: 120,
    type: 'product',
  },
  {
    id: '2',
    name: 'Implementasi Onsite',
    sku: 'IMP-ONS-002',
    sale_price: 15000000,
    purchase_price: 8000000,
    tax: 'PPN 11%',
    category: 'Jasa',
    unit: 'Hari',
    quantity: 0,
    type: 'service',
  },
  {
    id: '3',
    name: 'Maintenance Service',
    sku: 'MAINT-003',
    sale_price: 5000000,
    purchase_price: 0,
    tax: 'PPN 11%',
    category: 'Jasa',
    unit: '-',
    quantity: 0,
    type: 'service',
  },
  {
    id: '4',
    name: 'Laptop Dell XPS 13',
    sku: 'LAP-DELL-004',
    sale_price: 18000000,
    purchase_price: 12000000,
    tax: 'PPN 11%',
    category: 'Electronics',
    unit: 'Pcs',
    quantity: 45,
    type: 'product',
  },
]

const categories = ['All Categories', 'Software', 'Jasa', 'Electronics', 'Accessories']
const formCategories = ['Software', 'Jasa', 'Electronics', 'Accessories']
const units = ['Paket', 'Hari', 'Pcs', 'Box', '-']
const taxes = ['PPN 11%', 'PPN 10%', 'No Tax']

// Format currency to Rupiah
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ProductServicesPage() {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [type, setType] = useState<'product' | 'service'>('product')
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    sale_price: '',
    purchase_price: '',
    tax: '',
    category: '',
    unit: '',
    quantity: '',
    description: '',
  })

  // Filtered data
  const filteredData = useMemo(() => {
    let result = mockProducts
    
    // Category filter
    if (selectedCategory !== 'All Categories') {
      result = result.filter(p => p.category === selectedCategory)
    }
    return result
  }, [selectedCategory])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Handlers
  const handleApplyFilters = () => {
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSelectedCategory('All Categories')
    setCurrentPage(1)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this product/service?')) return
    // Handle delete logic here
    console.log('Delete:', id)
  }

  const generateSKU = () => {
    const random = Math.random().toString(36).substring(2, 9).toUpperCase()
    setFormData({ ...formData, sku: `SKU-${random}` })
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', { ...formData, type })
    // Reset form and close dialog
    setFormData({
      name: '',
      sku: '',
      sale_price: '',
      purchase_price: '',
      tax: '',
      category: '',
      unit: '',
      quantity: '',
      description: '',
    })
    setType('product')
    setDialogOpen(false)
    // Optionally refresh the list or add the new item
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        name: '',
        sku: '',
        sale_price: '',
        purchase_price: '',
        tax: '',
        category: '',
        unit: '',
        quantity: '',
        description: '',
      })
      setType('product')
    }
  }

  // Pagination calculations
  const totalRecords = filteredData.length
  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {/* Title Tab */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg font-semibold">Product & Services</CardTitle>
                  <CardDescription>Manage products and services, pricing, tax, and stock quantity.</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="shadow-none h-7 px-4 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                  title="Import"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Import Product & Services
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                  title="Export"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export Product & Services
                </Button>
                <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none h-7 px-4" title="Create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Product & Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Product & Service</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2">
                          <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter Name"
                            required
                          />
                        </div>

                        {/* SKU */}
                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                          <div className="flex gap-2">
                            <Input
                              id="sku"
                              value={formData.sku}
                              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                              placeholder="Enter SKU"
                              required
                              className="flex-1"
                            />
                            <Button type="button" variant="outline" onClick={generateSKU}>
                              Generate
                            </Button>
                          </div>
                        </div>

                        {/* Sale Price */}
                        <div className="space-y-2">
                          <Label htmlFor="sale_price">Sale Price <span className="text-red-500">*</span></Label>
                          <Input
                            id="sale_price"
                            type="number"
                            value={formData.sale_price}
                            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                            placeholder="Enter Sale Price"
                            required
                            step="0.01"
                          />
                        </div>

                        {/* Purchase Price */}
                        <div className="space-y-2">
                          <Label htmlFor="purchase_price">Purchase Price <span className="text-red-500">*</span></Label>
                          <Input
                            id="purchase_price"
                            type="number"
                            value={formData.purchase_price}
                            onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                            placeholder="Enter Purchase Price"
                            required
                            step="0.01"
                          />
                        </div>

                        {/* Tax */}
                        <div className="space-y-2">
                          <Label htmlFor="tax">Tax</Label>
                          <Select value={formData.tax || undefined} onValueChange={(value) => setFormData({ ...formData, tax: value === 'no-tax' ? '' : value })}>
                            <SelectTrigger id="tax">
                              <SelectValue placeholder="Select Tax" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no-tax">No Tax</SelectItem>
                              {taxes.filter(t => t !== 'No Tax').map((tax) => (
                                <SelectItem key={tax} value={tax}>
                                  {tax}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                          <Select 
                            value={formData.category} 
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                            required
                          >
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {formCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Unit */}
                        <div className="space-y-2">
                          <Label htmlFor="unit">Unit <span className="text-red-500">*</span></Label>
                          <Select 
                            value={formData.unit} 
                            onValueChange={(value) => setFormData({ ...formData, unit: value })}
                            required
                          >
                            <SelectTrigger id="unit">
                              <SelectValue placeholder="Select Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Type */}
                        <div className="space-y-2">
                          <Label>Type <span className="text-red-500">*</span></Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="type-product"
                                name="type"
                                value="product"
                                checked={type === 'product'}
                                onChange={(e) => setType(e.target.value as 'product' | 'service')}
                                className="h-4 w-4"
                              />
                              <Label htmlFor="type-product" className="font-normal cursor-pointer">Product</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="type-service"
                                name="type"
                                value="service"
                                checked={type === 'service'}
                                onChange={(e) => setType(e.target.value as 'product' | 'service')}
                                className="h-4 w-4"
                              />
                              <Label htmlFor="type-service" className="font-normal cursor-pointer">Service</Label>
                            </div>
                          </div>
                        </div>

                        {/* Quantity - only show for product */}
                        {type === 'product' && (
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={formData.quantity}
                              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                              placeholder="Enter Quantity"
                              required={type === 'product'}
                            />
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter Description"
                          rows={3}
                        />
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDialogOpenChange(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="blue"
                          className="shadow-none"
                        >
                          Create
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Filters */}
            <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
              <CardContent className="px-6 py-4">
                <form
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_auto] md:justify-start"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleApplyFilters()
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="category-filter" className="text-sm font-medium">
                      Category
                    </Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger
                        id="category-filter"
                        className={`w-full !h-9 ${
                          selectedCategory === 'All Categories' ? 'text-muted-foreground' : ''
                        } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                      >
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 md:pt-6">
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

            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6">
                <CardTitle>All Product & Services</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Name</TableHead>
                        <TableHead className="px-6">Sku</TableHead>
                        <TableHead className="px-6">Sale Price</TableHead>
                        <TableHead className="px-6">Purchase Price</TableHead>
                        <TableHead className="px-6">Tax</TableHead>
                        <TableHead className="px-6">Category</TableHead>
                        <TableHead className="px-6">Unit</TableHead>
                        <TableHead className="px-6 text-right">Quantity</TableHead>
                        <TableHead className="px-6">Type</TableHead>
                        <TableHead className="px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="px-6 text-center py-8 text-muted-foreground">
                            No product & services found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((item) => (
                          <TableRow key={item.id} className="font-style">
                            <TableCell className="px-6 font-medium">{item.name}</TableCell>
                            <TableCell className="px-6 text-muted-foreground">{item.sku}</TableCell>
                            <TableCell className="px-6">{formatRupiah(item.sale_price)}</TableCell>
                            <TableCell className="px-6">{formatRupiah(item.purchase_price)}</TableCell>
                            <TableCell className="px-6">{item.tax || '-'}</TableCell>
                            <TableCell className="px-6">{item.category}</TableCell>
                            <TableCell className="px-6">{item.unit}</TableCell>
                            <TableCell className="px-6 text-right">
                              {item.type === 'product' ? item.quantity ?? 0 : '-'}
                            </TableCell>
                            <TableCell className="px-6 capitalize">{item.type}</TableCell>
                            <TableCell className="px-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                                  title="Warehouse Details"
                                >
                                  <Link href={`/products/services/${item.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                                  title="Edit"
                                >
                                  <Link href={`/products/services/${item.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  title="Delete"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalRecords > 0 && (
                  <div className="px-6 pb-6 pt-4">
                    <SimplePagination
                      currentPage={currentPage}
                      totalCount={totalRecords}
                      onPageChange={setCurrentPage}
                      pageSize={pageSize}
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
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

