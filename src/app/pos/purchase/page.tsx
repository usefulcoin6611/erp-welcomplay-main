'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, X, Eye, Pencil, Trash } from 'lucide-react'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SimplePagination } from '@/components/ui/simple-pagination'

const STATUS_LABELS: Record<number, string> = { 0: 'Draft', 1: 'Sent', 2: 'Received' }
const STATUS_CLASS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-700',
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-green-100 text-green-700',
}

const MOCK_PURCHASES = [
  { id: '1', purchase_id: 'PUR-001', vendor: 'PT Supplier A', category: 'Electronics', purchase_date: '2025-01-15', status: 2 },
  { id: '2', purchase_id: 'PUR-002', vendor: 'CV Distributor B', category: 'Office Supplies', purchase_date: '2025-01-14', status: 1 },
  { id: '3', purchase_id: 'PUR-003', vendor: 'PT Grosir C', category: 'Furniture', purchase_date: '2025-01-13', status: 0 },
  { id: '4', purchase_id: 'PUR-004', vendor: 'Toko D', category: 'Electronics', purchase_date: '2025-01-12', status: 2 },
  { id: '5', purchase_id: 'PUR-005', vendor: 'PT Supplier A', category: 'Raw Material', purchase_date: '2025-01-11', status: 1 },
  { id: '6', purchase_id: 'PUR-006', vendor: 'CV Distributor B', category: 'Office Supplies', purchase_date: '2025-01-10', status: 0 },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function POSPurchasePage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = useMemo(() => {
    if (!search.trim()) return MOCK_PURCHASES
    const q = search.trim().toLowerCase()
    return MOCK_PURCHASES.filter(
      (p) =>
        p.purchase_id.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }, [search])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  return (
    <POSPageLayout
      title="Manage Purchase"
      breadcrumbLabel="Purchase"
      actionButton={
        <Button size="sm" variant="blue" className="shadow-none h-7" title="Create">
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      }
    >
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-base font-medium">Purchase List</h5>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchase..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
            />
            {search.length > 0 && (
              <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => handleSearchChange('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 font-normal">Purchase</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Vendor</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Category</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Purchase Date</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Status</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 py-3">
                        <Button variant="outline" size="sm" className="h-7 shadow-none text-blue-600 border-blue-200 hover:bg-blue-50">
                          {row.purchase_id}
                        </Button>
                      </TableCell>
                      <TableCell className="px-4 py-3">{row.vendor}</TableCell>
                      <TableCell className="px-4 py-3">{row.category}</TableCell>
                      <TableCell className="px-4 py-3">{formatDate(row.purchase_date)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={STATUS_CLASS[row.status]}>{STATUS_LABELS[row.status]}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100" title="Delete">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No purchase found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <div className="px-4 py-3 border-t">
              <SimplePagination
                totalCount={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </POSPageLayout>
  )
}
