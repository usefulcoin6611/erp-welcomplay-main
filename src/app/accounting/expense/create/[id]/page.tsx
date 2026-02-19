'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getEmployeesList } from '@/lib/employee-data'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type CategoryOption = { id: string; name: string }
type ProductOption = { id: string; name: string; purchasePrice: number; category?: string }
type TaxOption = { id: string; name: string; rate: number }
type EmployeeOption = { id: string; name: string }
type CustomerOption = { id: string; name: string }
type VendorOption = { id: string; name: string }

type ExpenseItem = {
  id: string
  productId: string
  quantity: number
  price: number
  discount: number
  taxRate: number
}

type ExpenseFormState = {
  date: string
  categoryId: string
  reference: string
  description: string
  type: string
  party: string
  status: string
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

function calcItemAmount(item: ExpenseItem) {
  const base = Math.max(0, item.price * item.quantity - item.discount)
  const tax = calcItemTax(item.price, item.quantity, item.discount, item.taxRate)
  return base + tax
}

export default function ExpenseCreatePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id ?? ''
  const isEdit = id && id !== '0'

  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [taxes, setTaxes] = useState<TaxOption[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [vendors, setVendors] = useState<VendorOption[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<ExpenseFormState>({
    date: '',
    categoryId: '',
    reference: '',
    description: '',
    type: 'Vendor',
    party: '',
    status: 'Pending',
  })

  const [items, setItems] = useState<ExpenseItem[]>([
    {
      id: 'row-1',
      productId: '',
      quantity: 1,
      price: 0,
      discount: 0,
      taxRate: 0,
    },
  ])
  const [initialTotal, setInitialTotal] = useState<number>(0)

  useEffect(() => {
    const loadBase = async () => {
      setLoading(true)
      setError(null)
      try {
        const [categoriesRes, productsRes, taxesRes, customersRes, vendorsRes, expenseRes] =
          await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false })),
          fetch('/api/products', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false })),
          fetch('/api/taxes', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false })),
            fetch('/api/customers', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false })),
            fetch('/api/vendors', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false })),
          isEdit
            ? fetch(`/api/expenses/${id}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ success: false }))
            : Promise.resolve({ success: false }),
        ])

        if (categoriesRes?.success && Array.isArray(categoriesRes.data)) {
          setCategories(
            categoriesRes.data
              .filter((c: any) => (c as any).type === 'Expense')
              .map((c: any) => ({ id: c.id as string, name: c.name as string })),
          )
        }

        let productOptions: ProductOption[] = []
        if (productsRes?.success && Array.isArray(productsRes.data)) {
          productOptions = productsRes.data.map((p: any) => ({
            id: p.id as string,
            name: p.name as string,
            purchasePrice: Number(p.purchasePrice) || 0,
            category: (p.category as string) ?? '',
          }))
          setProducts(productOptions)
        }

        if (taxesRes?.success && Array.isArray(taxesRes.data)) {
          setTaxes(
            taxesRes.data.map((t: any) => ({
              id: t.id as string,
              name: t.name as string,
              rate: Number(t.rate) || 0,
            })),
          )
        }

        const employeesList = getEmployeesList()
        const employeeOptions: EmployeeOption[] = employeesList.map((e) => ({
          id: String(e.employeeId),
          name: e.name,
        }))
        setEmployees(employeeOptions)

        let customerOptions: CustomerOption[] = []
        if (customersRes?.success && Array.isArray(customersRes.data)) {
          customerOptions = customersRes.data.map((c: any) => ({
            id: c.id as string,
            name: c.name as string,
          }))
          setCustomers(customerOptions)
        }

        let vendorOptions: VendorOption[] = []
        if (vendorsRes?.success && Array.isArray(vendorsRes.data)) {
          vendorOptions = vendorsRes.data.map((v: any) => ({
            id: v.id as string,
            name: v.name as string,
          }))
          setVendors(vendorOptions)
        }

        if (isEdit && expenseRes?.success && expenseRes.data) {
          const e = expenseRes.data as any
          const categoriesByName = new Map<string, string>(
            (categoriesRes.data as any[]).map((c: any) => [c.name as string, c.id as string]),
          )
          const categoryId: string = e.category
            ? categoriesByName.get(e.category as string) ?? ''
            : ''
          let nextSelectedEmployeeId = ''
          let nextSelectedCustomerId = ''
          let nextSelectedVendorId = ''
          if (e.type === 'Employee') {
            const match = employeeOptions.find((emp) => emp.name === e.party)
            nextSelectedEmployeeId = match?.id ?? ''
          } else if (e.type === 'Customer') {
            const match = customerOptions.find((c) => c.name === e.party)
            nextSelectedCustomerId = match?.id ?? ''
          } else if (e.type === 'Vendor') {
            const match = vendorOptions.find((v) => v.name === e.party)
            nextSelectedVendorId = match?.id ?? ''
          }
          setForm({
            date: e.date ? new Date(e.date).toISOString().slice(0, 10) : '',
            categoryId,
            reference: e.reference ?? '',
            description: e.description ?? '',
            type: e.type ?? 'Vendor',
            party: e.party ?? '',
            status: e.status ?? 'Pending',
          })
          setSelectedEmployeeId(nextSelectedEmployeeId)
          setSelectedCustomerId(nextSelectedCustomerId)
          setSelectedVendorId(nextSelectedVendorId)
          setInitialTotal(Number(e.total) || 0)
          if (Array.isArray(e.items) && e.items.length > 0) {
            setItems(
              e.items.map((it: any, index: number) => ({
                id: typeof it.id === 'string' && it.id ? it.id : `row-${index + 1}`,
                productId: it.productId ?? '',
                quantity: Number(it.quantity) || 0,
                price: Number(it.price) || 0,
                discount: Number(it.discount) || 0,
                taxRate: Number(it.taxRate) || 0,
              })),
            )
          } else {
            const normalizedDesc = (e.description ?? '').toString().trim().toLowerCase()
            const matchByName = normalizedDesc
              ? productOptions.find((p) => p.name.toLowerCase() === normalizedDesc)
              : undefined
            const chosen = matchByName
            setItems([
              {
                id: 'row-1',
                productId: chosen?.id ?? '',
                quantity: 1,
                price: chosen ? chosen.purchasePrice : 0,
                discount: 0,
                taxRate: 0,
              },
            ])
          }
        }
      } catch (e: any) {
        const message = e?.message || 'Gagal memuat data expense'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    loadBase()
  }, [id, isEdit])

  const totals = useMemo(() => {
    const subTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const totalDiscount = items.reduce((sum, i) => sum + i.discount, 0)
    const totalTax = items.reduce(
      (sum, i) => sum + calcItemTax(i.price, i.quantity, i.discount, i.taxRate),
      0,
    )
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

  const removeItem = (idItem: string) => {
    setItems((prev) => prev.filter((i) => i.id !== idItem))
  }

  const updateItem = (idItem: string, patch: Partial<ExpenseItem>) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === idItem)
      if (idx === -1) return prev
      const current = prev[idx]
      let next = [...prev]
      if (patch.productId) {
        const productId = patch.productId
        const prod = products.find((p) => p.id === productId)
        const dupIdx = prev.findIndex((i, j) => i.productId === productId && j !== idx)
        if (dupIdx !== -1) {
          // Merge quantities into existing row for the same product
          next[dupIdx] = {
            ...next[dupIdx],
            quantity: next[dupIdx].quantity + current.quantity,
            price: typeof prod?.purchasePrice === 'number' ? prod!.purchasePrice : next[dupIdx].price,
          }
          // Remove the current row
          next.splice(idx, 1)
          return next
        }
        // Set product and sync price from product purchasePrice
        next[idx] = {
          ...current,
          ...patch,
          price: typeof prod?.purchasePrice === 'number' ? prod!.purchasePrice : current.price,
        }
        return next
      }
      // Generic patch
      next[idx] = { ...current, ...patch }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.date || !form.party || !form.categoryId) {
      toast.error('Tanggal, Payer, dan Category wajib diisi')
      return
    }
    if (items.length > 0 && items.some((i) => !i.productId)) {
      toast.error('Pilih Product/Service untuk setiap item')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const categoryName =
        categories.find((c) => c.id === form.categoryId)?.name || form.categoryId
      const payload: any = {
        date: form.date,
        type: form.type,
        party: form.party,
        category: categoryName,
        total: isEdit ? (items.length > 0 ? totals.totalAmount : initialTotal) : totals.totalAmount,
        reference: form.reference || null,
        description: form.description || null,
        status: form.status || 'Pending',
      }
      if (items.length > 0) {
        payload.items = items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          discount: i.discount,
          taxRate: i.taxRate,
          description: null,
        }))
      }
      const res = await fetch(isEdit ? `/api/expenses/${id}` : '/api/expenses', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        const message = json?.message || 'Gagal menyimpan expense'
        setError(message)
        toast.error(message)
        setSaving(false)
        return
      }
      toast.success(isEdit ? 'Expense berhasil diupdate' : 'Expense berhasil dibuat')
      router.push('/accounting/purchases?tab=expense')
    } catch (e: any) {
      const message = e?.message || 'Terjadi kesalahan saat menyimpan expense'
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
                  {isEdit ? 'Edit Expense' : 'Create Expense'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit ? `Update expense ${id}` : 'Create a new expense record.'}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="shadow-none h-7">
                <Link href="/accounting/purchases?tab=expense">Back</Link>
              </Button>
            </div>

            {error && (
              <div className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-xs text-muted-foreground">Loading expense data...</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Card className="border-0 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <RadioGroup
                          value={form.type}
                          onValueChange={(value) => {
                            setForm((prev) => ({ ...prev, type: value, party: '' }))
                            setSelectedEmployeeId('')
                            setSelectedCustomerId('')
                            setSelectedVendorId('')
                          }}
                          className="flex flex-wrap gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Employee" id="type-employee" />
                            <Label htmlFor="type-employee" className="text-sm font-normal">
                              Employee
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Customer" id="type-customer" />
                            <Label htmlFor="type-customer" className="text-sm font-normal">
                              Customer
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Vendor" id="type-vendor" />
                            <Label htmlFor="type-vendor" className="text-sm font-normal">
                              Vendor
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Payee <span className="text-red-500">*</span>
                        </Label>
                        {form.type === 'Employee' && (
                          <>
                            <Select
                              value={selectedEmployeeId}
                              onValueChange={(value) => {
                                setSelectedEmployeeId(value)
                                const emp = employees.find((e) => e.id === value)
                                setForm((prev) => ({ ...prev, party: emp?.name ?? '' }))
                              }}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select Employee" />
                              </SelectTrigger>
                              <SelectContent>
                                {employees.map((emp) => (
                                  <SelectItem key={emp.id} value={emp.id}>
                                    {emp.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              Create employee here.{' '}
                              <Link
                                href="/hrm/employees"
                                className="font-medium text-primary"
                              >
                                Create employee
                              </Link>
                            </p>
                          </>
                        )}
                        {form.type === 'Customer' && (
                          <>
                            <Select
                              value={selectedCustomerId}
                              onValueChange={(value) => {
                                setSelectedCustomerId(value)
                                const customer = customers.find((c) => c.id === value)
                                setForm((prev) => ({ ...prev, party: customer?.name ?? '' }))
                              }}
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
                              Create customer here.{' '}
                              <span className="font-medium text-primary">
                                Create customer
                              </span>
                            </p>
                          </>
                        )}
                        {form.type === 'Vendor' && (
                          <>
                            <Select
                              value={selectedVendorId}
                              onValueChange={(value) => {
                                setSelectedVendorId(value)
                                const vendor = vendors.find((v) => v.id === value)
                                setForm((prev) => ({ ...prev, party: vendor?.name ?? '' }))
                              }}
                            >
                              <SelectTrigger className="h-9">
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
                          <Link
                            href="/accounting/purchases?tab=supplier"
                            className="font-medium text-primary"
                          >
                            Create vendor
                          </Link>
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">
                          Payment Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          className="h-9"
                          value={form.date}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, date: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={form.categoryId}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, categoryId: value }))
                          }
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
                          <Link
                            className="font-medium text-primary"
                            href="/accounting/setup/custom-field?tab=category"
                          >
                            Create category
                          </Link>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={form.status}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger id="status" className="h-9">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="reference">Reference</Label>
                        <Input
                          id="reference"
                          className="h-9"
                          placeholder="Enter Reference"
                          value={form.reference}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, reference: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Product & Services</h2>
                <Button
                  type="button"
                  variant="blue"
                  size="sm"
                  className="shadow-none h-7"
                  onClick={addItem}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
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
                            <small className="text-red-500 font-medium">
                              after tax & discount
                            </small>
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
                                  updateItem(item.id, { productId: value })
                                }}
                                required
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select Item">
                                    {item.productId
                                      ? products.find((p) => p.id === item.productId)?.name ??
                                        'Select Item'
                                      : 'Select Item'}
                                  </SelectValue>
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
                                onChange={(e) =>
                                  updateItem(item.id, {
                                    quantity: Number(e.target.value || 0),
                                  })
                                }
                                required
                              />
                            </TableCell>

                            <TableCell className="px-4 py-3">
                              <Input
                                className="h-9"
                                type="number"
                                min={0}
                                value={item.price}
                                readOnly
                                disabled
                              />
                            </TableCell>

                            <TableCell className="px-4 py-3">
                              <Input
                                className="h-9"
                                type="number"
                                min={0}
                                value={item.discount}
                                onChange={(e) =>
                                  updateItem(item.id, {
                                    discount: Number(e.target.value || 0),
                                  })
                                }
                                required
                              />
                            </TableCell>

                            <TableCell className="px-4 py-3">
                              <Select
                                value={String(item.taxRate)}
                                onValueChange={(value) =>
                                  updateItem(item.id, { taxRate: Number(value) })
                                }
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
                      <span className="font-semibold">
                        {formatPrice(totals.totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter Description"
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-2">
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-7"
                >
                  <Link href="/accounting/purchases?tab=expense">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  variant="blue"
                  size="sm"
                  className="shadow-none h-7 px-4"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : isEdit ? 'Update Expense' : 'Create Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
