'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, X, Trash } from 'lucide-react'
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

const MOCK_TRANSFERS = [
  { id: '1', from_warehouse: 'Gudang Utama', to_warehouse: 'Gudang Cabang A', product: 'Laptop Dell XPS', quantity: 5, date: '2025-01-15' },
  { id: '2', from_warehouse: 'Gudang Cabang A', to_warehouse: 'Gudang Retail', product: 'Mouse Wireless', quantity: 20, date: '2025-01-14' },
  { id: '3', from_warehouse: 'Warehouse Distribution', to_warehouse: 'Gudang Utama', product: 'Monitor 24"', quantity: 10, date: '2025-01-13' },
  { id: '4', from_warehouse: 'Gudang Utama', to_warehouse: 'Storage Cold', product: 'Cooler Box', quantity: 3, date: '2025-01-12' },
  { id: '5', from_warehouse: 'Gudang Cabang B', to_warehouse: 'Gudang Cabang A', product: 'Keyboard Mechanical', quantity: 15, date: '2025-01-11' },
  { id: '6', from_warehouse: 'Gudang Retail', to_warehouse: 'Gudang Utama', product: 'USB Cable', quantity: 50, date: '2025-01-10' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function POSTransferPage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = useMemo(() => {
    if (!search.trim()) return MOCK_TRANSFERS
    const q = search.trim().toLowerCase()
    return MOCK_TRANSFERS.filter(
      (t) =>
        t.from_warehouse.toLowerCase().includes(q) ||
        t.to_warehouse.toLowerCase().includes(q) ||
        t.product.toLowerCase().includes(q)
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
      title="Warehouse Transfer"
      breadcrumbLabel="Transfer"
      actionButton={
        <Button size="sm" variant="blue" className="shadow-none h-7" title="Create">
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      }
    >
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-base font-medium">Transfer List</h5>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transfer..."
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
                  <TableHead className="px-4 py-3 font-normal">From Warehouse</TableHead>
                  <TableHead className="px-4 py-3 font-normal">To Warehouse</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Product</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Quantity</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Date</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 py-3">{row.from_warehouse}</TableCell>
                      <TableCell className="px-4 py-3">{row.to_warehouse}</TableCell>
                      <TableCell className="px-4 py-3">{row.product}</TableCell>
                      <TableCell className="px-4 py-3">{row.quantity}</TableCell>
                      <TableCell className="px-4 py-3">{formatDate(row.date)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Button variant="outline" size="sm" className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100" title="Delete">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No transfer found</TableCell>
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
