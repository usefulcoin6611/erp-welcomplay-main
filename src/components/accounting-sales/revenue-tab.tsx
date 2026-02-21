'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { SimplePagination } from '@/components/ui/simple-pagination'
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Download,
  Eye,
  Upload,
  Image as ImageIcon,
  FileText,
} from 'lucide-react'

const initialRevenueData: any[] = []

type Option = { id: string; name: string }
const emptyOptions: Option[] = []

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

export function RevenueTab() {
  type RevenueRow = (typeof initialRevenueData)[number] & {
    id: string | number
    date: string
    amount: number
    account: string
    customer?: string | null
    category?: string | null
    reference?: string | null
    description?: string | null
    paymentReceipt?: string | null
  }

  const [rows, setRows] = useState<RevenueRow[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [revenueToDelete, setRevenueToDelete] = useState<RevenueRow | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [accounts, setAccounts] = useState<Option[]>(emptyOptions)
  const [customers, setCustomers] = useState<Option[]>(emptyOptions)
  const [categories, setCategories] = useState<Option[]>(emptyOptions)
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    account: '',
    customer: '',
    category: '',
    reference: '',
    description: '',
    paymentReceipt: null as File | { name: string; url: string } | null,
  })

  const [formErrors, setFormErrors] = useState({
    date: '',
    amount: '',
    account: '',
    customer: '',
    category: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null)
  const [receiptRemoved, setReceiptRemoved] = useState(false)

  function shortenFileName(name: string, maxWords = 6) {
    const parts = name.split(/\s+/)
    if (parts.length <= maxWords) return name
    return parts.slice(0, maxWords).join(' ') + '...'
  }

  const [filters, setFilters] = useState({
    date: '',
    account: '',
    customer: '',
    category: '',
  })

  const loadRevenue = async (params?: { date?: string; categoryId?: string }) => {
    const search = new URLSearchParams()
    if (params?.date) {
      search.set('startDate', params.date)
      search.set('endDate', params.date)
    }
    if (params?.categoryId) {
      search.set('accountId', params.categoryId)
    }
    const url = `/api/revenue${search.toString() ? `?${search.toString()}` : ''}`
    const res = await fetch(url)
    const json = await res.json()
    if (json?.success && Array.isArray(json.data)) {
      setRows(json.data)
    }
  }

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await fetch('/api/chart-of-accounts')
        const json = await res.json()
        if (json?.success && Array.isArray(json.data)) {
          const cash = json.data.filter((a: any) => a.type === 'Assets').map((a: any) => ({ id: a.id, name: a.name }))
          const income = json.data.filter((a: any) => a.type === 'Income').map((a: any) => ({ id: a.id, name: a.name }))
          setAccounts(cash)
          setCategories(income)
        }
      } catch {}
      try {
        const resCust = await fetch('/api/customers')
        const jsonCust = await resCust.json()
        if (jsonCust?.success && Array.isArray(jsonCust.data)) {
          setCustomers(jsonCust.data.map((c: any) => ({ id: c.id, name: c.name })))
        }
      } catch {}
    }
    loadOptions()
    loadRevenue()
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = async () => {
    await loadRevenue({
      date: filters.date || undefined,
      categoryId: filters.category || undefined,
    })
    setCurrentPage(1)
  }

  const handleReset = () => {
    setFilters({
      date: '',
      account: '',
      customer: '',
      category: '',
    })
    setCurrentPage(1)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (open) {
      setReceiptRemoved(false)
    }
    if (!open) {
      setEditingId(null)
      setFormData({
        date: '',
        amount: '',
        account: '',
        customer: '',
        category: '',
        reference: '',
        description: '',
        paymentReceipt: null,
      })
      setReceiptPreviewUrl(null)
      setReceiptRemoved(false)
    }
  }

  const handleEdit = (revenue: RevenueRow) => {
    setEditingId(revenue.id)
    setFormData({
      date: revenue.date,
      amount: String(revenue.amount),
      account: (revenue as any).cashAccountId ?? '',
      customer: (revenue as any).customerId ?? '',
      category: (revenue as any).incomeAccountId ?? '',
      reference: revenue.reference || '',
      description: revenue.description || '',
      paymentReceipt: revenue.paymentReceipt
        ? {
            name: revenue.paymentReceipt.split('/').pop() || 'Existing Receipt',
            url: revenue.paymentReceipt,
          }
        : null,
    })
    if (revenue.paymentReceipt) {
      setReceiptPreviewUrl(revenue.paymentReceipt)
    } else {
      setReceiptPreviewUrl(null)
    }
    setReceiptRemoved(false)
    setDialogOpen(true)
  }

  const handleDeleteClick = (revenue: RevenueRow) => {
    setRevenueToDelete(revenue)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!revenueToDelete) return
    const res = await fetch(`/api/revenue/${revenueToDelete.id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => null)
    if (!res.ok || json?.success === false) {
      toast.error(json?.message || 'Gagal menghapus revenue')
      return
    }
    await loadRevenue()
    setRevenueToDelete(null)
    setDeleteDialogOpen(false)
  }

  const fileInputRef = useState<HTMLInputElement | null>(null)

  const onReceiptDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFormData((prev) => ({ ...prev, paymentReceipt: file }))
      const objectUrl = URL.createObjectURL(file)
      setReceiptPreviewUrl(objectUrl)
      setReceiptRemoved(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, open: openReceiptPicker } = useDropzone({
    onDrop: onReceiptDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
    noClick: true, // Disable click on root, handle manually
    noKeyboard: true // Disable keyboard on root, handle manually
  })

  const handleManualUploadClick = () => {
    openReceiptPicker()
  }

  const handleRemoveReceipt = () => {
    setFormData((prev) => ({ ...prev, paymentReceipt: null }))
    setReceiptPreviewUrl(null)
    setReceiptRemoved(true)
  }

  const validateForm = () => {
    const errors = {
      date: '',
      amount: '',
      account: '',
      customer: '',
      category: '',
    }

    if (!formData.date) {
      errors.date = 'Tanggal wajib diisi'
    }

    const amountValue = Number(formData.amount)
    if (!formData.amount || Number.isNaN(amountValue) || amountValue <= 0) {
      errors.amount = 'Amount harus lebih dari 0'
    }

    if (!formData.account) {
      errors.account = 'Account wajib dipilih'
    }

    if (!formData.customer) {
      errors.customer = 'Customer wajib dipilih'
    }

    if (!formData.category) {
      errors.category = 'Category wajib dipilih'
    }

    setFormErrors(errors)

    return !errors.date && !errors.amount && !errors.account && !errors.customer && !errors.category
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Mohon lengkapi field yang wajib diisi')
      return
    }

    setIsSubmitting(true)

    const payloadAmount = Number(formData.amount) || 0

    const submitData = new FormData()
    submitData.append('date', formData.date)
    submitData.append('amount', String(payloadAmount))
    submitData.append('cashAccountId', formData.account)
    submitData.append('incomeAccountId', formData.category)
    if (formData.customer) submitData.append('customerId', formData.customer)
    if (formData.reference) submitData.append('reference', formData.reference)
    if (formData.description) submitData.append('description', formData.description)
    if (formData.paymentReceipt instanceof File) {
      submitData.append('paymentReceipt', formData.paymentReceipt)
    } else if (receiptRemoved) {
      submitData.append('paymentReceiptRemoved', 'true')
    }
    try {
      if (editingId) {
        const res = await fetch(`/api/revenue/${editingId}`, {
          method: 'PUT',
          body: submitData,
        })
        const json = await res.json().catch(() => null)
        if (!res.ok || json?.success === false) {
          toast.error(json?.message || 'Gagal memperbarui revenue')
          setIsSubmitting(false)
          return
        }
        toast.success('Revenue berhasil diperbarui')
      } else {
        const res = await fetch('/api/revenue', {
          method: 'POST',
          body: submitData,
        })
        const json = await res.json().catch(() => null)
        if (!res.ok || json?.success === false) {
          toast.error(json?.message || 'Gagal membuat revenue')
          setIsSubmitting(false)
          return
        }
        toast.success('Revenue berhasil dibuat')
      }
      await loadRevenue()
      handleDialogOpenChange(false)
    } catch {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return rows.filter((revenue) => {
      if (filters.account) {
        const accountName = accounts.find((a) => a.id === filters.account)?.name
        if (accountName && revenue.account !== accountName) return false
      }
      if (filters.customer) {
        if ((revenue as any).customerId !== filters.customer) return false
      }
      if (filters.category) {
        const categoryName = categories.find((c) => c.id === filters.category)?.name
        if (categoryName && revenue.category !== categoryName) return false
      }
      if (filters.date) {
        // Simple date filter - can be enhanced with date range
        const filterDate = new Date(filters.date).toISOString().split('T')[0]
        if (revenue.date !== filterDate) return false
      }
      return true
    })
  }, [rows, filters.account, filters.category, filters.customer, filters.date])

  const totalRecords = filteredData.length

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Revenue</CardTitle>
            <CardDescription>Track incoming revenue and receipts.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="blue"
                size="sm"
                className="shadow-none h-7 px-4"
                title="Create Revenue"
                onClick={() => setEditingId(null)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Revenue
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Revenue' : 'Create New Revenue'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="create-date">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="create-date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                      {formErrors.date && (
                        <p className="text-xs text-red-500">{formErrors.date}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="create-amount">
                        Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="create-amount"
                        type="number"
                        step="0.01"
                        placeholder="Enter Amount"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                      {formErrors.amount && (
                        <p className="text-xs text-red-500">{formErrors.amount}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="create-account">
                        Account <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.account}
                        onValueChange={(value) => setFormData({ ...formData, account: value })}
                        required
                      >
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
                      {formErrors.account && (
                        <p className="text-xs text-red-500">{formErrors.account}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Create account here.{' '}
                        <Link className="font-medium text-primary" href="/accounting/bank-account">
                          Create account
                        </Link>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="create-customer">
                        Customer <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.customer}
                        onValueChange={(value) => setFormData({ ...formData, customer: value })}
                        required
                      >
                        <SelectTrigger id="create-customer">
                          <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.customer && (
                        <p className="text-xs text-red-500">{formErrors.customer}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Create customer here.{' '}
                        <Link className="font-medium text-primary" href="/accounting/sales?tab=customer">
                          Create customer
                        </Link>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-description">Description</Label>
                    <Textarea
                      id="create-description"
                      placeholder="Enter Description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="create-category">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                      >
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
                      {formErrors.category && (
                        <p className="text-xs text-red-500">{formErrors.category}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Create category here.{' '}
                        <Link className="font-medium text-primary" href="/accounting/setup?tab=category">
                          Create category
                        </Link>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-reference">Reference</Label>
                      <Input
                        id="create-reference"
                        placeholder="Enter Reference"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Receipt</Label>
                    {!receiptPreviewUrl ? (
                      <div
                        {...getRootProps()}
                        className={`
                          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
                        `}
                        onClick={handleManualUploadClick}
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Upload className="h-6 w-6" />
                          <p className="text-sm font-medium">
                            {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Supports: PNG, JPG, JPEG, PDF
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full border rounded-lg overflow-hidden bg-gray-50 p-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 bg-white rounded-md border flex items-center justify-center">
                            {receiptPreviewUrl && receiptPreviewUrl.toLowerCase().endsWith('.pdf') ? (
                              <FileText className="h-5 w-5 text-red-500" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {formData.paymentReceipt instanceof File
                                ? shortenFileName(formData.paymentReceipt.name)
                                : shortenFileName((formData.paymentReceipt as any)?.name || 'Receipt')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => {
                                if (receiptPreviewUrl) {
                                  window.open(receiptPreviewUrl, '_blank')
                                }
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <input {...getInputProps()} className="hidden" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={handleManualUploadClick}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={handleRemoveReceipt}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" className="shadow-none" onClick={() => handleDialogOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="blue" className="shadow-none" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
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
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_14rem_14rem_auto] md:justify-start"
            onSubmit={(e) => {
              e.preventDefault()
              handleApply()
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="revenue-filter-date" className="text-sm font-medium">
                Date
              </Label>
              <DatePicker
                id="revenue-filter-date"
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
                  id="revenue-filter-account"
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
              <Label className="text-sm font-medium">Customer</Label>
              <Select value={filters.customer} onValueChange={(value) => handleFilterChange('customer', value)}>
                <SelectTrigger
                  id="revenue-filter-customer"
                  className={`w-full !h-9 ${
                    !filters.customer ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger
                  id="revenue-filter-category"
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

            {/* Actions (aligned with input row on md+) */}
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

      {/* Revenue Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <CardTitle>Revenue List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Date</TableHead>
                  <TableHead className="px-6">Amount</TableHead>
                  <TableHead className="px-6">Account</TableHead>
                  <TableHead className="px-6">Customer</TableHead>
                  <TableHead className="px-6">Category</TableHead>
                  <TableHead className="px-6">Reference</TableHead>
                  <TableHead className="px-6">Description</TableHead>
                  <TableHead className="px-6">Payment Receipt</TableHead>
                  <TableHead className="px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((revenue) => (
                    <TableRow key={revenue.id}>
                      <TableCell className="px-6">
                        {formatDate(revenue.date)}
                      </TableCell>
                      <TableCell className="px-6 font-medium">
                        {formatPrice(revenue.amount)}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.account}
                      </TableCell>
                      <TableCell className="px-6">
                        {customers.find((c) => c.id === (revenue as any).customerId)?.name || '-'}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.category || '-'}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.reference || '-'}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.description || '-'}
                      </TableCell>
                      <TableCell className="px-6">
                        {revenue.paymentReceipt ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                              title="Download"
                              onClick={() => {
                                window.open(revenue.paymentReceipt as string, '_blank')
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                              title="Preview"
                              onClick={() => {
                                window.open(revenue.paymentReceipt as string, '_blank')
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
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => handleEdit(revenue)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(revenue)}
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
                      No revenue found
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
                onPageChange={setCurrentPage}
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
            <AlertDialogTitle>Delete Revenue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this revenue? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRevenueToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
