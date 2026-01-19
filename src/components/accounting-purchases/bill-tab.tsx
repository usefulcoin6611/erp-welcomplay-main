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
  IconDownload,
  IconRefresh,
  IconEye,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'

// Mock bills
const bills = [
  {
    id: 'BILL-2025-001',
    vendor: 'PT Supply Berkah',
    billDate: '2025-11-01',
    dueDate: '2025-11-30',
    category: 'Office Supplies',
    total: 16095000,
    status: 'Draft',
  },
  {
    id: 'BILL-2025-002',
    vendor: 'CV Logistik Nusantara',
    billDate: '2025-11-03',
    dueDate: '2025-12-03',
    category: 'Logistics',
    total: 9800000,
    status: 'Sent',
  },
  {
    id: 'BILL-2025-003',
    vendor: 'PT Teknologi Digital',
    billDate: '2025-11-05',
    dueDate: '2025-11-20',
    category: 'Services',
    total: 12300000,
    status: 'Partial',
  },
]

function getBillStatusClasses(status: string) {
  switch (status) {
    case 'Draft': return 'bg-gray-100 text-gray-700 border-none'
    case 'Sent': return 'bg-blue-100 text-blue-700 border-none'
    case 'Partial': return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Paid': return 'bg-green-100 text-green-700 border-none'
    default: return 'bg-slate-100 text-slate-700 border-none'
  }
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function BillTab() {
  const [billDate, setBillDate] = useState('')
  const [status, setStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return bills.filter((bill) => {
      if (billDate && bill.billDate !== billDate) return false
      if (status !== 'all' && bill.status.toLowerCase() !== status.toLowerCase()) return false
      return true
    })
  }, [billDate, status])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleReset = () => {
    setBillDate('')
    setStatus('all')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" className="shadow-none h-7">
          <IconDownload className="h-3 w-3" />
        </Button>
        <Button asChild variant="blue" size="sm" className="shadow-none h-7">
          <Link href="/accounting/bill/create">
            <IconPlus className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter bills by bill date and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-sm font-medium">Bill Date</label>
              <Input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
            </div>
            <div className="w-full md:w-40">
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
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

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bill List</CardTitle>
          <CardDescription>
            Overview of all purchase bills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Bill Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="shadow-none"
                        >
                          <Link href={`/accounting/bill/${bill.id}`}>
                            {bill.id}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>{bill.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="h-3 w-3" />
                          <span>{bill.billDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="h-3 w-3" />
                          <span>{bill.dueDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getBillStatusClasses(bill.status)}>
                          {bill.status}
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
                            <Link href={`/accounting/bill/${bill.id}`}>
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
                            <Link href={`/accounting/bill/${bill.id}/edit`}>
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No bills found
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
