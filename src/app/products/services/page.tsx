"use client"

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ProductService {
  id: string
  name: string
  sku: string
  sale_price: number
  purchase_price: number
  tax?: string
  category: string
  category_id?: string | null
  unit: string
  quantity?: number
  type: 'product' | 'service'
  sale_account_id?: string | null
  expense_account_id?: string | null
}

interface ProductCategory {
  id: string
  name: string
  type: string
}

interface ChartAccount {
  id: string
  name: string
  code: string
  type: string
  subType: string
}

const EXCLUDED_SUB_TYPES = ['Accounts Receivable', 'Accounts Payable']

const units = ['Piece', 'Box', 'Pack', 'Kg', 'Litre', 'Meter', 'Hour', 'Day']
const taxes = ['PPN 11%', 'PPN 0% (Zero Rated)', 'PPh 21 5%', 'PPh 23 2%', 'No Tax']

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewItem, setViewItem] = useState<ProductService | null>(null)
  const [deleteItem, setDeleteItem] = useState<ProductService | null>(null)
  const [type, setType] = useState<'product' | 'service'>('product')
  const [products, setProducts] = useState<ProductService[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    sale_price: '',
    sale_account: '',
    purchase_price: '',
    expense_account: '',
    tax: '',
    category: '',
    unit: '',
    quantity: '',
    image: null as File | null,
    description: '',
  })
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        setLoadingAccounts(true)

        const [productRes, serviceRes, categoryRes, chartRes] = await Promise.all([
          fetch('/api/products?type=product'),
          fetch('/api/products?type=service'),
          fetch('/api/categories'),
          fetch('/api/chart-of-accounts'),
        ])

        const productJson = await productRes.json().catch(() => null)
        const serviceJson = await serviceRes.json().catch(() => null)
        const categoryJson = await categoryRes.json().catch(() => null)
        const chartJson = await chartRes.json().catch(() => null)

        if (
          productRes.status === 401 ||
          serviceRes.status === 401 ||
          categoryRes.status === 401 ||
          chartRes.status === 401
        ) {
          setProducts([])
          setCategories([])
          setChartAccounts([])
          return
        }

        const items: ProductService[] = []

        if (productJson?.success && Array.isArray(productJson.data)) {
          for (const p of productJson.data as any[]) {
            items.push({
              id: p.id as string,
              name: p.name as string,
              sku: p.sku as string,
              sale_price: Number(p.salePrice) || 0,
              purchase_price: Number(p.purchasePrice) || 0,
              tax: (p.tax as string) || '',
              category_id: (p.categoryId as string) ?? null,
              category: (p.category as string) || '',
              unit: (p.unit as string) || '',
              quantity: typeof p.quantity === 'number' ? p.quantity : undefined,
              type: (p.type as 'product' | 'service') || 'product',
              sale_account_id: (p.saleAccountId as string) ?? null,
              expense_account_id: (p.expenseAccountId as string) ?? null,
            })
          }
        }

        if (serviceJson?.success && Array.isArray(serviceJson.data)) {
          for (const p of serviceJson.data as any[]) {
            items.push({
              id: p.id as string,
              name: p.name as string,
              sku: p.sku as string,
              sale_price: Number(p.salePrice) || 0,
              purchase_price: Number(p.purchasePrice) || 0,
              tax: (p.tax as string) || '',
              category_id: (p.categoryId as string) ?? null,
              category: (p.category as string) || '',
              unit: (p.unit as string) || '',
              quantity: typeof p.quantity === 'number' ? p.quantity : undefined,
              type: (p.type as 'product' | 'service') || 'product',
              sale_account_id: (p.saleAccountId as string) ?? null,
              expense_account_id: (p.expenseAccountId as string) ?? null,
            })
          }
        }

        setProducts(items)
        if (categoryJson?.success && Array.isArray(categoryJson.data)) {
          const filtered = (categoryJson.data as any[]).filter(
            (c) => c.type === 'Product & Service',
          )
          setCategories(
            filtered.map((c) => ({
              id: c.id as string,
              name: c.name as string,
              type: c.type as string,
            })),
          )
        } else {
          setCategories([])
        }

        if (chartJson?.success && Array.isArray(chartJson.data)) {
          setChartAccounts(
            (chartJson.data as any[]).map((a) => ({
              id: a.id as string,
              name: a.name as string,
              code: a.code as string,
              type: a.type as string,
              subType: a.subType as string,
            })),
          )
        } else {
          setChartAccounts([])
        }
      } catch {
        const msg = 'Gagal memuat data product & services'
        setError(msg)
        toast.error(msg)
        setProducts([])
        setCategories([])
        setChartAccounts([])
      } finally {
        setLoading(false)
        setLoadingAccounts(false)
      }
    }

    loadData()
  }, [])

  const incomeAccountGroups = useMemo(() => {
    const allowedTypes = ['Assets', 'Liabilities', 'Income']

    const filteredAccounts = chartAccounts.filter(
      (a) =>
        allowedTypes.includes(a.type) &&
        !EXCLUDED_SUB_TYPES.includes(a.subType),
    )

    const groupedByType = filteredAccounts.reduce<Record<string, ChartAccount[]>>((acc, account) => {
      if (!acc[account.type]) acc[account.type] = []
      acc[account.type].push(account)
      return acc
    }, {})

    return allowedTypes
      .filter((type) => groupedByType[type]?.length)
      .map((type) => {
        const accountsForType = groupedByType[type]
        const bySubType = accountsForType.reduce<Record<string, ChartAccount[]>>((acc, account) => {
          const key = account.subType || 'Other'
          if (!acc[key]) acc[key] = []
          acc[key].push(account)
          return acc
        }, {})

        const subTypes = Object.entries(bySubType)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([subType, accounts]) => ({
            subType,
            accounts: accounts.sort((a, b) => a.code.localeCompare(b.code)),
          }))

        return {
          type,
          subTypes,
        }
      })
  }, [chartAccounts])

  const expenseAccountGroups = useMemo(() => {
    const allowedTypes = ['Assets', 'Liabilities', 'Expenses', 'Costs of Goods Sold']

    const filteredAccounts = chartAccounts.filter(
      (a) =>
        allowedTypes.includes(a.type) &&
        !EXCLUDED_SUB_TYPES.includes(a.subType),
    )

    const groupedByType = filteredAccounts.reduce<Record<string, ChartAccount[]>>((acc, account) => {
      if (!acc[account.type]) acc[account.type] = []
      acc[account.type].push(account)
      return acc
    }, {})

    return allowedTypes
      .filter((type) => groupedByType[type]?.length)
      .map((type) => {
        const accountsForType = groupedByType[type]
        const bySubType = accountsForType.reduce<Record<string, ChartAccount[]>>((acc, account) => {
          const key = account.subType || 'Other'
          if (!acc[key]) acc[key] = []
          acc[key].push(account)
          return acc
        }, {})

        const subTypes = Object.entries(bySubType)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([subType, accounts]) => ({
            subType,
            accounts: accounts.sort((a, b) => a.code.localeCompare(b.code)),
          }))

        return {
          type,
          subTypes,
        }
      })
  }, [chartAccounts])

  // Filtered data
  const filteredData = useMemo(() => {
    let result = products

    // Category filter
    if (selectedCategory !== 'All Categories') {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      )
    }

    return result
  }, [selectedCategory, search, products])

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
    setSearch('')
    setCurrentPage(1)
  }

  const handleDelete = (id: string) => {
    const target = products.find((p) => p.id === id) ?? null
    setDeleteItem(target)
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) return
    try {
      const res = await fetch(`/api/products/${deleteItem.id}`, {
        method: 'DELETE',
      })

      const json = await res.json().catch(() => null)

      if (!res.ok || json?.success === false) {
        const msg = json?.message || 'Gagal menghapus data product & services'
        setError(msg)
        toast.error(msg)
        return
      }

      setProducts((prev) => prev.filter((item) => item.id !== deleteItem.id))
      setDeleteItem(null)
      toast.success('Product & service berhasil dihapus')
    } catch {
      const msg = 'Gagal menghapus data product & services'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleOpenView = (item: ProductService) => {
    setViewItem(item)
    setViewOpen(true)
  }

  const handleOpenEdit = (item: ProductService) => {
    setEditingId(item.id)
    setType(item.type)
    setFormData({
      name: item.name,
      sku: item.sku,
      sale_price: String(item.sale_price),
      sale_account: item.sale_account_id ?? '',
      purchase_price: String(item.purchase_price),
      expense_account: item.expense_account_id ?? '',
      tax: item.tax ?? '',
      category: item.category_id || '',
      unit: item.unit,
      quantity: item.quantity ? String(item.quantity) : '',
      image: null,
      description: '',
    })
    setImagePreview('')
    setDialogOpen(true)
  }

  const generateSKU = () => {
    const random = Math.random().toString(36).substring(2, 9).toUpperCase()
    setFormData({ ...formData, sku: `SKU-${random}` })
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isEdit = !!editingId

    const salePrice = Number(formData.sale_price || 0)
    const purchasePrice = Number(formData.purchase_price || 0)
    const quantity =
      type === 'product' ? Number(formData.quantity || 0) || 0 : 0

    setSaving(true)
    setError(null)

    const payload = {
      name: formData.name,
      sku: formData.sku,
      salePrice,
      purchasePrice,
      quantity,
      type,
      taxName: formData.tax || null,
      categoryId: formData.category || null,
      unitName: formData.unit || null,
      saleAccountId: formData.sale_account || null,
      expenseAccountId: formData.expense_account || null,
    }

    try {
      let res: Response
      if (editingId) {
        res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      }

      const json = await res.json().catch(() => null)

      if (!res.ok || json?.success === false) {
        const msg = json?.message || 'Gagal menyimpan data product & services'
        setError(msg)
        toast.error(msg)
        return
      }

      const p = json.data
      const mapped: ProductService = {
        id: p.id as string,
        name: p.name as string,
        sku: p.sku as string,
        sale_price: Number(p.salePrice) || 0,
        purchase_price: Number(p.purchasePrice) || 0,
        tax: (p.tax as string) || '',
        category: (p.category as string) || '',
        unit: (p.unit as string) || '',
        quantity: typeof p.quantity === 'number' ? p.quantity : undefined,
        type: (p.type as 'product' | 'service') || 'product',
        sale_account_id: (p.saleAccountId as string) ?? null,
        expense_account_id: (p.expenseAccountId as string) ?? null,
      }

      if (editingId) {
        setProducts((prev) =>
          prev.map((item) => (item.id === editingId ? mapped : item)),
        )
      } else {
        setProducts((prev) => [mapped, ...prev])
      }

      setFormData({
        name: '',
        sku: '',
        sale_price: '',
        sale_account: '',
        purchase_price: '',
        expense_account: '',
        tax: '',
        category: '',
        unit: '',
        quantity: '',
        image: null,
        description: '',
      })
      setType('product')
      setDialogOpen(false)
      setEditingId(null)
      setImagePreview('')
      toast.success(
        isEdit
          ? 'Product & service berhasil diperbarui'
          : 'Product & service berhasil dibuat',
      )
    } catch {
      const msg = 'Gagal menyimpan data product & services'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        name: '',
        sku: '',
        sale_price: '',
        sale_account: '',
        purchase_price: '',
        expense_account: '',
        tax: '',
        category: '',
        unit: '',
        quantity: '',
        image: null,
        description: '',
      })
      setType('product')
      setEditingId(null)
      setImagePreview('')
      setError(null)
    }
  }

  const categoryOptions = useMemo(() => {
    if (!categories.length) {
      return ['All Categories']
    }
    return ['All Categories', ...categories.map((c) => c.name)]
  }, [categories])

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
                      <DialogTitle>{editingId ? 'Edit Product & Service' : 'Create New Product & Service'}</DialogTitle>
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

                        {/* Income Account */}
                        <div className="space-y-2">
                          <Label htmlFor="sale_account">Income Account <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.sale_account}
                            onValueChange={(value) => setFormData({ ...formData, sale_account: value })}
                          >
                            <SelectTrigger id="sale_account">
                              <SelectValue placeholder={loadingAccounts ? 'Loading accounts...' : 'Select Chart of Account'} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[320px]">
                              {incomeAccountGroups.map((group) => (
                                <div key={group.type}>
                                  <div className="px-3 pt-2 pb-1 text-xs font-bold text-slate-900">
                                    {group.type}
                                  </div>
                                  {group.subTypes.map((sub) => (
                                    <div key={sub.subType}>
                                      <div className="px-4 py-1 text-xs font-semibold text-slate-700">
                                        {sub.subType}
                                      </div>
                                      {sub.accounts.map((acc) => (
                                        <SelectItem
                                          key={acc.id}
                                          value={acc.id}
                                          className="pl-8"
                                        >
                                          {acc.name}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Create account here.{' '}
                            <Link
                              href="/accounting/double-entry?tab=chart-of-account"
                              className="text-primary underline"
                            >
                              Create account
                            </Link>
                          </p>
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

                        {/* Expense Account */}
                        <div className="space-y-2">
                          <Label htmlFor="expense_account">Expense Account <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.expense_account}
                            onValueChange={(value) => setFormData({ ...formData, expense_account: value })}
                          >
                            <SelectTrigger id="expense_account">
                              <SelectValue placeholder={loadingAccounts ? 'Loading accounts...' : 'Select Chart of Account'} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[320px]">
                              {expenseAccountGroups.map((group) => (
                                <div key={group.type}>
                                  <div className="px-3 pt-2 pb-1 text-xs font-bold text-slate-900">
                                    {group.type}
                                  </div>
                                  {group.subTypes.map((sub) => (
                                    <div key={sub.subType}>
                                      <div className="px-4 py-1 text-xs font-semibold text-slate-700">
                                        {sub.subType}
                                      </div>
                                      {sub.accounts.map((acc) => (
                                        <SelectItem
                                          key={acc.id}
                                          value={acc.id}
                                          className="pl-8"
                                        >
                                          {acc.name}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Create account here.{' '}
                            <Link
                              href="/accounting/double-entry?tab=chart-of-account"
                              className="text-primary underline"
                            >
                              Create account
                            </Link>
                          </p>
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
                          <p className="text-xs text-muted-foreground">
                            Create tax here.{' '}
                            <Link href="/accounting/setup/taxes" className="text-primary underline">
                              Create tax
                            </Link>
                          </p>
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
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Create category here.{' '}
                            <Link href="/accounting/setup/custom-field?tab=category" className="text-primary underline">
                              Create Category
                            </Link>
                          </p>
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
                          <p className="text-xs text-muted-foreground">
                            Create unit here.{' '}
                            <Link href="/accounting/setup/unit" className="text-primary underline">
                              Create unit
                            </Link>
                          </p>
                        </div>

                        {/* Product Image */}
                        <div className="space-y-2">
                          <Label htmlFor="image">Product Image</Label>
                          <Input
                            id="image"
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null
                              setFormData({ ...formData, image: file })
                              setImagePreview(file ? URL.createObjectURL(file) : '')
                            }}
                          />
                          {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-md border object-cover" />
                          )}
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
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
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
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_minmax(0,1fr)_auto] md:justify-start"
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
                        {categoryOptions.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-sm font-medium">
                      Search
                    </Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="search"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value)
                          setCurrentPage(1)
                        }}
                        placeholder="Search name or SKU..."
                        className="h-9 pl-9 pr-3 border-0 bg-gray-50 shadow-none focus-visible:border-0 focus-visible:ring-0 hover:bg-gray-100"
                      />
                    </div>
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
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>All Product & Services</CardTitle>
                  {error && (
                    <span className="text-xs text-red-600">
                      {error}
                    </span>
                  )}
                </div>
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
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="px-6 text-center py-8 text-muted-foreground">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : paginatedData.length === 0 ? (
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
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                                  title="Warehouse Details"
                                  onClick={() => handleOpenView(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                                  title="Edit"
                                  onClick={() => handleOpenEdit(item)}
                                >
                                  <Pencil className="h-4 w-4" />
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
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Warehouse Details</DialogTitle>
              </DialogHeader>
              {viewItem && (
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{viewItem.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-medium">{viewItem.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{viewItem.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit</span>
                    <span className="font-medium">{viewItem.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{viewItem.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{viewItem.type === 'product' ? viewItem.quantity ?? 0 : '-'}</span>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus product & service?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Item &quot;{deleteItem?.name}&quot; akan dihapus.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
