'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Scan, Settings, Search, X, Loader2 } from 'lucide-react'
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
import { BarcodeDisplay } from '@/components/barcode-display'

type Product = {
  id: string
  name: string
  sku: string
}

export default function POSPrintBarcodePage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/pos/search-products?limit=200')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data.map((p: any) => ({ id: p.id, name: p.name, sku: p.sku })))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredData = useMemo(() => {
    if (!search.trim()) return products
    const q = search.trim().toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    )
  }, [search, products])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <POSPageLayout
      title="POS Product Barcode"
      breadcrumbLabel="Print Barcode"
      actionButton={
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className="shadow-none h-7" title="Print Barcode" onClick={handlePrint}>
            <Scan className="mr-2 h-4 w-4" />
            Print Barcode
          </Button>
          <Button size="sm" variant="blue" className="shadow-none h-7" title="Barcode Setting" asChild>
            <Link href="/pos/print-settings">
              <Settings className="mr-2 h-4 w-4" />
              Barcode Setting
            </Link>
          </Button>
        </div>
      }
    >
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-base font-medium">Product Barcode List</h5>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search product or SKU..."
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
                  <TableHead className="px-4 py-3 font-normal">Product</TableHead>
                  <TableHead className="px-4 py-3 font-normal">SKU</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Barcode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="px-4 py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 py-3 font-medium">{row.name}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-sm">{row.sku}</TableCell>
                      <TableCell className="px-4 py-3 align-middle">
                        <BarcodeDisplay value={row.sku} height={36} displayValue={true} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No product found</TableCell>
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
