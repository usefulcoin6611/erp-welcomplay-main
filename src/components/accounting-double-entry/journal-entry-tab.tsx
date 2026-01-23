'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
} from 'lucide-react'

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

  useEffect(() => {
    setCurrentPage(1)
  }, [search, date])

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Button asChild variant="blue" size="sm" className="shadow-none h-7" title="Create">
          <Link href="/accounting/journal-entry/create">
            <Plus className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
            className="flex flex-col gap-4 md:flex-row md:items-end"
          >
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search journal number or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="w-full md:w-44">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" variant="outline" size="sm" className="shadow-none h-9 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Search">
                <Search className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shadow-none h-9 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
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
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">Journal ID</TableHead>
                  <TableHead className="px-4 py-3">Date</TableHead>
                  <TableHead className="px-4 py-3">Amount</TableHead>
                  <TableHead className="px-4 py-3">Description</TableHead>
                  <TableHead className="px-4 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="px-4 py-3">
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
                      <TableCell className="px-4 py-3">{entry.date}</TableCell>
                      <TableCell className="px-4 py-3 font-medium">
                        {formatPrice(entry.amount)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm">{entry.description || '-'}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            asChild
                          >
                            <Link href={`/accounting/journal-entry/${entry.id}/edit`}>
                              <Pencil className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => {
                              if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
                                console.log('Delete journal entry:', entry.id)
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
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

