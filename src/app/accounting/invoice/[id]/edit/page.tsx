'use client'

import { useEffect, useMemo, useState } from 'react'
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

type InvoiceEditPageProps = {
  params: Promise<{ id: string }>
}

type InvoiceItem = {
  id: string
  item: string
  quantity: string
  price: string
  discount: string
  taxRate: string
  description?: string
  amount: number
}

function calcItemAmount(item: InvoiceItem) {
  const quantity = parseFloat(item.quantity) || 0
  const price = parseFloat(item.price) || 0
  const discount = parseFloat(item.discount) || 0
  const taxRate = parseFloat(item.taxRate) || 0
  const subtotal = Math.max(0, quantity * price - discount)
  const tax = (taxRate / 100) * subtotal
  return subtotal + tax
}

export default function InvoiceEditPage({ params }: InvoiceEditPageProps) {
  const [invoiceId, setInvoiceId] = useState<string>('')
  const [loaded, setLoaded] = useState(false)
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  const [formData, setFormData] = useState({
    customerId: '',
    issueDate: '',
    dueDate: '',
    categoryId: '',
    refNumber: '',
    description: '',
  })
  const [items, setItems] = useState<InvoiceItem[]>([])

  useEffect(() => {
    const init = async () => {
      const { id } = await params
      setInvoiceId(id)
      const [inv, cust, cat] = await Promise.all([
        fetch(`/api/invoices/${id}`).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/customers').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/categories').then(r => r.json()).catch(() => ({ success: false })),
      ])
      if (cust?.success) setCustomers(cust.data.map((c: any) => ({ id: c.id, name: c.name })))
      if (cat?.success) setCategories(cat.data.map((c: any) => ({ id: c.id, name: c.name })))
      if (inv?.success && inv.data) {
        const e = inv.data
        setFormData({
          customerId: e.customerId,
          issueDate: new Date(e.issueDate).toISOString().slice(0, 10),
          dueDate: new Date(e.dueDate).toISOString().slice(0, 10),
          categoryId: e.categoryId || '',
          refNumber: '',
          description: e.description || '',
        })
        setItems(
          (e.items || []).map((it: any) => ({
            id: it.id,
            item: it.itemName,
            quantity: String(it.quantity),
            price: String(it.price),
            discount: String(it.discount),
            taxRate: String(it.taxRate),
            description: it.description || '',
            amount: it.amount || 0,
          })),
        )
      }
      setLoaded(true)
    }
    init()
  }, [params])

  const totals = useMemo(() => {
    const subTotal = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (parseFloat(i.quantity) || 0), 0)
    const totalDiscount = items.reduce((sum, i) => sum + (parseFloat(i.discount) || 0), 0)
    const totalTax = items.reduce((sum, i) => {
      const qty = parseFloat(i.quantity) || 0
      const price = parseFloat(i.price) || 0
      const disc = parseFloat(i.discount) || 0
      const rate = parseFloat(i.taxRate) || 0
      const base = Math.max(0, qty * price - disc)
      return sum + (rate / 100) * base
    }, 0)
    const totalAmount = Math.max(0, subTotal - totalDiscount + totalTax)
    return { subTotal, totalDiscount, totalTax, totalAmount }
  }, [items])

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `row-${prev.length + 1}`, item: '', quantity: '1', price: '0', discount: '0', taxRate: '0', amount: 0 },
    ])
  }

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((i) => i.id !== id)))
  }

  const updateItem = (id: string, patch: Partial<InvoiceItem>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const next = { ...i, ...patch }
        next.amount = calcItemAmount(next)
        return next
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`/api/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: formData.customerId,
        categoryId: formData.categoryId,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        description: formData.description,
        dueAmount: totals.totalAmount,
        items,
      }),
    })
    window.location.href = '/accounting/sales?tab=invoice'
  }

  if (!loaded) return null

  return (
    <SidebarProvider
      style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Invoice Edit</h1>
              </div>
              <Button asChild variant="outline" size="sm" className="shadow-none h-7">
                <Link href="/accounting/sales?tab=invoice">Back</Link>
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Customer <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.customerId}
                        onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                        required
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Create customer here. <span className="font-medium text-primary">Create customer</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          Issue Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={formData.issueDate}
                          onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Due Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Invoice Number</Label>
                        <Input value={invoiceId} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                          required
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Create category here.{' '}
                          <Link className="font-medium text-primary" href="/accounting/setup/custom-field?tab=category">
                            Create category
                          </Link>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Ref Number</Label>
                        <Input
                          value={formData.refNumber}
                          onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })}
                          placeholder="Enter Ref Number"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-base font-medium">Invoice Items</h5>
                    <Button type="button" variant="blue" size="sm" className="shadow-none h-7" onClick={addItem}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add item
                    </Button>
                  </div>
                  <div className="mt-3 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[220px]">Item/Service</TableHead>
                          <TableHead className="min-w-[120px]">Quantity</TableHead>
                          <TableHead className="min-w-[140px]">Unit Price</TableHead>
                          <TableHead className="min-w-[130px]">Discount</TableHead>
                          <TableHead className="min-w-[130px]">Tax (%)</TableHead>
                          <TableHead className="text-right min-w-[150px]">Amount</TableHead>
                          <TableHead className="min-w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((it) => (
                          <TableRow key={it.id}>
                            <TableCell>
                              <Input
                                value={it.item}
                                onChange={(e) => updateItem(it.id, { item: e.target.value })}
                                placeholder="Describe item/service"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={it.quantity}
                                onChange={(e) => updateItem(it.id, { quantity: e.target.value })}
                                min="0"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={it.price}
                                onChange={(e) => updateItem(it.id, { price: e.target.value })}
                                min="0"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={it.discount}
                                onChange={(e) => updateItem(it.id, { discount: e.target.value })}
                                min="0"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={it.taxRate}
                                onChange={(e) => updateItem(it.id, { taxRate: e.target.value })}
                                min="0"
                                step="0.01"
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              Rp {it.amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                onClick={() => removeItem(it.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">Sub Total (Rp)</span>
                        <span className="font-semibold">
                          Rp {totals.subTotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Discount (Rp)</span>
                        <span className="font-semibold">
                          Rp {totals.totalDiscount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Tax (Rp)</span>
                        <span className="font-semibold">
                          Rp {totals.totalTax.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between border-t-2 pt-2">
                        <span className="font-semibold text-blue-600">Total Amount (Rp)</span>
                        <span className="font-semibold text-blue-600">
                          Rp {totals.totalAmount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-2">
                <Button asChild type="button" variant="outline" size="sm" className="shadow-none h-7">
                  <Link href="/accounting/sales?tab=invoice">Cancel</Link>
                </Button>
                <Button type="submit" variant="blue" size="sm" className="shadow-none h-7">
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
