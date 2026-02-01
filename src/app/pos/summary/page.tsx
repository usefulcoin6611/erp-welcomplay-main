'use client'

import { useState, useMemo } from 'react'
import { Search, X, Eye } from 'lucide-react'
import Link from 'next/link'
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

const MOCK_POS_LIST = [
  { id: '1', pos_id: 'POS-001', pos_date: '2025-01-15', customer: 'Walk-in Customer', warehouse: 'Gudang Utama', amount: 17500000 },
  { id: '2', pos_id: 'POS-002', pos_date: '2025-01-14', customer: 'PT Pelanggan A', warehouse: 'Gudang Cabang A', amount: 3200000 },
  { id: '3', pos_id: 'POS-003', pos_date: '2025-01-13', customer: 'CV Mitra B', warehouse: 'Gudang Utama', amount: 850000 },
  { id: '4', pos_id: 'POS-004', pos_date: '2025-01-12', customer: 'Walk-in Customer', warehouse: 'Gudang Utama', amount: 45000 },
  { id: '5', pos_id: 'POS-005', pos_date: '2025-01-11', customer: 'PT Pelanggan A', warehouse: 'Gudang Cabang A', amount: 2620000 },
  { id: '6', pos_id: 'POS-006', pos_date: '2025-01-10', customer: 'CV Mitra B', warehouse: 'Gudang Utama', amount: 520000 },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

/**
 * POS Summary (reference-erp pos.report): list transaksi POS.
 * Berbeda dengan Dashboard > POS > Reports yang berisi laporan analitis (Warehouse, Purchase, POS Daily/Monthly, Pos VS Purchase).
 */
export default function POSSummaryPage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = useMemo(() => {
    if (!search.trim()) return MOCK_POS_LIST
    const q = search.trim().toLowerCase()
    return MOCK_POS_LIST.filter(
      (r) =>
        r.pos_id.toLowerCase().includes(q) ||
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
      title="POS Summary"
      breadcrumbLabel="POS"
      actionButton={
        <Button size="sm" variant="blue" className="shadow-none h-7" asChild>
          <Link href="/pos/sales">Add POS</Link>
        </Button>
      }
    >
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-base font-medium">POS List</h5>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search POS..."
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
                  <TableHead className="px-4 py-3 font-normal">POS ID</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Date</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Customer</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Warehouse</TableHead>
                  <TableHead className="px-4 py-3 font-normal text-right">Amount</TableHead>
                  <TableHead className="px-4 py-3 font-normal w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                      No Data Found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 py-3 text-sm font-medium">{row.pos_id}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">{formatDate(row.pos_date)}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">{row.customer}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">{row.warehouse}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-right font-medium">{formatPrice(row.amount)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Button variant="outline" size="sm" className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100" asChild>
                          <Link href={`/pos/summary/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <SimplePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setCurrentPage(1)
              }}
            />
          )}
        </CardContent>
      </Card>
    </POSPageLayout>
  )
}
