"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const categories = ['Software', 'Jasa', 'Electronics', 'Accessories']
const units = ['Paket', 'Hari', 'Pcs', 'Box', '-']
const taxes = ['PPN 11%', 'PPN 10%', 'No Tax']

export default function CreateProductServicePage() {
  const router = useRouter()
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

  const generateSKU = () => {
    const random = Math.random().toString(36).substring(2, 9).toUpperCase()
    setFormData({ ...formData, sku: `SKU-${random}` })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', { ...formData, type })
    // Redirect back to list page
    router.push('/products/services')
  }

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
                <h1 className="text-2xl font-bold">Create New Product & Service</h1>
                <p className="text-sm text-muted-foreground mt-1">Add a new product or service to your inventory</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/products/services">Cancel</Link>
              </Button>
            </div>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Product & Service Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                          {taxes.map((tax) => (
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
                          {categories.map((cat) => (
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

                  {/* Form Actions */}
                  <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="outline" asChild>
                      <Link href="/products/services">Cancel</Link>
                    </Button>
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                      Create
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

