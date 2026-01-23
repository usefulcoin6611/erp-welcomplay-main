'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
  const [pendingSearch, setPendingSearch] = useState('')
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
    if (!search.trim()) return debitNotes
    const q = search.trim().toLowerCase()
    return debitNotes.filter((n) => {
      return (
        formatDebitNoteId(n.debitId).toLowerCase().includes(q) ||
        n.bill.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
      )
    })
  }, [search])

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

  const handleSearchApply = () => {
    setSearch(pendingSearch)
  }

  const handleSearchReset = () => {
    setPendingSearch('')
    setSearch('')
  }

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setFormData({
        bill: '',
        item: '',
        amount: '',
        date: '',
        description: '',
      })
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // mock create only (no persistence)
    console.log('Create Debit Note:', formData)
    setCreateDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Dialog open={createDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7" title="Create">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Debit Note</DialogTitle>
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
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearchApply()
            }}
            className="flex flex-col gap-4 md:flex-row md:items-end"
          >
            <div className="flex-1 min-w-0">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                placeholder="Search debit notes..."
                className="h-9"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="shadow-none h-9 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                title="Search"
              >
                <Search className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shadow-none h-9 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                title="Reset"
                onClick={handleSearchReset}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Debit Notes Table */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">Debit Note</TableHead>
                  <TableHead className="px-4 py-3">Bill</TableHead>
                  <TableHead className="px-4 py-3">Date</TableHead>
                  <TableHead className="px-4 py-3">Amount</TableHead>
                  <TableHead className="px-4 py-3">Description</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                  <TableHead className="px-4 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="px-4 py-3">
                        <Button variant="outline" size="sm" className="shadow-none">
                          {formatDebitNoteId(note.debitId)}
                        </Button>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Button asChild variant="outline" size="sm" className="shadow-none">
                          <Link href={`/accounting/bill/${note.billId}`}>
                            {note.bill}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="px-4 py-3">{formatDate(note.date)}</TableCell>
                      <TableCell className="px-4 py-3 font-medium">{formatPrice(note.amount)}</TableCell>
                      <TableCell className="px-4 py-3">{note.description || '-'}</TableCell>
                      <TableCell className="px-4 py-3">{getDebitNoteStatusBadge(note.status)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            asChild
                          >
                            <Link href={`/accounting/debit-note/${note.id}/edit`}>
                              <Pencil className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
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
            <div className="mt-4 px-4 pb-4">
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
    </div>
  )
}

