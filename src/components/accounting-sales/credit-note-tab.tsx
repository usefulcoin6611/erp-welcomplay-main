'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Search,
  X,
  Pencil,
  Trash2,
} from 'lucide-react'

type CreditNoteRow = {
  id: string
  creditId: number
  invoice: string
  invoiceId: string
  date: string
  amount: number
  description: string
  status: number
}

type InvoiceOption = {
  id: string
  invoiceId: string
}

const statusLabels = ['Pending', 'Partially Used', 'Fully Used']

function formatCreditNoteId(creditId: number) {
  return `#CN${String(creditId).padStart(5, '0')}`
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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

function getStatusBadge(status: number) {
  switch (status) {
    case 0:
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{statusLabels[0]}</Badge>
    case 1:
      return <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">{statusLabels[1]}</Badge>
    case 2:
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{statusLabels[2]}</Badge>
    default:
      return <Badge>{statusLabels[status]}</Badge>
  }
}

export function CreditNoteTab() {
  const [creditNotes, setCreditNotes] = useState<CreditNoteRow[]>([])
  const [invoices, setInvoices] = useState<InvoiceOption[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [creditNoteToDelete, setCreditNoteToDelete] = useState<CreditNoteRow | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [formData, setFormData] = useState({
    invoice: '',
    date: '',
    amount: '',
    description: '',
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cnRes, invRes] = await Promise.all([
          fetch('/api/credit-notes').then((r) => r.json()).catch(() => ({ success: false })),
          fetch('/api/invoices').then((r) => r.json()).catch(() => ({ success: false })),
        ])
        if (cnRes?.success && Array.isArray(cnRes.data)) {
          setCreditNotes(cnRes.data as CreditNoteRow[])
        }
        if (invRes?.success && Array.isArray(invRes.data)) {
          setInvoices(
            invRes.data.map((e: any) => ({
              id: e.id as string,
              invoiceId: e.id as string,
            })),
          )
        }
      } catch {
      }
    }
    loadData()
  }, [])

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        invoice: '',
        date: '',
        amount: '',
        description: '',
      })
    }
  }

  const handleEdit = (creditNote: CreditNoteRow) => {
    setEditingId(creditNote.id)
    setFormData({
      invoice: creditNote.invoiceId || '',
      date: creditNote.date,
      amount: String(creditNote.amount || 0),
      description: creditNote.description === '-' ? '' : creditNote.description,
    })
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (creditNote: CreditNoteRow) => {
    setCreditNoteToDelete(creditNote)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!creditNoteToDelete) return
    const res = await fetch(`/api/credit-notes/${creditNoteToDelete.id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => null)
    if (!res.ok || json?.success === false) {
      alert(json?.message || 'Gagal menghapus credit note')
      return
    }
    const listRes = await fetch('/api/credit-notes').then((r) => r.json()).catch(() => ({ success: false }))
    if (listRes?.success && Array.isArray(listRes.data)) {
      setCreditNotes(listRes.data as CreditNoteRow[])
    }
    setCreditNoteToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      invoiceId: formData.invoice,
      date: formData.date,
      amount: Number(formData.amount) || 0,
      description: formData.description || '',
    }

    if (editingId) {
      const res = await fetch(`/api/credit-notes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || json?.success === false) {
        alert(json?.message || 'Gagal memperbarui credit note')
        return
      }
    } else {
      const res = await fetch('/api/credit-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || json?.success === false) {
        alert(json?.message || 'Gagal membuat credit note')
        return
      }
    }

    const listRes = await fetch('/api/credit-notes').then((r) => r.json()).catch(() => ({ success: false }))
    if (listRes?.success && Array.isArray(listRes.data)) {
      setCreditNotes(listRes.data as CreditNoteRow[])
    }

    setCreateDialogOpen(false)
    setEditingId(null)
    setFormData({
      invoice: '',
      date: '',
      amount: '',
      description: '',
    })
  }

  const editingNote = editingId ? creditNotes.find((cn) => cn.id === editingId) : null

  // Filter credit notes by search
  const filteredCreditNotes = useMemo(() => {
    if (!search.trim()) return creditNotes
    
    const q = search.toLowerCase()
    return creditNotes.filter((cn) =>
      formatCreditNoteId(cn.creditId).toLowerCase().includes(q) ||
      cn.invoice.toLowerCase().includes(q) ||
      cn.description.toLowerCase().includes(q) ||
      formatDate(cn.date).toLowerCase().includes(q)
    )
  }, [search, creditNotes])

  // Paginated credit notes
  const paginatedCreditNotes = filteredCreditNotes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalRecords = filteredCreditNotes.length

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  return (
    <div className="space-y-4 w-full">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Credit Note</CardTitle>
            <CardDescription>Manage credit notes linked to invoices.</CardDescription>
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
                Create Credit Note
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Credit Note' : 'Create Credit Note'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice">
                    Invoice <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.invoice}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, invoice: value }))
                    }}
                    required
                  >
                    <SelectTrigger id="invoice">
                      <SelectValue placeholder="Select Invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.map((inv) => (
                        <SelectItem key={inv.id} value={inv.invoiceId}>
                          {inv.invoiceId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                  {editingId && editingNote && (
                    <p className="mt-1 text-xs text-red-500">
                      Note: You can add maximum amount up to {formatPrice(editingNote.amount)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter Description"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="shadow-none" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="blue" className="shadow-none">
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Credit Notes Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Credit Notes</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search credit notes..."
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
                  <TableHead className="px-6">Credit Note</TableHead>
                  <TableHead className="px-6">Invoice</TableHead>
                  <TableHead className="px-6">Date</TableHead>
                  <TableHead className="px-6">Amount</TableHead>
                  <TableHead className="px-6">Description</TableHead>
                  <TableHead className="px-6">Status</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCreditNotes.length > 0 ? (
                  paginatedCreditNotes.map((creditNote) => (
                    <TableRow key={creditNote.id}>
                      <TableCell className="px-6">
                        <Badge variant="outline">
                          {formatCreditNoteId(creditNote.creditId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <Button asChild variant="outline" size="sm" className="shadow-none">
                          <Link href={`/accounting/sales?tab=invoice&invoiceId=${encodeURIComponent(creditNote.invoiceId)}`}>
                            {creditNote.invoice}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="px-6">{formatDate(creditNote.date)}</TableCell>
                      <TableCell className="px-6">
                        <span className="font-medium">{formatPrice(creditNote.amount)}</span>
                      </TableCell>
                      <TableCell className="px-6">{creditNote.description || '-'}</TableCell>
                      <TableCell className="px-6">
                        {getStatusBadge(creditNote.status)}
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => handleEdit(creditNote)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(creditNote)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 text-center py-8 text-muted-foreground">
                      No credit notes found
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
            <AlertDialogTitle>Delete Credit Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this credit note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCreditNoteToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
