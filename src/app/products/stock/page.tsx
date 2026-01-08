"use client"

import { useState, useMemo } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SimplePagination } from '@/components/ui/simple-pagination'

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
  const totalPages = Math.ceil(totalRecords / pageSize)

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">Product Stock</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage product stock quantities</p>
              </div>
            </div>

            {/* Main Content */}
            <Card>
              <div className="pt-4 pb-0">
                <div className="px-6 mb-3">
                  <CardTitle className="text-base">Product Stock List</CardTitle>
                </div>
              </div>

              <CardContent className="pt-0">
                <div style={{ minHeight: '400px' }}>
                  <div className="p-4 space-y-4">
                    {/* Table */}
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">SKU</th>
                            <th className="px-3 py-2 text-right text-xs font-medium">Current Quantity</th>
                            <th className="px-3 py-2 text-center text-xs font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-3 py-8 text-center text-sm text-muted-foreground">
                                No products found
                              </td>
                            </tr>
                          ) : (
                            paginatedData.map((product) => (
                              <tr key={product.id} className="border-t hover:bg-muted/50">
                                <td className="px-3 py-2 text-sm font-medium">{product.name}</td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">{product.sku}</td>
                                <td className="px-3 py-2 text-sm text-right">
                                  {(() => {
                                    const q = product.quantity
                                    const cls = q === 0 ? 'bg-red-100 text-red-600' : q < 10 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                                    return <span className={`${cls} px-2 py-0.5 rounded text-sm font-medium`}>{q}</span>
                                  })()}
                                </td>
                                <td className="px-3 py-2 text-sm text-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2"
                                    title="Update Quantity"
                                    onClick={() => handleUpdateQuantity(product)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalRecords > 0 && (
                      <div className="mt-4">
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Update Quantity Dialog */}
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Update Quantity</DialogTitle>
                  <DialogDescription>
                    Update the quantity for the selected product
                  </DialogDescription>
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
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Save
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}



