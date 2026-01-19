'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'

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
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter data
  const filteredData = useMemo(() => {
    return journalEntries.filter((entry) => {
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
  }, [search, date])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Button asChild variant="blue" size="sm" className="shadow-none h-7">
          <Link href="/accounting/journal-entry/create">
            <IconPlus className="h-3 w-3 mr-2" />
            Create Journal
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search journal entries by date or description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-sm font-medium">Search</label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search journal number or description..."
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
          </form>
        </CardContent>
      </Card>

      {/* Journal Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Journal List</CardTitle>
          <CardDescription>
            Summary of general journal entries, total debit and credit must be balanced.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Journal ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
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
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="h-3 w-3" />
                          <span>{entry.date}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(entry.amount)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{entry.description || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                            title="Edit"
                            asChild
                          >
                            <Link href={`/accounting/journal-entry/${entry.id}/edit`}>
                              <IconPencil className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="shadow-none h-7"
                            title="Delete"
                            onClick={() => {
                              if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
                                console.log('Delete journal entry:', entry.id)
                              }
                            }}
                          >
                            <IconTrash className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No journal entries found
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
