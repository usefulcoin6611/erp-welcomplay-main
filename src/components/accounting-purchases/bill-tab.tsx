'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return rows.filter((bill) => {
      if (billDate && bill.billDate !== billDate) return false
      if (status !== 'all' && bill.status.toLowerCase() !== status.toLowerCase()) return false
      return true
    })
  }, [billDate, status, rows])

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
  }, [billDate, status])

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Bill</h2>
          <p className="text-sm text-muted-foreground">
            Manage supplier bills and due dates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-end sm:ml-auto sm:self-auto">
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
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="w-full md:w-56">
              <label className="mb-1 block text-sm font-medium">Bill Date</label>
              <Input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} className="h-9" />
            </div>
            <div className="w-full md:w-56">
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-full">
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
            <div className="flex items-end gap-2">
              <Button type="submit" variant="outline" size="sm" className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Apply">
                <Search className="h-3 w-3" />
              </Button>
              <Button type="button" variant="outline" size="sm" className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100" onClick={handleReset} title="Reset">
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">Bill</TableHead>
                  <TableHead className="px-4 py-3">Category</TableHead>
                  <TableHead className="px-4 py-3">Bill Date</TableHead>
                  <TableHead className="px-4 py-3">Due Date</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                  <TableHead className="px-4 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="px-4 py-3">
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
                      <TableCell className="px-4 py-3">{bill.category}</TableCell>
                      <TableCell className="px-4 py-3">{bill.billDate}</TableCell>
                      <TableCell className="px-4 py-3">{bill.dueDate}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={getBillStatusClasses(bill.status)}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No bills found
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

