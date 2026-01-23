'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

type BillCreatePageProps = {
  params: { id: string }
}

type BillItem = {
  id: string
  productId: string
  quantity: number
  price: number
  discount: number
  taxRate: number
}

const mockVendors = [
  { id: '1', name: 'PT Supply Berkah' },
  { id: '2', name: 'CV Logistik Nusantara' },
  { id: '3', name: 'PT Teknologi Digital' },
]

const mockCategories = [
  { id: 'office', name: 'Office Supplies' },
  { id: 'logistics', name: 'Logistics' },
  { id: 'services', name: 'Services' },
]

const mockProducts = [
  { id: 'p1', name: 'Printer Paper A4', purchasePrice: 65000 },
  { id: 'p2', name: 'Courier Service', purchasePrice: 250000 },
  { id: 'p3', name: 'IT Maintenance', purchasePrice: 1200000 },
]

const mockTaxes = [
  { id: 'none', name: 'No Tax', rate: 0 },
  { id: 'ppn11', name: 'PPN', rate: 11 },
]

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function calcItemTax(price: number, quantity: number, discount: number, taxRate: number) {
  const base = Math.max(0, price * quantity - discount)
  return (taxRate / 100) * base
}

function calcItemAmount(item: BillItem) {
  const base = Math.max(0, item.price * item.quantity - item.discount)
  const tax = calcItemTax(item.price, item.quantity, item.discount, item.taxRate)
  return base + tax
}

export default function BillCreatePage({ params }: BillCreatePageProps) {
  const billNumber = useMemo(() => {
    // mimic Laravel `$bill_number` read-only field
    return `BILL-${new Date().getFullYear()}-001`
  }, [])

  const [formData, setFormData] = useState({
    vendorId: '',
    billDate: '',
    dueDate: '',
    categoryId: '',
    orderNumber: '',
    notes: '',
  })

  const [items, setItems] = useState<BillItem[]>([
    {
      id: 'row-1',
      productId: '',
      quantity: 1,
      price: 0,
      discount: 0,
      taxRate: 0,
    },
  ])

  const totals = useMemo(() => {
    const subTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const totalDiscount = items.reduce((sum, i) => sum + i.discount, 0)
    const totalTax = items.reduce((sum, i) => sum + calcItemTax(i.price, i.quantity, i.discount, i.taxRate), 0)
    const totalAmount = Math.max(0, subTotal - totalDiscount + totalTax)
    return { subTotal, totalDiscount, totalTax, totalAmount }
  }, [items])

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `row-${prev.length + 1}`,
        productId: '',
        quantity: 1,
        price: 0,
        discount: 0,
        taxRate: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((i) => i.id !== id)))
  }

  const updateItem = (id: string, patch: Partial<BillItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to API
    console.log('Create Bill:', { params, formData, billNumber, items })
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Bill Create</h1>
              </div>
              <Button asChild variant="outline" size="sm" className="shadow-none h-7">
                <Link href="/accounting/purchases?tab=bill">Back</Link>
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Header form card (Vendor / Dates / Bill Number / Category / Order Number) */}
              <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor">
                        Vendor <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.vendorId}
                        onValueChange={(value) => setFormData({ ...formData, vendorId: value })}
                        required
                      >
                        <SelectTrigger id="vendor" className="h-9">
                          <SelectValue placeholder="Select Vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockVendors.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Create vendor here.{' '}
                        <Link className="font-medium text-primary" href="/accounting/purchases?tab=supplier">
                          Create vendor
                        </Link>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billDate">
                          Bill Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="billDate"
                          type="date"
                          value={formData.billDate}
                          onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                          className="h-9"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">
                          Due Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="h-9"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billNumber">Bill Number</Label>
                        <Input id="billNumber" value={billNumber} readOnly className="h-9 bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                          required
                        >
                          <SelectTrigger id="category" className="h-9">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockCategories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Create category here.{' '}
                          <Link className="font-medium text-primary" href="/accounting/setup?tab=category">
                            Create category
                          </Link>
                        </p>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="orderNumber">Order Number</Label>
                        <Input
                          id="orderNumber"
                          value={formData.orderNumber}
                          onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                          placeholder="Enter Order Number"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product & Services */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Product & Services</h2>
                <Button type="button" variant="blue" size="sm" className="shadow-none h-7" onClick={addItem}>
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>

              <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <Table className="w-full min-w-full table-auto">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-4 py-3 min-w-[220px]">Items *</TableHead>
                          <TableHead className="px-4 py-3 min-w-[120px]">Quantity *</TableHead>
                          <TableHead className="px-4 py-3 min-w-[140px]">Price *</TableHead>
                          <TableHead className="px-4 py-3 min-w-[140px]">Discount *</TableHead>
                          <TableHead className="px-4 py-3 min-w-[140px]">Tax (%)</TableHead>
                          <TableHead className="px-4 py-3 min-w-[160px] text-right">
                            Amount
                            <br />
                            <small className="text-red-500 font-medium">after tax & discount</small>
                          </TableHead>
                          <TableHead className="px-4 py-3 w-[60px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="px-4 py-3">
                              <Select
                                value={item.productId}
                                onValueChange={(value) => {
                                  const p = mockProducts.find((x) => x.id === value)
                                  updateItem(item.id, {
                                    productId: value,
                                    price: p?.purchasePrice ?? 0,
                                  })
                                }}
                                required
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select Item" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockProducts.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>

                            <TableCell className="px-4 py-3">
                              <Input
                                className="h-9"
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value || 0) })}
                                required
                              />
                            </TableCell>

                            <TableCell className="px-4 py-3">
                              <Input
                                className="h-9"
                                type="number"
                                min={0}
                                value={item.price}
                                onChange={(e) => updateItem(item.id, { price: Number(e.target.value || 0) })}
                                required
                              />
                            </TableCell>

                            <TableCell className="px-4 py-3">
                              <Input
                                className="h-9"
                                type="number"
                                min={0}
                                value={item.discount}
                                onChange={(e) => updateItem(item.id, { discount: Number(e.target.value || 0) })}
                                required
                              />
                            </TableCell>

                            <TableCell className="px-4 py-3">
                              <Select
                                value={String(item.taxRate)}
                                onValueChange={(value) => updateItem(item.id, { taxRate: Number(value) })}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Tax" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockTaxes.map((t) => (
                                    <SelectItem key={t.id} value={String(t.rate)}>
                                      {t.name} ({t.rate}%)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>

                            <TableCell className="px-4 py-3 text-right font-medium">
                              {formatPrice(calcItemAmount(item))}
                            </TableCell>

                            <TableCell className="px-4 py-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                title="Delete"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="p-4 border-t grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sub Total</span>
                      <span className="font-medium">{formatPrice(totals.subTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium">{formatPrice(totals.totalDiscount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">{formatPrice(totals.totalTax)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 mt-2">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">{formatPrice(totals.totalAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Enter notes"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-2">
                <Button asChild type="button" variant="outline" size="sm" className="shadow-none h-7">
                  <Link href="/accounting/purchases?tab=bill">Cancel</Link>
                </Button>
                <Button type="submit" variant="blue" size="sm" className="shadow-none h-7">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


