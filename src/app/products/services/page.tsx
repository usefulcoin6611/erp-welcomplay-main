"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RotateCcw, Search, FileSpreadsheet, FileDown, Plus, Upload, Download, Eye, Pencil, Trash, Package, ShoppingBag, DollarSign } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

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
  const [search, setSearch] = useState('')
  
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
    
    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q)
      )
    }
    
    return result
  }, [selectedCategory, search])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalProducts = filteredData.filter(p => p.type === 'product').length
    const totalServices = filteredData.filter(p => p.type === 'service').length
    const totalItems = filteredData.length
    const totalValue = filteredData.reduce((sum, p) => sum + (p.purchase_price * (p.quantity || 0)), 0)

    return {
      totalItems,
      totalProducts,
      totalServices,
      totalValue,
    }
  }, [filteredData])

  // Handlers
  const handleApplyFilters = () => {
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSelectedCategory('All Categories')
    setSearch('')
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
  const totalPages = Math.ceil(totalRecords / pageSize)

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">Product & Services</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your products and services</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="shadow-none">
                  <Upload className="mr-2 h-4 w-4" /> Import
                </Button>
                <Button variant="outline" size="sm" className="shadow-none">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none">
                      <Plus className="mr-2 h-4 w-4" /> Create
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Product & Service</DialogTitle>
                      <DialogDescription>
                        Add a new product or service to your inventory
                      </DialogDescription>
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
            </div>

            {/* Filter Section */}
            <Card className="shadow-none">
              <CardContent className="px-4 py-2">
                <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                  {/* Category */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger id="category" className="h-9 w-full bg-white dark:bg-gray-700 shadow-xs border-gray-200 dark:border-gray-600">
                        <SelectValue placeholder="All Categories" />
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

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:ml-auto">
                    <Button
                      size="sm"
                      variant="blue"
                      onClick={handleApplyFilters}
                      className="h-9 px-4 shadow-none"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="h-9 px-3 shadow-none"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 shadow-none"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      variant="blue"
                      className="h-9 px-4 shadow-none"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-none">
                <CardContent className="px-3 py-2 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Total Items</p>
                    <p className="text-lg font-bold">{summaryStats.totalItems}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardContent className="px-3 py-2 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                    <ShoppingBag className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Products</p>
                    <p className="text-lg font-bold text-green-600">{summaryStats.totalProducts}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardContent className="px-3 py-2 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Services</p>
                    <p className="text-lg font-bold text-purple-600">{summaryStats.totalServices}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardContent className="px-3 py-2 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="text-lg font-bold text-orange-600">{formatRupiah(summaryStats.totalValue)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Card>
              <div className="pt-4 pb-0">
                <div className="px-6 mb-3">
                  <CardTitle className="text-base">Product & Services List</CardTitle>
                </div>
              </div>

              <CardContent className="pt-0">
                <div style={{ minHeight: '400px' }}>
                  <div className="p-4 space-y-4">
                    {/* Table */}
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">SKU</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Sale Price</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Purchase Price</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Tax</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Category</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Unit</th>
                            <th className="px-3 py-2 text-right text-xs font-medium">Quantity</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Type</th>
                            <th className="px-3 py-2 text-center text-xs font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                                No products or services found
                              </td>
                            </tr>
                          ) : (
                            paginatedData.map((item) => (
                              <tr key={item.id} className="border-t hover:bg-muted/50">
                                <td className="px-3 py-2 text-sm font-medium">{item.name}</td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">{item.sku}</td>
                                <td className="px-3 py-2 text-sm">{formatRupiah(item.sale_price)}</td>
                                <td className="px-3 py-2 text-sm">{formatRupiah(item.purchase_price)}</td>
                                <td className="px-3 py-2 text-sm">{item.tax || '-'}</td>
                                <td className="px-3 py-2 text-sm">{item.category}</td>
                                <td className="px-3 py-2 text-sm">{item.unit}</td>
                                <td className="px-3 py-2 text-sm text-right">
                                  {item.type === 'product' ? (
                                    <span className="font-medium">{item.quantity ?? 0}</span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <span className="text-blue-600 font-medium capitalize">{item.type}</span>
                                </td>
                                <td className="px-3 py-2 text-sm text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      asChild
                                      variant="secondary"
                                      size="sm"
                                      className="shadow-none h-7 bg-gray-500 hover:bg-gray-600 text-white"
                                      title="View"
                                    >
                                      <Link href={`/products/services/${item.id}`}>
                                        <Eye className="w-4 h-4" />
                                      </Link>
                                    </Button>
                                    <Button
                                      asChild
                                      variant="blue"
                                      size="sm"
                                      className="shadow-none h-7"
                                      title="Edit"
                                    >
                                      <Link href={`/products/services/${item.id}/edit`}>
                                        <Pencil className="w-4 h-4" />
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="shadow-none h-7"
                                      title="Delete"
                                      onClick={() => handleDelete(item.id)}
                                    >
                                      <Trash className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalRecords > 0 && (
                      <div className="mt-4">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

