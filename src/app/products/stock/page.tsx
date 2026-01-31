"use client"

import { useState, useMemo } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
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

// Mock data - only products (not services)
const mockProductStocks: ProductStock[] = [
  { id: '1', name: 'Lisensi ERP Cloud', sku: 'ERP-CLD-001', quantity: 120 },
  { id: '4', name: 'Laptop Dell XPS 13', sku: 'LAP-DELL-004', quantity: 45 },
  { id: '6', name: 'Monitor Samsung 24"', sku: 'MON-SAM-006', quantity: 32 },
  { id: '8', name: 'Desk Lamp LED', sku: 'FUR-LAMP-008', quantity: 25 },
  { id: '10', name: 'Whiteboard Marker', sku: 'OFF-MAR-010', quantity: 18 },
  { id: '2', name: 'Office Chair Ergonomic', sku: 'FUR-CHAIR-002', quantity: 8 },
  { id: '5', name: 'USB Flash Drive 32GB', sku: 'ACC-USB-005', quantity: 7 },
  { id: '9', name: 'Paper A4 80gsm', sku: 'OFF-PAP-009', quantity: 5 },
  { id: '3', name: 'Printer HP LaserJet', sku: 'PRT-HP-003', quantity: 0 },
  { id: '7', name: 'Keyboard Mechanical', sku: 'ACC-KEY-007', quantity: 0 },
]

export default function ProductStockPage() {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Dialog state for update quantity
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(null)
  const [quantity, setQuantity] = useState<string>('')

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return mockProductStocks.slice(startIndex, endIndex)
  }, [currentPage, pageSize])

  // Handlers
  const handleUpdateQuantity = (product: ProductStock) => {
    setSelectedProduct(product)
    setQuantity(String(product.quantity))
    setDialogOpen(true)
  }

  const handleSaveQuantity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    
    // Handle save logic here
    console.log('Update quantity:', selectedProduct.id, quantity)
    
    // Close dialog and reset
    setDialogOpen(false)
    setSelectedProduct(null)
    setQuantity('')
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedProduct(null)
      setQuantity('')
    }
  }

  // Pagination calculations
  const totalRecords = mockProductStocks.length

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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">
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
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pl-8 pr-6">
                <CardTitle>All Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Sku</TableHead>
                        <TableHead className="text-right">Current Quantity</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No products found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((product) => (
                          <TableRow key={product.id} className="font-style">
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                            <TableCell className="text-right">
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
                            <TableCell>
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
                  <div className="mt-4 pb-4">
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
                      >
                        Save
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





