'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  IconCalendar,
  IconSearch,
  IconPlus,
  IconRefresh,
  IconEye,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'

// Mock debit notes
const debitNotes = [
  {
    id: 'DN-2025-001',
    date: '2025-11-09',
    vendor: 'PT Supply Berkah',
    billRef: 'BILL-2025-005',
    reason: 'Price adjustment for overbilled items',
    amount: 1500000,
    status: 'Applied',
  },
  {
    id: 'DN-2025-002',
    date: '2025-11-10',
    vendor: 'CV Logistik Nusantara',
    billRef: 'BILL-2025-006',
    reason: 'Return of damaged goods',
    amount: 950000,
    status: 'Pending',
  },
]

function getDebitNoteStatusClasses(status: string) {
  switch (status) {
    case 'Applied': return 'bg-green-100 text-green-700 border-none'
    case 'Pending': return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Draft': return 'bg-gray-100 text-gray-700 border-none'
    default: return 'bg-slate-100 text-slate-700 border-none'
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
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return debitNotes.filter((note) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (
          !note.id.toLowerCase().includes(q) &&
          !note.vendor.toLowerCase().includes(q) &&
          !note.billRef.toLowerCase().includes(q) &&
          !note.reason.toLowerCase().includes(q)
        ) return false
      }
      if (date) {
        const filterDate = new Date(date).toISOString().split('T')[0]
        if (note.date !== filterDate) return false
      }
      if (status !== 'all' && note.status.toLowerCase() !== status.toLowerCase()) return false
      return true
    })
  }, [search, date, status])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleReset = () => {
    setSearch('')
    setDate('')
    setStatus('all')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Button variant="blue" size="sm" className="shadow-none h-7">
          <IconPlus className="h-3 w-3 mr-2" />
          Create Debit Note
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter debit notes by status and vendor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-sm font-medium">Search</label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search debit notes..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-44">
              <label className="mb-1 block text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="w-full md:w-40">
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="blue" size="sm" className="shadow-none h-7">
                <IconSearch className="h-3 w-3 mr-2" />
                Apply
              </Button>
              <Button type="button" variant="destructive" size="sm" className="shadow-none h-7" onClick={handleReset}>
                <IconRefresh className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Debit Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Debit Note List</CardTitle>
          <CardDescription>
            Overview of all debit notes and adjustments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Debit Note</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Bill Ref</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="shadow-none"
                        >
                          <Link href={`/accounting/debit-note/${note.id}`}>
                            {note.id}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="h-3 w-3" />
                          <span>{formatDate(note.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{note.vendor}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-50 text-blue-700 border-none">
                          {note.billRef}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm" title={note.reason}>
                          {note.reason}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(note.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getDebitNoteStatusClasses(note.status)}>
                          {note.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="shadow-none h-7 bg-yellow-500 hover:bg-yellow-600 text-white"
                            title="View"
                            asChild
                          >
                            <Link href={`/accounting/debit-note/${note.id}`}>
                              <IconEye className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                            title="Edit"
                            asChild
                          >
                            <Link href={`/accounting/debit-note/${note.id}/edit`}>
                              <IconPencil className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="shadow-none h-7"
                            title="Delete"
                          >
                            <IconTrash className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No debit notes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <SimplePagination
              totalCount={totalRecords}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
