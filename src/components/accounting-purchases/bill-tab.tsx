'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Search,
  RefreshCw,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

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
    case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'Sent': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'Partial': return 'bg-red-100 text-red-700 border-red-200'
    case 'Unpaid': return 'bg-cyan-100 text-cyan-700 border-cyan-200'
    case 'Paid': return 'bg-blue-100 text-blue-700 border-blue-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
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
  const [rows, setRows] = useState<typeof bills>(bills)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [billToDelete, setBillToDelete] = useState<(typeof bills)[number] | null>(null)
  const [billDate, setBillDate] = useState('')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return rows.filter((bill) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const hay = [
          bill.id,
          bill.vendor,
          bill.category,
          bill.billDate,
          bill.dueDate,
          bill.status,
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (billDate && bill.billDate !== billDate) return false
      if (status !== 'all' && bill.status.toLowerCase() !== status.toLowerCase()) return false
      return true
    })
  }, [billDate, status, rows, search])

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

  const handleDeleteClick = (bill: (typeof bills)[number]) => {
    setBillToDelete(bill)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!billToDelete) return
    setRows((prev) => prev.filter((b) => b.id !== billToDelete.id))
    setBillToDelete(null)
    setDeleteDialogOpen(false)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [billDate, status, search])

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Bill</CardTitle>
            <CardDescription>Manage supplier bills and due dates.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
            title="Export"
            asChild
          >
            <Link href="/accounting/bill/export">
              <Download className="mr-2 h-4 w-4" />
              Export Bill
            </Link>
          </Button>
          <Button variant="blue" size="sm" className="shadow-none h-7 px-4" title="Create" asChild>
            <Link href="/accounting/bill/create/0">
              <Plus className="mr-2 h-4 w-4" />
              Create Bill
            </Link>
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
              setCurrentPage(1)
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_auto] md:justify-start"
          >
            <div className="space-y-2">
              <Label htmlFor="bill-filter-date" className="text-sm font-medium">
                Bill Date
              </Label>
              <DatePicker
                id="bill-filter-date"
                value={billDate}
                onValueChange={(v) => setBillDate(v)}
                placeholder="Set a date"
                className="!h-9 px-3"
                iconPlacement="right"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  className={`w-full !h-9 ${
                    status === 'all' ? 'text-muted-foreground' : ''
                  } border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`}
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
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
                onClick={handleReset}
                title="Reset"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Bill List</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search bills..."
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
                  <TableHead className="px-6">Bill</TableHead>
                  <TableHead className="px-6">Category</TableHead>
                  <TableHead className="px-6">Bill Date</TableHead>
                  <TableHead className="px-6">Due Date</TableHead>
                  <TableHead className="px-6">Status</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="px-6">
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
                      <TableCell className="px-6">{bill.category}</TableCell>
                      <TableCell className="px-6">{bill.billDate}</TableCell>
                      <TableCell className="px-6">{bill.dueDate}</TableCell>
                      <TableCell className="px-6">
                        <Badge className={getBillStatusClasses(bill.status)}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                            title="View"
                            asChild
                          >
                            <Link href={`/accounting/bill/${bill.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            asChild
                          >
                            <Link href={`/accounting/bill/create/${bill.id}`}>
                              <Pencil className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(bill)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 text-center py-8 text-muted-foreground">
                      No bills found
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
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBillToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

