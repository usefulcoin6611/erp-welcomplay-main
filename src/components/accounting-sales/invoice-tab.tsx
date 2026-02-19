'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SimplePagination } from '@/components/ui/simple-pagination'
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  Download,
  Eye,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react"
import * as QRCode from 'qrcode'

// Backend data holders
const initialInvoices: any[] = []

const statusMap: {
  [key: number]: { label: string; color: string }
} = {
  0: { label: "Draft", color: "bg-blue-100 text-blue-700 border-none" },
  1: { label: "Sent", color: "bg-yellow-100 text-yellow-700 border-none" },
  2: { label: "Unpaid", color: "bg-red-100 text-red-700 border-none" },
  3: { label: "Partially Paid", color: "bg-cyan-100 text-cyan-700 border-none" },
  4: { label: "Paid", color: "bg-blue-100 text-blue-700 border-none" },
}

const initialCustomers: { id: string; name: string }[] = []

const initialCategories: { id: string; name: string }[] = []

const mockProducts = [
  { id: 1, name: 'Product A', price: 100000, unit: 'pcs' },
  { id: 2, name: 'Product B', price: 200000, unit: 'pcs' },
  { id: 3, name: 'Service A', price: 500000, unit: 'hour' },
  { id: 4, name: 'Service B', price: 750000, unit: 'hour' },
]

const mockTaxes = [
  { id: 1, name: 'VAT', rate: 11 },
  { id: 2, name: 'PPN', rate: 10 },
]

export function InvoiceTab() {
  type InvoiceItem = {
    id: string
    item: string
    quantity: string
    price: string
    discount: string
    tax: string
    taxRate: string
    description: string
    amount: number
  }

  type InvoiceRow = (typeof initialInvoices)[number] & {
    customer: string
    category: string
    refNumber: string
    description: string
    items: InvoiceItem[]
  }

  const searchParams = useSearchParams()
  const preselectInvoiceId = searchParams.get('invoiceId')

  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceRow[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dateFilter, setDateFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceRow | null>(null)
  const [formData, setFormData] = useState({
    customer: '',
    category: '',
    issueDate: '',
    dueDate: '',
    refNumber: '',
    description: '',
  })
  const [invoiceNumber] = useState(`INV-2026-${String((invoices?.length || 0) + 1).padStart(3, '0')}`)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [customers, setCustomers] = useState(initialCustomers)
  const [categories, setCategories] = useState(initialCategories)

  type InvoiceDetail = {
    invoiceId: string
    status: number
    issueDate: string
    dueDate: string
    dueAmount: number
    description?: string
    customerId?: string
    categoryId?: string
    customer?: { name?: string; customerCode?: string }
    items: {
      id: string
      itemName: string
      quantity: number
      price: number
      discount: number
      taxRate: number
      amount: number
      description?: string
    }[]
  }
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [invoicePrintSetting, setInvoicePrintSetting] = useState<{
    template: string
    qrDisplay: boolean
    color: string
    logoDataUrl?: string | null
  } | null>(null)

  const loadInvoiceDetail = async (invoiceId: string) => {
    setLoadingDetail(true)
    setDetailError(null)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`)
      const json = await res.json()
      if (!json.success) {
        setDetailError('Failed to load invoice')
      } else {
        const e = json.data as any
        setSelectedInvoice({
          invoiceId: e.invoiceId,
          status: e.status,
          issueDate: e.issueDate,
          dueDate: e.dueDate,
          dueAmount: e.dueAmount,
          description: e.description ?? '',
          customerId: e.customerId ?? '',
          categoryId: e.categoryId ?? '',
          customer: { name: e.customer?.name ?? '', customerCode: e.customer?.customerCode ?? '' },
          items: (e.items ?? []).map((it: any) => ({
            id: it.id,
            itemName: it.itemName,
            quantity: it.quantity,
            price: it.price,
            discount: it.discount,
            taxRate: it.taxRate,
            amount: it.amount,
            description: it.description ?? '',
          })),
        })
      }
    } catch {
      setDetailError('Failed to load invoice')
    } finally {
      setLoadingDetail(false)
    }
  }
  const computeTotals = React.useMemo(() => {
    if (!selectedInvoice) return { subTotal: 0, discount: 0, tax: 0, total: 0 }
    const subTotal = selectedInvoice.items.reduce((sum, it) => sum + (it.quantity * it.price - it.discount), 0)
    const tax = selectedInvoice.items.reduce((sum, it) => {
      const base = it.quantity * it.price - it.discount
      return sum + (it.taxRate / 100) * base
    }, 0)
    const total = selectedInvoice.items.reduce((sum, it) => sum + it.amount, 0) || subTotal + tax
    const discount = selectedInvoice.items.reduce((sum, it) => sum + it.discount, 0)
    return { subTotal, discount, tax, total }
  }, [selectedInvoice])

  useEffect(() => {
    const loadPrintSettings = async () => {
      try {
        const res = await fetch('/api/settings/accounting-print')
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success || !json.data) return
        const data = json.data as {
          invoice?: { template?: string; qrDisplay?: boolean; color?: string; logoDataUrl?: string | null }
        }
        if (data.invoice) {
          setInvoicePrintSetting({
            template: data.invoice.template || 'new-york',
            qrDisplay: typeof data.invoice.qrDisplay === 'boolean' ? data.invoice.qrDisplay : true,
            color: data.invoice.color || '#1e40af',
            logoDataUrl: data.invoice.logoDataUrl ?? null,
          })
        } else {
          setInvoicePrintSetting({
            template: 'new-york',
            qrDisplay: true,
            color: '#1e40af',
            logoDataUrl: null,
          })
        }
      } catch {
      }
    }
    loadPrintSettings()
  }, [])

  useEffect(() => {
    if (!selectedInvoice) {
      setQrDataUrl(null)
      return
    }
    const text = selectedInvoice.invoiceId ? String(selectedInvoice.invoiceId) : ''
    QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      width: 100,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
      .then((url: string) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(null))
  }, [selectedInvoice])

  useEffect(() => {
    if (preselectInvoiceId) {
      loadInvoiceDetail(preselectInvoiceId)
    }
  }, [preselectInvoiceId])

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        const [invRes, custRes, catRes] = await Promise.all([
          fetch(`/api/invoices`).then(r => r.json()).catch(() => ({ success: false })),
          fetch(`/api/customers`).then(r => r.json()).catch(() => ({ success: false })),
          fetch(`/api/categories`).then(r => r.json()).catch(() => ({ success: false })),
        ])
        if (invRes?.success && Array.isArray(invRes.data)) {
          const loaded: InvoiceRow[] = invRes.data.map((e: any) => ({
            id: e.id,
            issueDate: e.issueDate,
            dueDate: e.dueDate,
            dueAmount: e.dueAmount,
            status: e.status,
            customer: e.customerId || '',
            category: e.categoryId || '',
            refNumber: '',
            description: e.description || '',
            items: (e.items || []).map((it: any) => ({
              id: it.id,
              item: it.item,
              quantity: it.quantity,
              price: it.price,
              discount: it.discount,
              tax: '',
              taxRate: it.taxRate,
              description: it.description || '',
              amount: it.amount || 0,
            })),
          }))
          setInvoices(loaded)
          setFilteredInvoices(loaded)
        }
        if (custRes?.success && Array.isArray(custRes.data)) {
          setCustomers(custRes.data.map((c: any) => ({ id: c.id, name: c.name })))
        }
        if (catRes?.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data.map((c: any) => ({ id: c.id, name: c.name })))
        }
      } catch {
        // silent fallback
      }
    }
    loadBaseData()
  }, [])

  // Calculate item amount
  const calculateItemAmount = (item: typeof items[0]) => {
    const quantity = parseFloat(item.quantity) || 0
    const price = parseFloat(item.price) || 0
    const discount = parseFloat(item.discount) || 0
    const taxRate = parseFloat(item.taxRate) || 0
    
    const subtotal = (quantity * price) - discount
    const taxAmount = (taxRate / 100) * subtotal
    return subtotal + taxAmount
  }

  // Calculate totals
  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const price = parseFloat(item.price) || 0
      return sum + (quantity * price)
    }, 0)
    
    const totalDiscount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.discount) || 0)
    }, 0)
    
    const totalTax = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const price = parseFloat(item.price) || 0
      const discount = parseFloat(item.discount) || 0
      const taxRate = parseFloat(item.taxRate) || 0
      const subtotal = (quantity * price) - discount
      return sum + ((taxRate / 100) * subtotal)
    }, 0)
    
    const totalAmount = subTotal - totalDiscount + totalTax
    
    return { subTotal, totalDiscount, totalTax, totalAmount }
  }

  const handleEdit = (invoice: InvoiceRow) => {
    setEditingId(invoice.id)
    setFormData({
      customer: invoice.customer,
      category: invoice.category,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      refNumber: invoice.refNumber,
      description: invoice.description,
    })
    setItems(invoice.items)
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (invoice: InvoiceRow) => {
    setInvoiceToDelete(invoice)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return
    try {
      await fetch(`/api/invoices/${invoiceToDelete.id}`, { method: "DELETE" })
      setInvoices((prev) => prev.filter((i) => i.id !== invoiceToDelete.id))
      setFilteredInvoices((prev) => prev.filter((i) => i.id !== invoiceToDelete.id))
    } finally {
      setInvoiceToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const addItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      item: '',
      quantity: '1',
      price: '0',
      discount: '0',
      tax: '',
      taxRate: '0',
      description: '',
      amount: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'item' && value) {
          const product = mockProducts.find(p => p.id.toString() === value)
          if (product) {
            updated.price = product.price.toString()
          }
        }
        if (['quantity', 'price', 'discount', 'taxRate'].includes(field)) {
          updated.amount = calculateItemAmount(updated)
        } else if (field === 'tax') {
          const tax = mockTaxes.find(t => t.id.toString() === value)
          updated.taxRate = tax?.rate.toString() || '0'
          updated.amount = calculateItemAmount({ ...updated, taxRate: updated.taxRate })
        }
        return updated
      }
      return item
    }))
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { totalAmount } = calculateTotals()

    if (editingId) {
      await fetch(`/api/invoices/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formData.customer,
          categoryId: formData.category,
          issueDate: formData.issueDate,
          dueDate: formData.dueDate,
          description: formData.description,
          dueAmount: totalAmount,
        }),
      })
      const res = await fetch(`/api/invoices`).then(r => r.json()).catch(() => ({ success: false }))
      if (res?.success && Array.isArray(res.data)) {
        const loaded: InvoiceRow[] = res.data.map((e: any) => ({
          id: e.id,
          issueDate: e.issueDate,
          dueDate: e.dueDate,
          dueAmount: e.dueAmount,
          status: e.status,
          customer: e.customerId || '',
          category: e.categoryId || '',
          refNumber: '',
          description: e.description || '',
          items: (e.items || []).map((it: any) => ({
            id: it.id,
            item: it.item,
            quantity: it.quantity,
            price: it.price,
            discount: it.discount,
            tax: '',
            taxRate: it.taxRate,
            description: it.description || '',
            amount: it.amount || 0,
          })),
        }))
        setInvoices(loaded)
        setFilteredInvoices(loaded)
      }
    } else {
      await fetch(`/api/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formData.customer,
          categoryId: formData.category,
          issueDate: formData.issueDate,
          dueDate: formData.dueDate,
          description: formData.description,
          dueAmount: totalAmount,
          items,
        }),
      })
      const res = await fetch(`/api/invoices`).then(r => r.json()).catch(() => ({ success: false }))
      if (res?.success && Array.isArray(res.data)) {
        const loaded: InvoiceRow[] = res.data.map((e: any) => ({
          id: e.id,
          issueDate: e.issueDate,
          dueDate: e.dueDate,
          dueAmount: e.dueAmount,
          status: e.status,
          customer: e.customerId || '',
          category: e.categoryId || '',
          refNumber: '',
          description: e.description || '',
          items: (e.items || []).map((it: any) => ({
            id: it.id,
            item: it.item,
            quantity: it.quantity,
            price: it.price,
            discount: it.discount,
            tax: '',
            taxRate: it.taxRate,
            description: it.description || '',
            amount: it.amount || 0,
          })),
        }))
        setInvoices(loaded)
        setFilteredInvoices(loaded)
      }
    }
    setCreateDialogOpen(false)
    setEditingId(null)
    setFormData({
      customer: '',
      category: '',
      issueDate: '',
      dueDate: '',
      refNumber: '',
      description: '',
    })
    setItems([])
  }

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        customer: '',
        category: '',
        issueDate: '',
        dueDate: '',
        refNumber: '',
        description: '',
      })
      setItems([])
    }
  }

  // Filter invoices (client-side backup)
  useEffect(() => {
    let filtered = [...invoices]
    
    if (dateFilter) {
      filtered = filtered.filter(i => i.issueDate === dateFilter)
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === parseInt(statusFilter))
    }
    if (customerFilter !== 'all') {
      filtered = filtered.filter(i => i.customer === customerFilter)
    }
    
    setFilteredInvoices(filtered)
    setCurrentPage(1)
  }, [dateFilter, statusFilter, customerFilter, invoices])

  // Paginated invoices
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalRecords = filteredInvoices.length

  const handleReset = () => {
    setDateFilter('')
    setCustomerFilter('all')
    setStatusFilter('all')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (selectedInvoice) {
    return (
      <div className="space-y-6 w-full">
        <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
          <CardHeader className="px-6">
            <div className="flex items-center gap-4 w-full">
              <div className="min-w-0 space-y-1 flex-1">
                <CardTitle className="text-base font-normal truncate">Invoice Detail</CardTitle>
                <p className="text-sm text-muted-foreground truncate">{selectedInvoice.invoiceId}</p>
              </div>
              <div className="ml-auto flex items-center gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="shadow-none h-8 px-3 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                  asChild
                >
                  <Link href={`/accounting/invoice/${selectedInvoice.invoiceId}/edit`}>Edit</Link>
                </Button>
                <Select
                  value={String(selectedInvoice.status)}
                  onValueChange={(v) => {
                    const n = parseInt(v, 10)
                    fetch(`/api/invoices/${selectedInvoice.invoiceId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: n }),
                    }).then(() => {
                      setSelectedInvoice({ ...selectedInvoice, status: n })
                    })
                  }}
                >
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue placeholder={statusMap[selectedInvoice.status].label} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusMap).map(([k, v]) => (
                      <SelectItem key={k} value={String(k)}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="shadow-none h-8 w-8 p-0" onClick={() => setSelectedInvoice(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">Create Invoice</div>
                    <div className="text-muted-foreground">{new Date(selectedInvoice.issueDate).toLocaleDateString('id-ID')}</div>
                  </div>
                  <Badge className={statusMap[0].color}>{statusMap[0].label}</Badge>
                </div>
              </div>
              <div className="border rounded-md p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">Send Invoice</div>
                    <div className="text-muted-foreground">{new Date(selectedInvoice.issueDate).toLocaleDateString('id-ID')}</div>
                  </div>
                  <Badge className={statusMap[Math.max(1, selectedInvoice.status)].color}>{statusMap[Math.max(1, selectedInvoice.status)].label}</Badge>
                </div>
              </div>
              <div className="border rounded-md p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">Get Paid</div>
                    <div className="text-muted-foreground">Awaiting payment</div>
                  </div>
                  <Button variant="outline" size="sm" className="shadow-none h-8 px-3">Add Payment</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

            {selectedInvoice.status !== 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
            {selectedInvoice.status !== 4 && (
              <>
                <Button size="sm" variant="default" className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700">
                  Apply Credit Note
                </Button>
                <Button size="sm" variant="default" className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700">
                  Receipt Reminder
                </Button>
              </>
            )}
            <Button size="sm" variant="default" className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700">
              Resend Invoice
            </Button>
            <Button size="sm" variant="default" className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700">
              Download
            </Button>
          </div>
        )}
        <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
          <CardHeader className="px-6">
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {invoicePrintSetting?.logoDataUrl && (
                  <div className="w-10 h-10 rounded border border-border bg-white flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={invoicePrintSetting.logoDataUrl}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <CardTitle className="text-base font-normal">Invoice</CardTitle>
                  <span className="text-base font-semibold block truncate">#{selectedInvoice.invoiceId}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 space-y-6">
            <div className="flex justify-end">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-muted-foreground">Issue Date :</div>
                  <div className="text-sm font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString('id-ID')}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Due Date :</div>
                  <div className="text-sm font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString('id-ID')}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1 text-sm">
                <div className="font-medium">Billed To :</div>
                <div>{selectedInvoice.customer?.name || '-'}</div>
                <div className="text-muted-foreground">{selectedInvoice.customer?.customerCode || '-'}</div>
                <div className="text-muted-foreground">Tax Number : 001</div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">Shipped To :</div>
                <div>{selectedInvoice.customer?.name || '-'}</div>
                <div className="text-muted-foreground">{selectedInvoice.customer?.customerCode || '-'}</div>
              </div>
              <div className="flex items-start justify-end">
                <div className="flex flex-col items-end gap-3">
                  {invoicePrintSetting?.qrDisplay !== false && (
                    qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR"
                        className="w-[100px] h-[100px] rounded-lg border bg-white p-1"
                        style={{ borderColor: invoicePrintSetting?.color || 'hsl(var(--border))' }}
                      />
                    ) : (
                      <div
                        className="w-[100px] h-[100px] rounded-lg bg-white p-2 border"
                        style={{ borderColor: invoicePrintSetting?.color || 'hsl(var(--border))' }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Status :</span>{' '}
              <Badge className={statusMap[selectedInvoice.status].color}>
                {statusMap[selectedInvoice.status].label}
              </Badge>
            </div>

            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">#</TableHead>
                    <TableHead className="px-6">Product</TableHead>
                    <TableHead className="px-6">Quantity</TableHead>
                    <TableHead className="px-6">Rate</TableHead>
                    <TableHead className="px-6">Discount</TableHead>
                    <TableHead className="px-6">Tax</TableHead>
                    <TableHead className="px-6">Description</TableHead>
                    <TableHead className="px-6 text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((it, idx) => {
                    const qty = it.quantity
                    const rate = it.price
                    const base = qty * rate - it.discount
                    const taxAmount = (it.taxRate / 100) * base
                    const total = base + taxAmount
                    return (
                      <TableRow key={it.id}>
                        <TableCell className="px-6">{idx + 1}</TableCell>
                        <TableCell className="px-6">{it.itemName}</TableCell>
                        <TableCell className="px-6">{qty} <span className="text-muted-foreground text-xs">Piece</span></TableCell>
                        <TableCell className="px-6">Rp {rate.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="px-6">Rp {it.discount.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="px-6">
                          <div>Tax ({it.taxRate}%)</div>
                          <div className="text-muted-foreground">Rp {taxAmount.toLocaleString('id-ID')}</div>
                        </TableCell>
                        <TableCell className="px-6">{it.description || '-'}</TableCell>
                        <TableCell className="px-6 text-right">
                          <div>Rp {total.toLocaleString('id-ID')}</div>
                          <div className="text-[10px] text-pink-600">after tax & discount</div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-start-4 md:col-span-1 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Sub Total</span><span>Rp {computeTotals.subTotal.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>Rp {computeTotals.discount.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>Rp {computeTotals.tax.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between font-medium border-t pt-2"><span>Total</span><span>Rp {computeTotals.total.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>Rp {(Math.max(computeTotals.total - (selectedInvoice?.dueAmount || 0), 0)).toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Credit Note Applied</span><span>Rp {0..toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Credit Note Issued</span><span>Rp {0..toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Due</span><span>Rp {(selectedInvoice?.dueAmount || 0).toLocaleString('id-ID')}</span></div>
              </div>
            </div>
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
              <CardHeader className="px-6">
                <CardTitle className="text-base font-normal">Receipt Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-6">
                <div className="overflow-x-auto w-full">
                  <Table className="w-full min-w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Payment Receipt</TableHead>
                        <TableHead className="px-6">Date</TableHead>
                        <TableHead className="px-6">Amount</TableHead>
                        <TableHead className="px-6">Payment Type</TableHead>
                        <TableHead className="px-6">Account</TableHead>
                        <TableHead className="px-6">Reference</TableHead>
                        <TableHead className="px-6">Description</TableHead>
                        <TableHead className="px-6">Receipt</TableHead>
                        <TableHead className="px-6">OrderId</TableHead>
                        <TableHead className="px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No receipts found</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
              <CardHeader className="px-6">
                <CardTitle className="text-base font-normal">Credit Note Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-6">
                <div className="overflow-x-auto w-full">
                  <Table className="w-full min-w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Credit Note</TableHead>
                        <TableHead className="px-6">Date</TableHead>
                        <TableHead className="px-6">Amount</TableHead>
                        <TableHead className="px-6">Description</TableHead>
                        <TableHead className="px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No Data Found</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (createDialogOpen) {
    return (
      <div className="space-y-6 w-full">
        <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
          <CardHeader className="px-6">
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-lg font-semibold">{editingId ? 'Edit Invoice' : 'Create Invoice'}</CardTitle>
              <CardDescription>{editingId ? 'Update invoice information.' : 'Create a new invoice. Fill in the required information.'}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                onClick={() => handleDialogOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
          <CardContent className="px-6">
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">
                      Customer <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.customer}
                      onValueChange={(value) => setFormData({ ...formData, customer: value })}
                      required
                    >
                      <SelectTrigger id="customer" className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3">
                        <SelectValue placeholder="Select Customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create customer here. <span className="font-medium text-primary cursor-pointer">Create customer</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">
                      Issue Date <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      id="issueDate"
                      value={formData.issueDate}
                      onValueChange={(v) => setFormData({ ...formData, issueDate: v })}
                      placeholder="Set a date"
                      className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3"
                      iconPlacement="right"
                    />
                    <input tabIndex={-1} aria-hidden="true" className="sr-only" required value={formData.issueDate} onChange={() => {}} />
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input id="invoiceNumber" value={invoiceNumber} disabled className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger id="category" className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create category here. <Link href="/accounting/setup/custom-field?tab=category" className="font-medium text-primary">Create category</Link>
                    </p>
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="dueDate">
                        Due Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                        className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3"
                      />
                    </div>
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="refNumber">Ref Number</Label>
                      <Input
                        id="refNumber"
                        type="text"
                        value={formData.refNumber}
                        onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })}
                        placeholder="Enter Ref Number"
                        className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-lg font-semibold">Product & Services</h5>
                  <Button type="button" variant="blue" size="sm" className="shadow-none" onClick={addItem}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add item
                  </Button>
                </div>

                {items.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-4 py-3 min-w-[200px]">Items <span className="text-red-500">*</span></TableHead>
                            <TableHead className="px-4 py-3 min-w-[120px]">Quantity <span className="text-red-500">*</span></TableHead>
                            <TableHead className="px-4 py-3 min-w-[150px]">Price <span className="text-red-500">*</span></TableHead>
                            <TableHead className="px-4 py-3 min-w-[130px]">Discount</TableHead>
                            <TableHead className="px-4 py-3 min-w-[150px]">Tax (%)</TableHead>
                            <TableHead className="px-4 py-3 text-right min-w-[150px]">Amount <br /><small className="text-xs text-muted-foreground">after tax & discount</small></TableHead>
                            <TableHead className="px-4 py-3 min-w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <React.Fragment key={item.id}>
                              <TableRow>
                                <TableCell className="px-4 py-3">
                                  <Select
                                    value={item.item}
                                    onValueChange={(value) => updateItem(item.id, 'item', value)}
                                    required
                                  >
                                    <SelectTrigger className="min-w-[180px]">
                                      <SelectValue placeholder="Select Item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockProducts.map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                          {product.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                      className="w-24"
                                      placeholder="Qty"
                                      required
                                      min="0"
                                      step="0.01"
                                    />
                                    {item.item && (
                                      <span className="text-xs text-muted-foreground">
                                        {mockProducts.find(p => p.id.toString() === item.item)?.unit || ''}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={item.price}
                                      onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                      className="w-32"
                                      placeholder="Price"
                                      required
                                      min="0"
                                      step="0.01"
                                    />
                                    <span className="text-xs text-muted-foreground">Rp</span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={item.discount}
                                      onChange={(e) => updateItem(item.id, 'discount', e.target.value)}
                                      className="w-28"
                                      placeholder="Discount"
                                      min="0"
                                      step="0.01"
                                    />
                                    <span className="text-xs text-muted-foreground">Rp</span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <Select
                                    value={item.tax || "none"}
                                    onValueChange={(value) => {
                                      if (value === "none") {
                                        updateItem(item.id, 'tax', '')
                                        updateItem(item.id, 'taxRate', '0')
                                      } else {
                                        const tax = mockTaxes.find(t => t.id.toString() === value)
                                        updateItem(item.id, 'tax', value)
                                        updateItem(item.id, 'taxRate', tax?.rate.toString() || '0')
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-40">
                                      <SelectValue placeholder="Select Tax" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">No Tax</SelectItem>
                                      {mockTaxes.map((tax) => (
                                        <SelectItem key={tax.id} value={tax.id.toString()}>
                                          {tax.name} ({tax.rate}%)
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right font-medium">
                                  Rp {item.amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                    onClick={() => removeItem(item.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={2} className="px-4 py-3">
                                  <Textarea
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                    placeholder="Description"
                                    rows={1}
                                    className="min-h-[60px]"
                                  />
                                </TableCell>
                                <TableCell colSpan={5}></TableCell>
                              </TableRow>
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    No items added. Click "Add item" to add products or services.
                  </div>
                )}

                {items.length > 0 && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">Sub Total (Rp)</span>
                          <span className="font-semibold">
                            Rp {calculateTotals().subTotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Discount (Rp)</span>
                          <span className="font-semibold">
                            Rp {calculateTotals().totalDiscount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Tax (Rp)</span>
                          <span className="font-semibold">
                            Rp {calculateTotals().totalTax.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between border-t-2 pt-2">
                          <span className="font-semibold text-blue-600">Total Amount (Rp)</span>
                          <span className="font-semibold text-blue-600">
                            Rp {calculateTotals().totalAmount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-6 justify-end">
                <Button variant="outline" type="button" className="shadow-none" onClick={() => handleDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button variant="blue" type="submit" className="shadow-none">
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Invoice</CardTitle>
            <CardDescription>Create and manage invoices for customers.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
            title="Export"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Invoice
          </Button>
          <Button
            variant="blue"
            size="sm"
            className="shadow-none h-7 px-4"
            title="Create"
            onClick={() => {
              setEditingId(null)
              setCreateDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
        <CardContent className="px-6 py-4">
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_14rem_auto] md:justify-start"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="invoice-filter-issue-date" className="text-sm font-medium">
                Issue Date
              </Label>
              <DatePicker
                id="invoice-filter-issue-date"
                value={dateFilter}
                onValueChange={(v) => setDateFilter(v)}
                placeholder="Set a date"
                className="!h-9 px-3"
                iconPlacement="right"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Customer</Label>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger
                  className={`w-full !h-9 ${
                    customerFilter === 'all' ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Customer</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className={`w-full !h-9 ${
                    statusFilter === 'all' ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Status</SelectItem>
                  {Object.entries(statusMap).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
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
                onClick={async () => {
                  const params = new URLSearchParams()
                  if (dateFilter) params.set("date", dateFilter)
                  if (statusFilter !== "all") params.set("status", statusFilter)
                  if (customerFilter !== "all") params.set("customerId", customerFilter)
                  const res = await fetch(`/api/invoices?${params.toString()}`).then(r => r.json()).catch(() => ({ success: false }))
                  if (res?.success && Array.isArray(res.data)) {
                    const loaded: InvoiceRow[] = res.data.map((e: any) => ({
                      id: e.id,
                      issueDate: e.issueDate,
                      dueDate: e.dueDate,
                      dueAmount: e.dueAmount,
                      status: e.status,
                      customer: e.customerId || '',
                      category: e.categoryId || '',
                      refNumber: '',
                      description: e.description || '',
                      items: (e.items || []).map((it: any) => ({
                        id: it.id,
                        item: it.item,
                        quantity: it.quantity,
                        price: it.price,
                        discount: it.discount,
                        tax: '',
                        taxRate: it.taxRate,
                        description: it.description || '',
                        amount: it.amount || 0,
                      })),
                    }))
                    setInvoices(loaded)
                    setFilteredInvoices(loaded)
                    setCurrentPage(1)
                  }
                }}
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

      {/* Invoice list table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="px-6">
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Invoice</TableHead>
                  <TableHead className="px-6">Issue Date</TableHead>
                  <TableHead className="px-6">Due Date</TableHead>
                  <TableHead className="px-6">Due Amount</TableHead>
                  <TableHead className="px-6">Status</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
                  <TableBody>
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="px-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none"
                          onClick={() => {
                            loadInvoiceDetail(invoice.id)
                          }}
                        >
                          {invoice.id}
                        </Button>
                      </TableCell>
                      <TableCell className="px-6">{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell className="px-6">
                        <span>{formatDate(invoice.dueDate)}</span>
                      </TableCell>
                      <TableCell className="px-6">
                        Rp {invoice.dueAmount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge className={statusMap[invoice.status].color}>
                          {statusMap[invoice.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                            title="View"
                            onClick={() => {
                              loadInvoiceDetail(invoice.id)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {(invoice.status !== 3 && invoice.status !== 4) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                              title="Edit"
                              asChild
                            >
                              <Link href={`/accounting/invoice/${invoice.id}/edit`}>
                                <Pencil className="h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(invoice)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 text-center py-8 text-muted-foreground">
                      No invoices found
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
                onPageChange={(page) => {
                  setCurrentPage(page)
                }}
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
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setInvoiceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

