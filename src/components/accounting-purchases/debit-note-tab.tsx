'use client'

import { useEffect, useMemo, useState } from 'react'
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
  RefreshCw,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

// Mock debit notes
const debitNotes = [
  {
    id: 1,
    debitId: 1,
    bill: 'BILL-2025-005',
    billId: 5,
    date: '2025-11-09',
    amount: 1500000,
    description: 'Price adjustment for overbilled items',
    status: 0, // 0: Pending, 1: Partially Used, 2: Fully Used
  },
  {
    id: 2,
    debitId: 2,
    bill: 'BILL-2025-006',
    billId: 6,
    date: '2025-11-10',
    amount: 950000,
    description: 'Return of damaged goods',
    status: 1,
  },
]

const statusLabels = ['Pending', 'Partially Used', 'Fully Used']

function formatDebitNoteId(debitId: number) {
  return `#DN${String(debitId).padStart(5, '0')}`
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [rows, setRows] = useState<typeof debitNotes>(debitNotes)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<(typeof debitNotes)[number] | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [formData, setFormData] = useState({
    bill: '',
    item: '',
    amount: '',
    date: '',
    description: '',
  })

  // mock bills + bill items (to mimic AJAX items load)
  const mockBills = [
    { id: '5', label: 'BILL-2025-005' },
    { id: '6', label: 'BILL-2025-006' },
    { id: '7', label: 'BILL-2025-007' },
  ]

  const mockBillItems: Record<string, { id: string; name: string; price: number }[]> = {
    '5': [
      { id: '501', name: 'Printer Paper A4', price: 250000 },
      { id: '502', name: 'Ink Cartridge', price: 500000 },
    ],
    '6': [
      { id: '601', name: 'Courier Service', price: 950000 },
    ],
    '7': [
      { id: '701', name: 'IT Maintenance', price: 1200000 },
    ],
  }

  const filteredData = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.trim().toLowerCase()
    return rows.filter((n) => {
      return (
        formatDebitNoteId(n.debitId).toLowerCase().includes(q) ||
        n.bill.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
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
        bill: '',
        item: '',
        amount: '',
        date: '',
        description: '',
      })
    }
  }

  const handleEdit = (note: (typeof debitNotes)[number]) => {
    setEditingId(note.id)
    setFormData({
      bill: String(note.billId),
      item: '',
      amount: String(note.amount),
      date: note.date,
      description: note.description || '',
    })
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (note: (typeof debitNotes)[number]) => {
    setNoteToDelete(note)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!noteToDelete) return
    setRows((prev) => prev.filter((n) => n.id !== noteToDelete.id))
    setNoteToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const billLabel = mockBills.find((b) => b.id === formData.bill)?.label ?? ''
    const nextAmount = Number(formData.amount) || 0

    if (editingId) {
      setRows((prev) =>
        prev.map((n) =>
          n.id === editingId
            ? {
                ...n,
                bill: billLabel || n.bill,
                billId: parseInt(formData.bill) || n.billId,
                date: formData.date,
                amount: nextAmount,
                description: formData.description || '-',
              }
            : n,
        ),
      )
    } else {
      const nextId = rows.length > 0 ? Math.max(...rows.map((n) => n.id)) + 1 : 1
      const nextDebitId = rows.length > 0 ? Math.max(...rows.map((n) => n.debitId)) + 1 : 1
      const newRow = {
        id: nextId,
        debitId: nextDebitId,
        bill: billLabel,
        billId: parseInt(formData.bill) || 0,
        date: formData.date,
        amount: nextAmount,
        description: formData.description || '-',
        status: 0,
      }
      setRows((prev) => [newRow, ...prev])
    }

    handleDialogOpenChange(false)
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
                    value={formData.bill}
                    onValueChange={(value) => setFormData({ ...formData, bill: value, item: '', amount: '' })}
                    required
                  >
                    <SelectTrigger id="bill">
                      <SelectValue placeholder="Select Bill" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBills.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item">
                    Item <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.item}
                    onValueChange={(value) => {
                      const picked = mockBillItems[formData.bill]?.find((i) => i.id === value)
                      setFormData({
                        ...formData,
                        item: value,
                        amount: picked ? String(picked.price) : '',
                      })
                    }}
                    required
                    disabled={!formData.bill}
                  >
                    <SelectTrigger id="item">
                      <SelectValue placeholder="Select Item" />
                    </SelectTrigger>
                    <SelectContent>
                      {(mockBillItems[formData.bill] || []).map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.name}
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
                    disabled={!formData.bill}
                  />
                  {formData.bill && (
                    <p className="text-xs text-muted-foreground">
                      Note: you can add maximum amount up to selected item value.
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
                    max={new Date().toISOString().split('T')[0]}
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

      {/* Debit Notes Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pl-8 pr-6">
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
                className="h-9 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
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
        <CardContent>
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead>Debit Note</TableHead>
                  <TableHead>Bill</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>
                        <Button variant="outline" size="sm" className="shadow-none">
                          {formatDebitNoteId(note.debitId)}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm" className="shadow-none">
                          <Link href={`/accounting/bill/${note.billId}`}>
                            {note.bill}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>{formatDate(note.date)}</TableCell>
                      <TableCell className="font-medium">{formatPrice(note.amount)}</TableCell>
                      <TableCell>{note.description || '-'}</TableCell>
                      <TableCell>{getDebitNoteStatusBadge(note.status)}</TableCell>
                      <TableCell>
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No debit notes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <div className="mt-4 pb-4">
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

