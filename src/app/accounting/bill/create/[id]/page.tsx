'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useParams, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

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
import { toast } from 'sonner'

type VendorOption = { id: string; name: string }
type CategoryOption = { id: string; name: string }
type ProductOption = { id: string; name: string; purchasePrice: number }
type TaxOption = { id: string; name: string; rate: number }

type BillItem = {
  id: string
  productId: string
  quantity: number
  price: number
  discount: number
  taxRate: number
}

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

export default function BillCreatePage() {
  const pathname = usePathname()
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const highlightStatus = searchParams.get('action') === 'status'

  const routeId = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    return last || (params?.id as string)
  }, [pathname, params])
  const isEdit = routeId !== 'new'

  const [billNumber, setBillNumber] = useState<string>('')
  const [vendors, setVendors] = useState<VendorOption[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [taxes, setTaxes] = useState<TaxOption[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    vendorId: '',
    billDate: '',
    dueDate: '',
    categoryId: '',
    orderNumber: '',
    notes: '',
    status: 'draft',
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

  useEffect(() => {
    const loadBase = async () => {
      setLoading(true)
      setError(null)
      try {
        const [vendorsRes, categoriesRes, productsRes, taxesRes, billRes] = await Promise.all([
          fetch('/api/vendors').then((r) => r.json()).catch(() => ({ success: false })),
          fetch('/api/categories').then((r) => r.json()).catch(() => ({ success: false })),
          fetch('/api/products').then((r) => r.json()).catch(() => ({ success: false })),
          fetch('/api/taxes').then((r) => r.json()).catch(() => ({ success: false })),
          isEdit
            ? fetch(`/api/bills/${routeId}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false }))
            : Promise.resolve({ success: false }),
        ])

        if (vendorsRes?.success) {
          setVendors(vendorsRes.data.map((v: any) => ({ id: v.id as string, name: v.name as string })))
        }
        if (categoriesRes?.success) {
          setCategories(categoriesRes.data.map((c: any) => ({ id: c.id as string, name: c.name as string })))
        }
        let productOptions: ProductOption[] = []
        if (productsRes?.success) {
          productOptions = productsRes.data.map((p: any) => ({
            id: p.id as string,
            name: p.name as string,
            purchasePrice: Number(p.purchasePrice) || 0,
          }))
          setProducts(productOptions)
        }
        if (taxesRes?.success) {
          setTaxes(
            taxesRes.data.map((t: any) => ({
              id: t.id as string,
              name: t.name as string,
              rate: Number(t.rate) || 0,
            })),
          )
        }

        if (isEdit && billRes?.success && billRes.data) {
          const b = billRes.data
          setBillNumber(b.billId as string)
          setFormData({
            vendorId: b.vendorId as string,
            billDate: b.billDate?.slice(0, 10) ?? '',
            dueDate: b.dueDate?.slice(0, 10) ?? '',
            categoryId: (b as any).categoryId ?? '',
            orderNumber: b.reference ?? '',
            notes: b.description ?? '',
            status: (b as any).status ?? 'draft',
          })
          if (Array.isArray(b.items) && b.items.length > 0) {
            const productNameToId = new Map(productOptions.map((p) => [p.name, p.id] as const))
            setItems(
              b.items.map((it: any, idx: number) => {
                const name = typeof it.itemName === 'string' ? it.itemName : ''
                const matchedProductId = name ? productNameToId.get(name) ?? '' : ''
                return {
                  id: `row-${idx + 1}`,
                  productId: it.productId ?? matchedProductId,
                  quantity: Number(it.quantity) || 1,
                  price: Number(it.price) || 0,
                  discount: Number(it.discount) || 0,
                  taxRate: Number(it.taxRate) || 0,
                }
              }),
            )
          }
        } else {
          const generated = `BILL-${new Date().getFullYear()}-${String(
            Math.floor(Math.random() * 999) + 1,
          ).padStart(3, '0')}`
          setBillNumber(generated)
        }
      } catch (e: any) {
        const message = e?.message || 'Gagal memuat data bill'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    loadBase()
  }, [isEdit, routeId])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        billId: billNumber,
        vendorId: formData.vendorId,
        billDate: formData.billDate,
        dueDate: formData.dueDate,
        categoryId: formData.categoryId,
        reference: formData.orderNumber,
        description: formData.notes,
        total: totals.totalAmount,
        items: items.map((it) => ({
          productId: it.productId || null,
          itemName:
            products.find((p) => p.id === it.productId)?.name ||
            `Item ${it.id}`,
          quantity: it.quantity,
          price: it.price,
          discount: it.discount,
          taxRate: it.taxRate,
        })),
        status: formData.status,
      }

      const res = await fetch(isEdit ? `/api/bills/${routeId}` : '/api/bills', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        const message = json?.message || 'Gagal menyimpan bill'
        setError(message)
        toast.error(message)
        setSaving(false)
        return
      }
      toast.success(isEdit ? 'Bill berhasil diperbarui' : 'Bill berhasil dibuat')
      window.location.href = `/accounting/bill/${json.data?.billId || billNumber}`
    } catch (e: any) {
      const message = e?.message || 'Gagal menyimpan bill'
      setError(message)
      toast.error(message)
      setSaving(false)
    }
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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  {isEdit ? 'Edit Bill' : 'Create Bill'}
                </h1>
              </div>
              <Button asChild variant="outline" size="sm" className="shadow-none h-7">
                <Link href="/accounting/purchases?tab=bill">Back</Link>
              </Button>
            </div>

            {error && (
              <div className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-xs text-muted-foreground">
                Loading bill data...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Header form card (Vendor / Dates / Bill Number / Category / Order Number) */}
              <Card className="border-0 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
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
                          {vendors.map((v) => (
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
                          {categories.map((c) => (
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

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger
                            id="status"
                            className={cn(
                              "h-9",
                              highlightStatus && "animate-pulse ring-2 ring-blue-400",
                            )}
                          >
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
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

              <Card className="border-0 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
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
                                  const p = products.find((x) => x.id === value)
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
                                  {products.map((p) => (
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
                                  {taxes.map((t) => (
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

              <Card className="border-0 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
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
                <Button
                  type="submit"
                  variant="blue"
                  size="sm"
                  className="shadow-none h-7"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : isEdit ? 'Update Bill' : 'Create Bill'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


