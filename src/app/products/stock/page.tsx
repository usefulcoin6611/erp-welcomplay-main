"use client"

import { useState, useMemo, useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Types
interface ProductStock {
  id: string
  name: string
  sku: string
  quantity: number
}

export default function ProductStockPage() {
  const [products, setProducts] = useState<ProductStock[]>([])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  // Dialog state for update quantity
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(null)
  const [quantity, setQuantity] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/products?type=product')
      const json = await res.json()
      if (json?.success && Array.isArray(json.data)) {
        setProducts(
          json.data.map((p: any) => ({
            id: p.id as string,
            name: p.name as string,
            sku: p.sku as string,
            quantity: Number(p.quantity) || 0,
          })),
        )
      } else {
        setProducts([])
      }
    } catch (e) {
      setError('Gagal memuat data produk')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return products
    const q = search.trim().toLowerCase()
    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
    )
  }, [search, products])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [currentPage, pageSize, filteredData])

  // Handlers
  const handleUpdateQuantity = (product: ProductStock) => {
    setSelectedProduct(product)
    setQuantity(String(product.quantity))
    setDialogOpen(true)
  }

  const handleSaveQuantity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    const parsedQuantity = Number(quantity)
    if (Number.isNaN(parsedQuantity)) {
      return
    }

    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: parsedQuantity }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || json?.success === false) {
        setError(json?.message || 'Gagal menyimpan data')
        return
      }

      const updatedQuantity = Number(json.data?.quantity ?? parsedQuantity)
      setProducts(prev =>
        prev.map(p =>
          p.id === selectedProduct.id ? { ...p, quantity: updatedQuantity } : p,
        ),
      )

      setDialogOpen(false)
      setSelectedProduct(null)
      setQuantity('')
    } catch (err) {
      setError('Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedProduct(null)
      setQuantity('')
    }
  }

  // Pagination calculations
  const totalRecords = filteredData.length

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {/* Title Tab */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg font-semibold">Product Stock</CardTitle>
                  <CardDescription>View and update product quantity in stock.</CardDescription>
                </div>
              </CardHeader>
            </Card>

            {/* Main Content */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <CardTitle>All Products</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Search name or SKU..."
                    className="h-9 pl-9 pr-3 border-0 bg-gray-50 shadow-none focus-visible:border-0 focus-visible:ring-0 hover:bg-gray-100"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Name</TableHead>
                        <TableHead className="px-6">Sku</TableHead>
                        <TableHead className="px-6 text-right">Current Quantity</TableHead>
                        <TableHead className="px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="px-6 text-center py-8 text-muted-foreground">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="px-6 text-center py-8 text-muted-foreground">
                            No products found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((product) => (
                          <TableRow key={product.id} className="font-style">
                            <TableCell className="px-6 font-medium">{product.name}</TableCell>
                            <TableCell className="px-6 text-muted-foreground">{product.sku}</TableCell>
                            <TableCell className="px-6 text-right">
                              {(() => {
                                const q = product.quantity
                                const cls =
                                  q === 0
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : q < 10
                                      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                      : 'bg-green-100 text-green-700 border-green-200'
                                return (
                                  <span className={`${cls} px-2 py-0.5 rounded text-sm font-medium border`}>
                                    {q}
                                  </span>
                                )
                              })()}
                            </TableCell>
                            <TableCell className="px-6">
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                                title="Update Quantity"
                                onClick={() => handleUpdateQuantity(product)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalRecords > 0 && (
                  <div className="px-6 pb-6 pt-4">
                    <SimplePagination
                      currentPage={currentPage}
                      totalCount={totalRecords}
                      onPageChange={setCurrentPage}
                      pageSize={pageSize}
                      onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Update Quantity Dialog */}
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Update Quantity</DialogTitle>
                </DialogHeader>
                {selectedProduct && (
                  <form onSubmit={handleSaveQuantity} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Product</Label>
                        <div className="text-sm text-muted-foreground py-2">{selectedProduct.name}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>SKU</Label>
                        <div className="text-sm text-muted-foreground py-2">{selectedProduct.sku}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter Quantity"
                        required
                      />
                    </div>
                    {error && (
                      <div className="text-sm text-red-600">
                        {error}
                      </div>
                    )}
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDialogOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="blue"
                        className="shadow-none"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}




