'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  AlertDialogDescription as AlertDialogDescriptionText,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  FileText,
} from 'lucide-react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

type PaymentRow = {
  id: string
  paymentId: string
  date: string
  amount: number
  account: string
  vendor: string
  category: string
  reference: string | null
  description: string | null
  paymentReceipt: string | null
}

type Option = {
  id: string
  name: string
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function PaymentTab() {
  const [rows, setRows] = useState<PaymentRow[]>([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRow | null>(null)
  
  // Data Master States
  const [vendors, setVendors] = useState<Option[]>([])
  const [accounts, setAccounts] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [loadingData, setLoadingData] = useState(false)
  
  const [formData, setFormData] = useState<{
    vendor: string
    date: string
    amount: string
    category: string
    account: string
    reference: string
    description: string
    paymentReceipt: File | { name: string, url: string } | null
  }>({
    vendor: '',
    date: '',
    amount: '',
    category: '',
    account: '',
    reference: '',
    description: '',
    paymentReceipt: null,
  })
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    date: '',
    account: '',
    vendor: '',
    category: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load Data Master (Vendors, Accounts, Categories)
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true)
      try {
        const [resVendors, resAccounts, resCategories] = await Promise.all([
          fetch('/api/vendors'),
          fetch('/api/bank-accounts'),
          fetch('/api/categories')
        ])
        
        const jsonVendors = await resVendors.json()
        if (jsonVendors.success) {
          setVendors(jsonVendors.data.map((v: any) => ({ id: v.id, name: v.name })))
        }

        const jsonAccounts = await resAccounts.json()
        if (jsonAccounts.success) {
          setAccounts(jsonAccounts.data.map((a: any) => ({ 
            id: a.id, 
            name: `${a.bank} - ${a.name}` 
          })))
        }

        const jsonCategories = await resCategories.json()
        if (jsonCategories.success) {
          // Filter only Expense categories as per reference-erp
          const expenseCats = jsonCategories.data.filter((c: any) => c.type === 'Expense')
          setCategories(expenseCats.map((c: any) => ({ id: c.id, name: c.name })))
        }
      } catch (error) {
        console.error('Failed to load master data', error)
        toast.error('Gagal memuat data master')
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const res = await fetch('/api/payments', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        if (!json?.success || !Array.isArray(json.data)) return
        const mapped: PaymentRow[] = json.data.map((p: any) => ({
          id: p.id as string,
          paymentId: p.paymentId as string,
          date: new Date(p.date).toISOString().slice(0, 10),
          amount: Number(p.amount) || 0,
          account: p.account as string,
          vendor: p.vendor as string,
          category: p.category as string,
          reference: p.reference ?? null,
          description: p.description ?? null,
          paymentReceipt: p.paymentReceipt ?? null,
        }))
        setRows(mapped)
      } catch {
        toast.error('Gagal memuat daftar pembayaran')
      }
    }

    loadPayments()
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    setCurrentPage(1) // Reset to first page on filter apply
  }

  const handleReset = () => {
    setFilters({
      date: '',
      account: '',
      vendor: '',
      category: '',
    })
    setCurrentPage(1)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        vendor: '',
        date: '',
        amount: '',
        category: '',
        account: '',
        reference: '',
        description: '',
        paymentReceipt: null,
      })
      setPreviewUrl(null)
      setIsSubmitting(false)
    }
  }

  const handleEdit = (payment: PaymentRow) => {
    setEditingId(payment.id)
    
    // Find ID based on Name (since API returns Names)
    const vendorId = vendors.find((v) => v.name === payment.vendor)?.id ?? ''
    const accountId = accounts.find((a) => a.name === payment.account)?.id ?? ''
    const categoryId = categories.find((c) => c.name === payment.category)?.id ?? ''

    setFormData({
      vendor: vendorId,
      date: payment.date,
      amount: String(payment.amount),
      category: categoryId,
      account: accountId,
      reference: payment.reference || '',
      description: payment.description || '',
      paymentReceipt: payment.paymentReceipt ? { name: payment.paymentReceipt.split('/').pop() || 'Existing Receipt', url: payment.paymentReceipt } : null,
    })
    
    if (payment.paymentReceipt) {
      setPreviewUrl(payment.paymentReceipt)
    } else {
      setPreviewUrl(null)
    }
    
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (payment: PaymentRow) => {
    setPaymentToDelete(payment)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return
    try {
      const res = await fetch(`/api/payments/${paymentToDelete.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setRows((prev) => prev.filter((p) => p.id !== paymentToDelete.id))
        toast.success('Pembayaran berhasil dihapus')
      } else {
        toast.error('Gagal menghapus pembayaran')
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus')
    }
    setPaymentToDelete(null)
    setDeleteDialogOpen(false)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFormData((prev) => ({ ...prev, paymentReceipt: file }))
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  })

  const handleRemoveReceipt = () => {
    setFormData((prev) => ({ ...prev, paymentReceipt: null }))
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Map IDs back to Names for API
    const vendorName = vendors.find((v) => v.id === formData.vendor)?.name ?? ''
    const categoryName = categories.find((c) => c.id === formData.category)?.name ?? ''
    const accountName = accounts.find((a) => a.id === formData.account)?.name ?? ''
    const nextAmount = Number(formData.amount) || 0

    const submitData = new FormData()
    submitData.append('date', formData.date)
    submitData.append('vendor', vendorName)
    submitData.append('account', accountName)
    submitData.append('category', categoryName)
    submitData.append('amount', String(nextAmount))
    submitData.append('status', 'Completed')
    if (formData.reference) submitData.append('reference', formData.reference)
    if (formData.description) submitData.append('description', formData.description)
    if (formData.paymentReceipt instanceof File) {
      submitData.append('paymentReceipt', formData.paymentReceipt)
    }

    const target = rows.find((p) => p.id === editingId)
    const url = editingId && target ? `/api/payments/${target.id}` : '/api/payments'
    const method = editingId && target ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        body: submitData,
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        toast.error(json?.message || 'Gagal menyimpan pembayaran')
        setIsSubmitting(false)
        return
      }

      const json = await res.json()
      if (!json?.success || !json.data) {
        toast.error('Respon server tidak valid')
        setIsSubmitting(false)
        return
      }

      const saved: any = json.data
      const mapped: PaymentRow = {
        id: saved.id as string,
        paymentId: saved.paymentId as string,
        date: new Date(saved.date).toISOString().slice(0, 10),
        amount: Number(saved.amount) || 0,
        account: saved.account as string,
        vendor: saved.vendor as string,
        category: saved.category as string,
        reference: saved.reference ?? null,
        description: saved.description ?? null,
        paymentReceipt: saved.paymentReceipt ?? null,
      }

      if (editingId && target) {
        setRows((prev) =>
          prev.map((p) =>
            p.id === editingId ? mapped : p,
          ),
        )
        toast.success('Pembayaran berhasil diperbarui')
      } else {
        setRows((prev) => [mapped, ...prev])
        toast.success('Pembayaran berhasil dibuat')
      }

      handleDialogOpenChange(false)
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return rows.filter((payment) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const hay = [
          payment.id,
          payment.date,
          payment.account,
          payment.vendor,
          payment.category,
          payment.reference ?? '',
          payment.description ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.account) {
        const accountName = accounts.find(a => a.id === filters.account)?.name
        if (accountName && payment.account !== accountName) return false
      }
      if (filters.vendor) {
        const vendorName = vendors.find(v => v.id === filters.vendor)?.name
        if (vendorName && payment.vendor !== vendorName) return false
      }
      if (filters.category) {
        const categoryName = categories.find(c => c.id === filters.category)?.name
        if (categoryName && payment.category !== categoryName) return false
      }
      if (filters.date) {
        const filterDate = new Date(filters.date).toISOString().split('T')[0]
        if (payment.date !== filterDate) return false
      }
      return true
    })
  }, [filters, rows, search])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.date, filters.account, filters.vendor, filters.category, search])

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Payments</CardTitle>
            <CardDescription>Manage payments to vendors.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
                Create Payment
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Payment' : 'Create New Payment'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-vendor">
                    Vendor <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })} required>
                    <SelectTrigger id="create-vendor">
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create vendor here.{' '}
                    <Link className="font-medium text-primary" href="/accounting/purchases?tab=supplier">
                      Create vendor
                    </Link>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input id="create-date" type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input id="create-amount" type="number" step="0.01" placeholder="Enter Amount" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                    <SelectTrigger id="create-category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create category here.{' '}
                    <Link className="font-medium text-primary" href="/accounting/setup?tab=category">
                      Create category
                    </Link>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-account">
                    Account <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.account} onValueChange={(value) => setFormData({ ...formData, account: value })} required>
                    <SelectTrigger id="create-account">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create account here.{' '}
                    <Link className="font-medium text-primary" href="/accounting/bank-account">
                      Create account
                    </Link>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-reference">Reference</Label>
                  <Input id="create-reference" placeholder="Enter Reference" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Payment Receipt</Label>
                  {!previewUrl ? (
                    <div
                      {...getRootProps()}
                      className={`
                        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
                      `}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <p className="text-sm font-medium">
                          {isDragActive ? 'Drop the file here' : 'Drag & drop file here, or click to select'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Supports: PNG, JPG, JPEG, PDF (Max 5MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full border rounded-lg overflow-hidden bg-gray-50 p-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 bg-white rounded-md border flex items-center justify-center">
                          {previewUrl.endsWith('.pdf') ? (
                            <FileText className="h-5 w-5 text-red-500" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {formData.paymentReceipt instanceof File 
                              ? formData.paymentReceipt.name 
                              : (formData.paymentReceipt as any)?.name || 'Receipt'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formData.paymentReceipt instanceof File 
                              ? `${(formData.paymentReceipt.size / 1024).toFixed(1)} KB` 
                              : 'Existing File'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => window.open(previewUrl, '_blank')}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleRemoveReceipt}
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Image Preview Area (Only for images) */}
                      {!previewUrl.endsWith('.pdf') && (
                        <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden border">
                          <Image 
                            src={previewUrl} 
                            alt="Preview" 
                            fill 
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea id="create-description" placeholder="Enter Description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" type="button" className="shadow-none" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="blue" type="submit" className="shadow-none" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Update' : 'Create'}
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
            onSubmit={(e) => {
              e.preventDefault()
              handleApply()
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_14rem_14rem_auto] md:justify-start"
          >
            <div className="space-y-2">
              <Label htmlFor="payment-filter-date" className="text-sm font-medium">
                Date
              </Label>
              <DatePicker
                id="payment-filter-date"
                value={filters.date}
                onValueChange={(v) => handleFilterChange('date', v)}
                placeholder="Set a date"
                className="!h-9 px-3"
                iconPlacement="right"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Account</Label>
              <Select value={filters.account} onValueChange={(value) => handleFilterChange('account', value)}>
                <SelectTrigger
                  id="payment-filter-account"
                  className={`w-full !h-9 ${
                    !filters.account ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Vendor</Label>
              <Select value={filters.vendor} onValueChange={(value) => handleFilterChange('vendor', value)}>
                <SelectTrigger
                  id="payment-filter-vendor"
                  className={`w-full !h-9 ${
                    !filters.vendor ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger
                  id="payment-filter-category"
                  className={`w-full !h-9 ${
                    !filters.category ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:pt-6">
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                title="Apply"
              >
                <Search className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                onClick={handleReset}
                title="Reset"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Payment List</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search payments..."
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
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Date</TableHead>
                  <TableHead className="px-6">Amount</TableHead>
                  <TableHead className="px-6">Account</TableHead>
                  <TableHead className="px-6">Vendor</TableHead>
                  <TableHead className="px-6">Category</TableHead>
                  <TableHead className="px-6">Reference</TableHead>
                  <TableHead className="px-6">Description</TableHead>
                  <TableHead className="px-6">Payment Receipt</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="px-6">
                        {formatDate(payment.date)}
                      </TableCell>
                      <TableCell className="px-6 font-medium">
                        {formatPrice(payment.amount)}
                      </TableCell>
                      <TableCell className="px-6">{payment.account}</TableCell>
                      <TableCell className="px-6">{payment.vendor}</TableCell>
                      <TableCell className="px-6">{payment.category}</TableCell>
                      <TableCell className="px-6">{payment.reference || '-'}</TableCell>
                      <TableCell className="px-6">{payment.description || '-'}</TableCell>
                      <TableCell className="px-6">
                        {payment.paymentReceipt ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                              title="Download"
                              asChild
                            >
                              <a href={payment.paymentReceipt} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                              title="Preview"
                              onClick={() => {
                                if (payment.paymentReceipt) {
                                  window.open(payment.paymentReceipt, '_blank')
                                }
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            size="sm"
                            variant="outline"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => handleEdit(payment)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(payment)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="px-6 text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <div className="px-6 pb-6 pt-4">
              <SimplePagination
                totalCount={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
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
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescriptionText>
              Are you sure you want to delete this payment? This action cannot be undone.
            </AlertDialogDescriptionText>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPaymentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
