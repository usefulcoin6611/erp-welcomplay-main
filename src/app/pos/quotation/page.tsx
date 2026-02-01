'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, X, Eye, Pencil, Trash } from 'lucide-react'
import { POSPageLayout } from '@/components/pos-page-layout'
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

const MOCK_QUOTATIONS = [
  { id: '1', quotation_id: 'QUO-001', quotation_date: '2025-01-15', customer: 'PT Pelanggan A', warehouse: 'Gudang Utama' },
  { id: '2', quotation_id: 'QUO-002', quotation_date: '2025-01-14', customer: 'CV Mitra B', warehouse: 'Gudang Cabang A' },
  { id: '3', quotation_id: 'QUO-003', quotation_date: '2025-01-13', customer: 'Toko C', warehouse: 'Gudang Utama' },
  { id: '4', quotation_id: 'QUO-004', quotation_date: '2025-01-12', customer: 'PT Pelanggan A', warehouse: 'Warehouse Distribution' },
  { id: '5', quotation_id: 'QUO-005', quotation_date: '2025-01-11', customer: 'CV Mitra B', warehouse: 'Gudang Cabang B' },
  { id: '6', quotation_id: 'QUO-006', quotation_date: '2025-01-10', customer: 'Toko C', warehouse: 'Gudang Retail' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function POSQuotationPage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = useMemo(() => {
    if (!search.trim()) return MOCK_QUOTATIONS
    const q = search.trim().toLowerCase()
    return MOCK_QUOTATIONS.filter(
      (r) =>
        r.quotation_id.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.warehouse.toLowerCase().includes(q)
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
      title="Manage Quotation"
      breadcrumbLabel="Quotation"
      actionButton={
        <Button size="sm" variant="blue" className="shadow-none h-7" title="Create">
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      }
    >
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-base font-medium">Quotation List</h5>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quotation..."
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
                  <TableHead className="px-4 py-3 font-normal">Quotation ID</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Date</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Customer</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Warehouse</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 py-3">
                        <Button variant="outline" size="sm" className="h-7 shadow-none text-blue-600 border-blue-200 hover:bg-blue-50">
                          {row.quotation_id}
                        </Button>
                      </TableCell>
                      <TableCell className="px-4 py-3">{formatDate(row.quotation_date)}</TableCell>
                      <TableCell className="px-4 py-3">{row.customer}</TableCell>
                      <TableCell className="px-4 py-3">{row.warehouse}</TableCell>
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
                    <TableCell colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No quotation found</TableCell>
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
