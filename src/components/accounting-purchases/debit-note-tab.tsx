'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

type DebitNoteRow = {
  id: string
  number: number
  billId: string
  bill: {
    billId: string
    vendor?: { name: string }
  }
  date: string
  amount: number
  description: string | null
  status: number
}

const statusLabels = ['Pending', 'Partially Used', 'Fully Used']

function formatDebitNoteNumber(number: number) {
  return `#DN${String(number).padStart(5, '0')}`
}

function getDebitNoteStatusBadge(status: number) {
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

export function DebitNoteTab() {
  const searchParams = useSearchParams()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [rows, setRows] = useState<DebitNoteRow[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<DebitNoteRow | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initializedFromQuery, setInitializedFromQuery] = useState(false)

  const [formData, setFormData] = useState({
    billId: '',
    amount: '',
    date: '',
    description: '',
  })

  // Data for Select
  const [bills, setBills] = useState<{ id: string; label: string; vendorName: string }[]>([])

  useEffect(() => {
    fetchData()
    fetchBills()
  }, [])

  useEffect(() => {
    if (initializedFromQuery) return
    if (!bills.length) return

    const billIdFromQuery = searchParams.get('billId')
    const openCreate = searchParams.get('openCreate') === '1'

    if (billIdFromQuery && openCreate) {
      const exists = bills.some((b) => b.id === billIdFromQuery)
      if (exists) {
        setFormData((prev) => ({
          ...prev,
          billId: billIdFromQuery,
        }))
        setCreateDialogOpen(true)
        setInitializedFromQuery(true)
      }
    }
  }, [bills, initializedFromQuery, searchParams])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/debit-notes')
      const json = await res.json()
      if (json.success) {
        setRows(json.data)
      } else {
        toast.error(json.message || 'Gagal memuat data')
      }
    } catch (error) {
      toast.error('Gagal memuat data Debit Note')
    }
  }

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/bills') 
      const json = await res.json()
      if (json.success) {
        setBills(json.data.map((b: any) => ({
          id: b.billNumber, 
          label: b.billNumber, 
          vendorName: b.vendorName || '-'
        })))
      }
    } catch (error) {
      console.error('Failed to fetch bills', error)
    }
  }

  const filteredData = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.trim().toLowerCase()
    return rows.filter((n) => {
      return (
        formatDebitNoteNumber(n.number).toLowerCase().includes(q) ||
        n.bill.billId.toLowerCase().includes(q) ||
        (n.description || '').toLowerCase().includes(q)
      )
    })
  }, [search, rows])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize, search])

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        billId: '',
        amount: '',
        date: '',
        description: '',
      })
      setIsSubmitting(false)
    }
  }

  const handleEdit = (note: DebitNoteRow) => {
    setEditingId(note.id)
    setFormData({
      billId: note.billId,
      amount: String(note.amount),
      date: new Date(note.date).toISOString().split('T')[0],
      description: note.description || '',
    })
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (note: DebitNoteRow) => {
    setNoteToDelete(note)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return
    try {
      const res = await fetch(`/api/debit-notes/${noteToDelete.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Debit Note berhasil dihapus')
        fetchData()
      } else {
        const json = await res.json()
        toast.error(json.message || 'Gagal menghapus Debit Note')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus')
    }
    setNoteToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      billId: formData.billId,
      date: formData.date,
      amount: Number(formData.amount),
      description: formData.description,
    }

    try {
      const url = editingId ? `/api/debit-notes/${editingId}` : '/api/debit-notes'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (json.success) {
        toast.success(editingId ? 'Debit Note diperbarui' : 'Debit Note dibuat')
        fetchData()
        handleDialogOpenChange(false)
      } else {
        toast.error(json.message || 'Gagal menyimpan Debit Note')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Debit Note</CardTitle>
            <CardDescription>Manage debit notes for supplier bills.</CardDescription>
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
                Create Debit Note
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Debit Note' : 'Create New Debit Note'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="bill">
                    Bill <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.billId}
                    onValueChange={(value) => setFormData({ ...formData, billId: value })}
                    required
                    disabled={!!editingId} // Disable bill selection on edit to prevent inconsistency
                  >
                    <SelectTrigger id="bill">
                      <SelectValue placeholder="Select Bill" />
                    </SelectTrigger>
                    <SelectContent>
                      {bills.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.label} - {b.vendorName}
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
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
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
                    required
                  />
                </div>

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
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" className="shadow-none" onClick={() => handleDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="blue" className="shadow-none" disabled={isSubmitting}>
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

      {/* Debit Notes Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Debit Note List</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search debit notes..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
              />
              {search.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => {
                    setSearch('')
                    setCurrentPage(1)
                  }}
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
                  <TableHead className="px-6">Number</TableHead>
                  <TableHead className="px-6">Bill</TableHead>
                  <TableHead className="px-6">Vendor</TableHead>
                  <TableHead className="px-6">Date</TableHead>
                  <TableHead className="px-6">Amount</TableHead>
                  <TableHead className="px-6">Description</TableHead>
                  <TableHead className="px-6">Status</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="px-6">
                        <Button variant="outline" size="sm" className="shadow-none">
                          {formatDebitNoteNumber(note.number)}
                        </Button>
                      </TableCell>
                      <TableCell className="px-6">
                        <Button asChild variant="ghost" size="sm" className="shadow-none p-0 h-auto hover:bg-transparent text-blue-600 hover:underline justify-start">
                          <Link href={`/accounting/purchases?tab=bill`}>
                            {note.bill.billId}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="px-6">
                        {note.bill.vendor?.name || '-'}
                      </TableCell>
                      <TableCell className="px-6">{formatDate(note.date)}</TableCell>
                      <TableCell className="px-6 font-medium">{formatPrice(note.amount)}</TableCell>
                      <TableCell className="px-6">{note.description || '-'}</TableCell>
                      <TableCell className="px-6">{getDebitNoteStatusBadge(note.status)}</TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => handleEdit(note)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(note)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="px-6 text-center py-8 text-muted-foreground">
                      No debit notes found
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
            <AlertDialogTitle>Delete Debit Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this debit note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
