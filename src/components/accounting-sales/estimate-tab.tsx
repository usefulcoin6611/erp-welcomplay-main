'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
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
  Copy,
  ArrowLeft,
  ArrowLeftRight
} from "lucide-react"
import * as QRCode from 'qrcode'

// Data berasal dari API (seed/production)

const statusMap: {
  [key: number]: { label: string }
} = {
  0: { label: "Draft" },
  1: { label: "Open" },
  2: { label: "Accepted" },
  3: { label: "Declined" },
  4: { label: "Close" },
}

function getProposalStatusClasses(status: number) {
  switch (status) {
    case 0: return "bg-blue-100 text-blue-700 border-none"
    case 1: return "bg-cyan-100 text-cyan-700 border-none"
    case 2: return "bg-green-100 text-green-700 border-none"
    case 3: return "bg-yellow-100 text-yellow-700 border-none"
    case 4: return "bg-red-100 text-red-700 border-none"
    default: return "bg-gray-100 text-gray-700 border-none"
  }
}

const ESTIMATE_STATUS_OPTIONS = [
  { value: '0', label: statusMap[0].label },
  { value: '1', label: statusMap[1].label },
  { value: '2', label: statusMap[2].label },
  { value: '3', label: statusMap[3].label },
  { value: '4', label: statusMap[4].label },
]

export function EstimateTab() {
  type ProposalItem = {
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

  type ProposalRow = {
    id: string
    customer: string
    customerCode?: string
    category: string
    issueDate: string
    status: number
    total: number
    description?: string
    items?: ProposalItem[]
  }

  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [filteredProposals, setFilteredProposals] = useState<ProposalRow[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [proposalToDelete, setProposalToDelete] = useState<ProposalRow | null>(null)
  const [formData, setFormData] = useState({
    customer: '',
    category: '',
    issueDate: '',
    description: '',
  })
  const [items, setItems] = useState<ProposalItem[]>([])

  // Customers and categories from backend
  const [customers, setCustomers] = useState<{ id: string; name: string; customerCode: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const router = useRouter()

  const handleEdit = async (proposal: ProposalRow) => {
    try {
      const res = await fetch(`/api/estimates/${proposal.id}`)
      const json = await res.json()
      if (!json.success) return
      const e = json.data as any
      setEditingId(e.estimateId)
      setFormData({
        customer: e.customerId != null ? String(e.customerId) : '',
        category: e.categoryId != null ? String(e.categoryId) : '',
        issueDate: (e.issueDate ?? '').toString().slice(0, 10),
        description: e.description ?? '',
      })
      const mappedItems = (e.items ?? []).map((it: any) => {
        const mapped = {
          id: `item-${it.id}`,
          item: '',
          quantity: String(it.quantity ?? '0'),
          price: String(it.price ?? '0'),
          discount: String(it.discount ?? '0'),
          tax: '',
          taxRate: String(it.taxRate ?? '0'),
          description: it.description ?? '',
          amount: 0,
        }
        mapped.amount = calculateItemAmount(mapped)
        return mapped
      })
      setItems(mappedItems)
      setCreateDialogOpen(true)
    } catch (_) {}
  }

  type EstimateDetail = {
    estimateId: string
    status: number
    issueDate: string
    total: number
    description?: string
    customerId?: string
    categoryId?: string
    customer: { name: string; customerCode: string }
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

  const [selectedEstimate, setSelectedEstimate] = useState<EstimateDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [proposalPrintSetting, setProposalPrintSetting] = useState<{
    template: string
    qrDisplay: boolean
    color: string
    logoDataUrl?: string | null
  } | null>(null)

  const computeTotals = React.useMemo(() => {
    if (!selectedEstimate) return { subTotal: 0, discount: 0, tax: 0, total: 0 }
    const subTotal = selectedEstimate.items.reduce((sum, it) => sum + (it.quantity * it.price - it.discount), 0)
    const tax = selectedEstimate.items.reduce((sum, it) => {
      const base = it.quantity * it.price - it.discount
      return sum + (it.taxRate / 100) * base
    }, 0)
    const total = selectedEstimate.items.reduce((sum, it) => sum + it.amount, 0) || subTotal + tax
    const discount = selectedEstimate.items.reduce((sum, it) => sum + it.discount, 0)
    return { subTotal, discount, tax, total }
  }, [selectedEstimate])

  // Load initial data from API
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [estimatesRes, customersRes, categoriesRes] = await Promise.all([
          fetch('/api/estimates'),
          fetch('/api/customers'),
          fetch('/api/categories')
        ])
        const estimatesJson = await estimatesRes.json()
        const customersJson = await customersRes.json()
        const categoriesJson = await categoriesRes.json()
        if (estimatesJson.success) {
          setProposals(estimatesJson.data)
          setFilteredProposals(estimatesJson.data)
        }
        if (customersJson.success) {
          setCustomers(customersJson.data.map((c: any) => ({ id: c.id, name: c.name, customerCode: c.customerCode })))
        }
        if (categoriesJson.success) {
          setCategories(categoriesJson.data.map((c: any) => ({ id: c.id, name: c.name })))
        }
      } catch (err: any) {
        setError('Gagal memuat data estimates')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadPrintSettings = async () => {
      try {
        const res = await fetch('/api/settings/accounting-print')
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success || !json.data) return
        const data = json.data as {
          proposal?: { template?: string; qrDisplay?: boolean; color?: string; logoDataUrl?: string | null }
        }
        if (data.proposal) {
          setProposalPrintSetting({
            template: data.proposal.template || 'new-york',
            qrDisplay: typeof data.proposal.qrDisplay === 'boolean' ? data.proposal.qrDisplay : true,
            color: data.proposal.color || '#1e40af',
            logoDataUrl: data.proposal.logoDataUrl ?? null,
          })
        } else {
          setProposalPrintSetting({
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
    if (!selectedEstimate) {
      setQrDataUrl(null)
      return
    }
    const text = selectedEstimate.estimateId ? String(selectedEstimate.estimateId) : ''
    QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      width: 100,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
      .then((url: string) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(null))
  }, [selectedEstimate])
  
  // Filter proposals
  useEffect(() => {
    let filtered = [...proposals]
    
    if (dateFilter) {
      filtered = filtered.filter(p => p.issueDate === dateFilter)
    }
    
    if (statusFilter !== '') {
      filtered = filtered.filter(p => p.status === parseInt(statusFilter))
    }
    
    setFilteredProposals(filtered)
    setCurrentPage(1)
  }, [dateFilter, statusFilter, proposals])

  if (selectedEstimate) {
    return (
      <div className="space-y-6">
        <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
          <CardHeader className="px-6">
            <div className="flex items-center gap-4 w-full">
              <div className="min-w-0 space-y-1 flex-1">
                <CardTitle className="text-base font-normal truncate">Proposal Detail</CardTitle>
                <p className="text-sm text-muted-foreground truncate">{selectedEstimate.estimateId}</p>
              </div>
              <div className="ml-auto flex items-center gap-2 justify-end">
                <Button variant="outline" size="sm" className="shadow-none h-8 px-3 bg-green-50 text-green-700 hover:bg-green-100 border-green-100">
                  Convert Invoice
                </Button>
                <Button variant="outline" size="sm" className="shadow-none h-8 px-3 bg-red-50 text-red-700 hover:bg-red-100 border-red-100" onClick={() => {
                  fetch(`/api/estimates/${selectedEstimate.estimateId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 3 }) }).then(() => {
                    setSelectedEstimate({ ...selectedEstimate, status: 3 })
                  })
                }}>
                  Reject Proposal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="shadow-none h-8 px-3 bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-100"
                  onClick={() => {
                    setEditingId(selectedEstimate.estimateId)
                    setFormData({
                      customer: selectedEstimate.customerId != null ? String(selectedEstimate.customerId) : '',
                      category: selectedEstimate.categoryId != null ? String(selectedEstimate.categoryId) : '',
                      issueDate: new Date(selectedEstimate.issueDate).toISOString().slice(0, 10),
                      description: selectedEstimate.description ?? '',
                    })
                    const mappedItems = (selectedEstimate.items ?? []).map((it: any) => {
                      const mapped = {
                        id: `item-${it.id}`,
                        item: '',
                        quantity: String(it.quantity ?? '0'),
                        price: String(it.price ?? '0'),
                        discount: String(it.discount ?? '0'),
                        tax: '',
                        taxRate: String(it.taxRate ?? '0'),
                        description: it.description ?? '',
                        amount: 0,
                      }
                      mapped.amount = calculateItemAmount(mapped)
                      return mapped
                    })
                    setItems(mappedItems)
                    setSelectedEstimate(null)
                    setCreateDialogOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="shadow-none h-8 w-8 p-0" onClick={() => setSelectedEstimate(null)}>
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
                    <div className="font-medium">Create Proposal</div>
                    <div className="text-muted-foreground">{new Date(selectedEstimate.issueDate).toLocaleDateString('id-ID')}</div>
                  </div>
                  <Badge className={getProposalStatusClasses(0)}>{statusMap[0].label}</Badge>
                </div>
              </div>
              <div className="border rounded-md p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">Send Proposal</div>
                    <div className="text-muted-foreground">{new Date(selectedEstimate.issueDate).toLocaleDateString('id-ID')}</div>
                  </div>
                  <Badge className={getProposalStatusClasses(Math.max(1, selectedEstimate.status))}>{statusMap[Math.max(1, selectedEstimate.status)].label}</Badge>
                </div>
              </div>
              <div className="border rounded-md p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">Proposal Status</div>
                    <div className="text-muted-foreground">Status</div>
                  </div>
                  <Select value={String(selectedEstimate.status)} onValueChange={(v) => {
                    const n = parseInt(v, 10)
                    fetch(`/api/estimates/${selectedEstimate.estimateId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: n }) }).then(() => {
                      setSelectedEstimate({ ...selectedEstimate, status: n })
                    })
                  }}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={statusMap[selectedEstimate.status].label} />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTIMATE_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
          <CardHeader className="px-6">
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {proposalPrintSetting?.logoDataUrl && (
                  <div className="w-10 h-10 rounded border border-border bg-white flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proposalPrintSetting.logoDataUrl}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <CardTitle className="text-base font-normal">Proposal</CardTitle>
                  <span className="text-base font-semibold block truncate">#{selectedEstimate.estimateId}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 space-y-6">
            <div className="flex justify-end">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-muted-foreground">Issue Date :</div>
                  <div className="text-sm font-medium">{new Date(selectedEstimate.issueDate).toLocaleDateString('id-ID')}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1 text-sm">
                <div className="font-medium">Billed To :</div>
                <div>{selectedEstimate.customer.name}</div>
                <div className="text-muted-foreground">{selectedEstimate.customer.customerCode}</div>
                <div className="text-muted-foreground">Tax Number : 001</div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">Shipped To :</div>
                <div>{selectedEstimate.customer.name}</div>
                <div className="text-muted-foreground">{selectedEstimate.customer.customerCode}</div>
              </div>
              <div className="flex items-start justify-end">
                <div className="flex flex-col items-end gap-3">
                  {proposalPrintSetting?.qrDisplay !== false && (
                    qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR"
                        className="w-[100px] h-[100px] rounded-lg border bg-white p-1"
                        style={{ borderColor: proposalPrintSetting?.color || 'hsl(var(--border))' }}
                      />
                    ) : (
                      <div
                        className="w-[100px] h-[100px] rounded-lg bg-white p-2 border"
                        style={{ borderColor: proposalPrintSetting?.color || 'hsl(var(--border))' }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Status :</span>{' '}
              <Badge className={getProposalStatusClasses(selectedEstimate.status)}>
                {statusMap[selectedEstimate.status].label}
              </Badge>
            </div>

            <div>
              <div className="text-sm font-medium">Product Summary</div>
              <div className="text-xs text-muted-foreground">All items here cannot be deleted.</div>
            </div>

            {loadingDetail ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : detailError ? (
              <div className="text-sm text-red-600">Error: {detailError}</div>
            ) : (
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
                    {selectedEstimate.items.map((it, idx) => {
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
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-start-4 md:col-span-1 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Sub Total</span><span>Rp {computeTotals.subTotal.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>Rp {computeTotals.discount.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>Rp {computeTotals.tax.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between font-medium border-t pt-2"><span>Total</span><span>Rp {computeTotals.total.toLocaleString('id-ID')}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleView = async (proposal: ProposalRow) => {
    setLoadingDetail(true)
    setDetailError(null)
    try {
      const res = await fetch(`/api/estimates/${proposal.id}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Failed to fetch estimate detail')
      const e = json.data as any
      const detail: EstimateDetail = {
        estimateId: e.estimateId,
        status: e.status,
        issueDate: e.issueDate,
        total: e.total,
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
      }
      setSelectedEstimate(detail)
    } catch (err: any) {
      setDetailError(err.message || 'Gagal memuat detail')
    } finally {
      setLoadingDetail(false)
    }
  }

  

  const handleDeleteClick = (proposal: ProposalRow) => {
    setProposalToDelete(proposal)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!proposalToDelete) return
    const del = async () => {
      await fetch(`/api/estimates/${proposalToDelete.id}`, { method: 'DELETE' })
      const res = await fetch('/api/estimates')
      const json = await res.json()
      if (json.success) {
        setProposals(json.data)
        setFilteredProposals(json.data)
      }
      setProposalToDelete(null)
      setDeleteDialogOpen(false)
    }
    del()
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
        // Auto-fill price when item is selected
        if (field === 'item' && value) {
          const product = mockProducts.find(p => p.id.toString() === value)
          if (product) {
            updated.price = product.price.toString()
          }
        }
        // Recalculate amount when quantity, price, discount, or tax changes
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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { totalAmount } = calculateTotals()

    const submit = async () => {
      if (editingId) {
        await fetch(`/api/estimates/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: formData.customer,
            categoryId: formData.category,
            issueDate: formData.issueDate,
            description: formData.description,
            total: totalAmount,
          })
        })
      } else {
        await fetch('/api/estimates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: formData.customer,
            categoryId: formData.category,
            issueDate: formData.issueDate,
            description: formData.description,
            status: 0,
            total: totalAmount,
            items,
          })
        })
      }
      const res = await fetch('/api/estimates')
      const json = await res.json()
      if (json.success) {
        setProposals(json.data)
        setFilteredProposals(json.data)
      }
      setCreateDialogOpen(false)
      setEditingId(null)
      setFormData({
        customer: '',
        category: '',
        issueDate: '',
        description: '',
      })
      setItems([])
    }
    submit()
  }

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        customer: '',
        category: '',
        issueDate: '',
        description: '',
      })
      setItems([])
    }
  }

  

  // Paginated proposals
  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalRecords = filteredProposals.length

  const handleReset = () => {
    setDateFilter('')
    setStatusFilter('')
  }

  if (createDialogOpen) {
    return (
      <div className="space-y-6 w-full">
        <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
          <CardHeader className="px-6">
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-lg font-semibold">{editingId ? 'Edit Proposal' : 'Create Proposal'}</CardTitle>
              <CardDescription>{editingId ? 'Update proposal information.' : 'Create a new proposal. Fill in the required information.'}</CardDescription>
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
                          <SelectItem key={customer.id} value={customer.id.toString()}>
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
                    <input
                      tabIndex={-1}
                      aria-hidden="true"
                      className="sr-only"
                      required
                      value={formData.issueDate}
                      onChange={() => {}}
                    />
                    <div className="space-y-2 mt-3">
                      <Label htmlFor="proposalNumber">Proposal Number</Label>
                      <Input
                        id="proposalNumber"
                        value={editingId ? `#${editingId}` : `#PROP${String(proposals.length + 1).padStart(5, '0')}`}
                        disabled
                        className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3"
                      />
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
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create category here. <Link href="/accounting/setup/custom-field?tab=category" className="font-medium text-primary">Create category</Link>
                    </p>
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
                            <TableRow key={item.id}>
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
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={item.discount}
                                  onChange={(e) => updateItem(item.id, 'discount', e.target.value)}
                                  className="w-28"
                                  placeholder="Discount"
                                  min="0"
                                  step="0.01"
                                />
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={item.taxRate}
                                  onChange={(e) => updateItem(item.id, 'taxRate', e.target.value)}
                                  className="w-28"
                                  placeholder="Tax %"
                                  min="0"
                                  step="0.01"
                                />
                              </TableCell>
                              <TableCell className="px-4 py-3 text-right">
                                Rp {calculateItemAmount(item).toLocaleString('id-ID')}
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
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
            <CardTitle className="text-lg font-semibold">Estimate</CardTitle>
            <CardDescription>Create and manage estimates for customers.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
            title="Export"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Estimate
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
            Create Estimate
          </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
        <CardContent className="px-6 py-4">
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_auto] md:justify-start"
            onSubmit={(e) => {
              e.preventDefault()
              // Filter is handled by useEffect
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="estimate-filter-date" className="text-sm font-medium">
                Date
              </Label>
              <DatePicker
                id="estimate-filter-date"
                value={dateFilter}
                onValueChange={(v) => setDateFilter(v)}
                placeholder="Set a date"
                className="!h-9 px-3"
                iconPlacement="right"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className={`w-full !h-9 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground ${
                    statusFilter === '' ? 'text-muted-foreground' : ''
                  }`}
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__header" disabled>
                    Select Status
                  </SelectItem>
                  {ESTIMATE_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
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

      

      {/* Proposal list table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="px-6">
          <CardTitle>Estimate List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Proposal</TableHead>
                  <TableHead className="px-6">Category</TableHead>
                  <TableHead className="px-6">Issue Date</TableHead>
                  <TableHead className="px-6">Status</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProposals.length > 0 ? (
                  paginatedProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell className="px-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none"
                          onClick={() => handleView(proposal)}
                        >
                          {proposal.id}
                        </Button>
                      </TableCell>
                      <TableCell className="px-6">{proposal.category}</TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          <span>{proposal.issueDate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge className={getProposalStatusClasses(proposal.status)}>
                          {statusMap[proposal.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2 justify-start">
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100" title="Convert Invoice">
                            <ArrowLeftRight className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Duplicate">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100" title="View">
                            <span onClick={() => handleView(proposal)}>
                              <Eye className="h-3 w-3" />
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                            title="Edit"
                            onClick={() => handleEdit(proposal)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(proposal)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 text-center py-8 text-muted-foreground">
                      No proposals found
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
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this estimate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProposalToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
