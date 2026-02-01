'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import {
  Plus,
  Search,
  RefreshCw,
  X,
  Pencil,
  Trash2,
} from 'lucide-react'

type JournalLine = {
  id: string
  accountId: string
  debit: number
  credit: number
  description: string
}

const mockChartAccounts = [
  { id: '1000', name: 'Cash & Bank' },
  { id: '1100', name: 'Accounts Receivable' },
  { id: '2000', name: 'Accounts Payable' },
  { id: '4000', name: 'Sales Revenue' },
  { id: '6000', name: 'Operating Expenses' },
] as const

const journalEntries = [
  {
    id: 'JR-2025-001',
    date: '2025-11-01',
    description: 'Opening balances for all accounts',
    amount: 500_000_000,
  },
  {
    id: 'JR-2025-002',
    date: '2025-11-03',
    description: 'Reclassification of expense',
    amount: 7_500_000,
  },
  {
    id: 'JR-2025-003',
    date: '2025-11-05',
    description: 'Monthly accrual adjustments',
    amount: 15_000_000,
  },
]

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function JournalEntryTab() {
  type JournalEntryRow = (typeof journalEntries)[number] & {
    reference: string
    lines: JournalLine[]
  }

  const [rows, setRows] = useState<JournalEntryRow[]>(() =>
    journalEntries.map((j) => ({
      ...j,
      reference: '',
      lines: [
        { id: 'row-1', accountId: '6000', debit: j.amount, credit: 0, description: '' },
        { id: 'row-2', accountId: '1000', debit: 0, credit: j.amount, description: '' },
      ],
    })),
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<JournalEntryRow | null>(null)

  const [header, setHeader] = useState({
    date: '',
    reference: '',
    description: '',
  })

  const [lines, setLines] = useState<JournalLine[]>([
    { id: 'row-1', accountId: '', debit: 0, credit: 0, description: '' },
  ])

  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter data
  const filteredData = useMemo(() => {
    return rows.filter((entry) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (
          !entry.id.toLowerCase().includes(q) &&
          !entry.description.toLowerCase().includes(q)
        ) return false
      }
      if (date && entry.date !== date) return false
      return true
    })
  }, [search, date, rows])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  useEffect(() => {
    setCurrentPage(1)
  }, [search, date])

  const totals = useMemo(() => {
    const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
    const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
    return { totalDebit, totalCredit, balanced: totalDebit === totalCredit }
  }, [lines])

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: `row-${prev.length + 1}`, accountId: '', debit: 0, credit: 0, description: '' },
    ])
  }

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.id !== id)))
  }

  const updateLine = (id: string, patch: Partial<JournalLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setHeader({ date: '', reference: '', description: '' })
      setLines([{ id: 'row-1', accountId: '', debit: 0, credit: 0, description: '' }])
    }
  }

  const handleCreateClick = () => {
    setEditingId(null)
    handleDialogOpenChange(true)
  }

  const handleEdit = (entry: JournalEntryRow) => {
    setEditingId(entry.id)
    setHeader({ date: entry.date, reference: entry.reference, description: entry.description })
    setLines(entry.lines.length ? entry.lines : [{ id: 'row-1', accountId: '', debit: 0, credit: 0, description: '' }])
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!totals.balanced) return

    const amount = totals.totalDebit

    if (editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                date: header.date,
                reference: header.reference,
                description: header.description,
                amount,
                lines,
              }
            : r,
        ),
      )
      handleDialogOpenChange(false)
      return
    }

    const nextId = `JR-${new Date().getFullYear()}-${String(rows.length + 1).padStart(3, '0')}`
    const newRow: JournalEntryRow = {
      id: nextId,
      date: header.date,
      description: header.description,
      reference: header.reference,
      amount,
      lines,
    }
    setRows((prev) => [newRow, ...prev])
    handleDialogOpenChange(false)
  }

  const handleDeleteClick = (entry: (typeof journalEntries)[number]) => {
    setEntryToDelete(entry)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!entryToDelete) return
    setRows((prev) => prev.filter((r) => r.id !== entryToDelete.id))
    setEntryToDelete(null)
    setDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Journal Entry</CardTitle>
            <CardDescription>Create and manage journal entries.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="blue" size="sm" className="shadow-none h-7 px-4" title="Create" onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Create Journal Entry
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
        <CardContent className="px-6 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_auto] md:justify-start"
          >
            <div className="space-y-2">
              <Label htmlFor="je-filter-date" className="text-sm font-medium">
                Date
              </Label>
              <DatePicker
                id="je-filter-date"
                value={date}
                onValueChange={setDate}
                placeholder="Set a date"
                className="!h-9 px-3"
                iconPlacement="right"
              />
            </div>
            <div className="flex items-center gap-2 md:pt-6">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                title="Search"
              >
                <Search className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                title="Reset"
                onClick={() => {
                  setSearch('')
                  setDate('')
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Journal Entries Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Journal Entries</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search journal number or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
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
                  <TableHead className="px-6">Journal ID</TableHead>
                  <TableHead className="px-6">Date</TableHead>
                  <TableHead className="px-6">Amount</TableHead>
                  <TableHead className="px-6">Description</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="px-6">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="shadow-none"
                        >
                          <Link href={`/accounting/journal-entry/${entry.id}`}>
                            {entry.id}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="px-6">{entry.date}</TableCell>
                      <TableCell className="px-6 font-medium">
                        {formatPrice(entry.amount)}
                      </TableCell>
                      <TableCell className="px-6">
                        <span className="text-sm">{entry.description || '-'}</span>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => handleEdit(entry)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(entry)}
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
                      No journal entries found
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto" style={{ width: '95vw', maxWidth: '95vw' }}>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Journal Entry' : 'Create Journal Entry'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update journal entry and account lines.' : 'Create a new journal entry and account lines.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 space-y-2">
                    <Label>Journal Number</Label>
                    <Input value={editingId ?? `JR-${new Date().getFullYear()}-${String(rows.length + 1).padStart(3, '0')}`} readOnly className="h-9 bg-gray-50" />
                  </div>
                  <div className="md:col-span-4 space-y-2">
                    <Label htmlFor="je-date2">
                      Transaction Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="je-date2"
                      type="date"
                      value={header.date}
                      onChange={(e) => setHeader({ ...header, date: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                  <div className="md:col-span-4 space-y-2">
                    <Label htmlFor="je-ref">Reference</Label>
                    <Input
                      id="je-ref"
                      value={header.reference}
                      onChange={(e) => setHeader({ ...header, reference: e.target.value })}
                      placeholder="Enter Reference"
                      className="h-9"
                    />
                  </div>
                  <div className="md:col-span-12 space-y-2">
                    <Label htmlFor="je-desc2">Description</Label>
                    <Textarea
                      id="je-desc2"
                      value={header.description}
                      onChange={(e) => setHeader({ ...header, description: e.target.value })}
                      placeholder="Enter Description"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Accounts</div>
              <Button type="button" variant="blue" size="sm" className="shadow-none h-7 px-4" onClick={addLine}>
                <Plus className="mr-2 h-4 w-4" />
                Add Accounts
              </Button>
            </div>

            <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <Table className="w-full min-w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4 py-3 min-w-[220px]">Account *</TableHead>
                        <TableHead className="px-4 py-3 min-w-[140px]">Debit *</TableHead>
                        <TableHead className="px-4 py-3 min-w-[140px]">Credit *</TableHead>
                        <TableHead className="px-4 py-3 min-w-[220px]">Description</TableHead>
                        <TableHead className="px-4 py-3 min-w-[140px] text-right">Amount</TableHead>
                        <TableHead className="px-4 py-3 w-[60px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line) => {
                        const amount = (Number(line.debit) || 0) || (Number(line.credit) || 0)
                        return (
                          <TableRow key={line.id}>
                            <TableCell className="px-4 py-3">
                              <Select
                                value={line.accountId}
                                onValueChange={(value) => updateLine(line.id, { accountId: value })}
                                required
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select Chart of Account" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockChartAccounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                      {a.id} - {a.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Input
                                className="h-9"
                                type="number"
                                min={0}
                                step="0.01"
                                value={line.debit}
                                onChange={(e) => updateLine(line.id, { debit: Number(e.target.value || 0), credit: 0 })}
                                required
                              />
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Input
                                className="h-9"
                                type="number"
                                min={0}
                                step="0.01"
                                value={line.credit}
                                onChange={(e) => updateLine(line.id, { credit: Number(e.target.value || 0), debit: 0 })}
                                required
                              />
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Input
                                className="h-9"
                                value={line.description}
                                onChange={(e) => updateLine(line.id, { description: e.target.value })}
                                placeholder="Description"
                              />
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right font-medium">
                              {formatPrice(amount)}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                title="Delete"
                                onClick={() => removeLine(line.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center justify-end gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Total Debit</span>
                      <span className="font-medium">{formatPrice(totals.totalDebit)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Total Credit</span>
                      <span className="font-medium">{formatPrice(totals.totalCredit)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Status</span>
                      <span className={totals.balanced ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {totals.balanced ? 'Balanced' : 'Not Balanced'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" className="shadow-none h-7" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="blue" size="sm" className="shadow-none h-7 px-4" disabled={!totals.balanced}>
                {editingId ? 'Update Journal Entry' : 'Create Journal Entry'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescriptionText>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogDescriptionText>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEntryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

