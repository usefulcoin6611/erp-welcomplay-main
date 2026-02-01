'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Home, Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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

// Mock data sesuai reference-erp (pos/index, product categories, search)
const MOCK_CUSTOMERS = [
  { id: '1', name: 'Walk-in Customer' },
  { id: '2', name: 'PT Pelanggan A' },
  { id: '3', name: 'CV Mitra B' },
]
const MOCK_WAREHOUSES = [
  { id: '1', name: 'Gudang Utama' },
  { id: '2', name: 'Gudang Cabang A' },
]
const MOCK_CATEGORIES = [
  { id: '0', name: 'All' },
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Accessories' },
]
const MOCK_PRODUCTS = [
  { id: '1', name: 'Laptop Dell XPS', sku: 'SKU-001', price: 15000000, categoryId: '1' },
  { id: '2', name: 'Mouse Wireless', sku: 'SKU-002', price: 250000, categoryId: '2' },
  { id: '3', name: 'Monitor LG 24"', sku: 'SKU-003', price: 2100000, categoryId: '1' },
  { id: '4', name: 'Keyboard Mechanical', sku: 'SKU-004', price: 850000, categoryId: '2' },
  { id: '5', name: 'USB Cable Type-C', sku: 'SKU-005', price: 45000, categoryId: '2' },
  { id: '6', name: 'Webcam HD', sku: 'SKU-006', price: 520000, categoryId: '1' },
]

type CartItem = {
  id: string
  productId: string
  name: string
  qty: number
  tax: string
  price: number
  subtotal: number
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export function POSInterface() {
  const [searchProduct, setSearchProduct] = useState('')
  const [searchBarcode, setSearchBarcode] = useState('')
  const [customerId, setCustomerId] = useState('1')
  const [warehouseId, setWarehouseId] = useState('1')
  const [discount, setDiscount] = useState(0)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('0')
  const [openPayModal, setOpenPayModal] = useState(false)
  const [openEmptyCartAlert, setOpenEmptyCartAlert] = useState(false)

  const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0)
  const total = subtotal - discount

  const customerName = MOCK_CUSTOMERS.find((c) => c.id === customerId)?.name ?? ''
  const warehouseName = MOCK_WAREHOUSES.find((w) => w.id === warehouseId)?.name ?? ''

  const handleWarehouseChange = (value: string) => {
    setWarehouseId(value)
    setCart([])
  }

  const addToCart = (product: (typeof MOCK_PRODUCTS)[0], qty = 1) => {
    const existing = cart.find((c) => c.productId === product.id)
    if (existing) {
      setCart(
        cart.map((c) =>
          c.productId === product.id
            ? { ...c, qty: c.qty + qty, subtotal: (c.qty + qty) * product.price }
            : c
        )
      )
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          qty,
          tax: '-',
          price: product.price,
          subtotal: qty * product.price,
        },
      ])
    }
  }

  const updateQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== itemId) return c
          const newQty = Math.max(1, c.qty + delta)
          return { ...c, qty: newQty, subtotal: newQty * c.price }
        })
        .filter((c) => c.qty > 0)
    )
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== itemId))
  }

  const emptyCart = () => {
    setCart([])
    setOpenEmptyCartAlert(false)
  }

  const handleConfirmPayment = () => {
    toast.success('Payment completed successfully!')
    setCart([])
    setOpenPayModal(false)
  }

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    if (selectedCategoryId !== '0' && p.categoryId !== selectedCategoryId) return false
    const searchByBarcode = searchBarcode.trim()
    const searchByName = searchProduct.trim()
    if (searchByBarcode)
      return p.sku.toLowerCase().includes(searchByBarcode.toLowerCase())
    if (searchByName)
      return (
        p.name.toLowerCase().includes(searchByName.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchByName.toLowerCase())
      )
    return true
  })

  return (
    <div className="space-y-5 px-4 py-4">
      {/* Top bar: POS + Home link (pewarnaan mengikuti support: blue primary) */}
      <div className="flex items-center justify-between rounded-lg bg-blue-500 px-5 py-2.5 text-white">
        <span className="font-semibold">POS</span>
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-white hover:opacity-90"
          title="Dashboard"
        >
          <Home className="h-5 w-5" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: col-lg-7 - Search + Categories + Products (reference-erp) */}
        <div className="lg:col-span-7">
            <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
              <CardHeader className="p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search Product"
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by Barcode Scanner"
                      value={searchBarcode}
                      onChange={(e) => setSearchBarcode(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="mb-4 flex flex-wrap gap-2 border-b pb-4">
                  {MOCK_CATEGORIES.map((cat) => (
                    <Button
                      key={cat.id}
                      size="sm"
                      variant="outline"
                      className={`h-8 shadow-none ${
                        selectedCategoryId === cat.id
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100'
                          : ''
                      }`}
                      onClick={() => setSelectedCategoryId(cat.id)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addToCart(product)}
                      className="flex flex-col items-center rounded-lg border border-gray-200/80 bg-white p-4 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="mb-2 h-12 w-12 rounded-full bg-gray-200" />
                      <span className="text-xs font-medium line-clamp-2">{product.name}</span>
                      <span className="text-xs text-muted-foreground">{formatPrice(product.price)}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Right: col-lg-5 - Customer, Warehouse, Cart (reference-erp) */}
        <div className="lg:col-span-5">
          <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white h-full flex flex-col">
            <CardHeader className="p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CUSTOMERS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={warehouseId} onValueChange={handleWarehouseChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_WAREHOUSES.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="w-12 p-3"></TableHead>
                      <TableHead className="p-3 text-left">Name</TableHead>
                      <TableHead className="p-3 text-center w-24">QTY</TableHead>
                      <TableHead className="p-3 w-16">Tax</TableHead>
                      <TableHead className="p-3 text-right">Price</TableHead>
                      <TableHead className="p-3 text-right">Sub Total</TableHead>
                      <TableHead className="w-10 p-3"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                          No Data Found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="p-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200" />
                          </TableCell>
                          <TableCell className="p-3 text-sm">{item.name}</TableCell>
                          <TableCell className="p-3">
                            <div className="flex items-center justify-center gap-0.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 shadow-none"
                                onClick={() => updateQty(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="min-w-[2rem] text-center text-sm">{item.qty}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 shadow-none"
                                onClick={() => updateQty(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="p-3 text-sm">{item.tax}</TableCell>
                          <TableCell className="p-3 text-right text-sm">{formatPrice(item.price)}</TableCell>
                          <TableCell className="p-3 text-right text-sm font-medium">{formatPrice(item.subtotal)}</TableCell>
                          <TableCell className="p-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100 shadow-none"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Discount</span>
                    <Input
                      type="number"
                      min={0}
                      value={discount || ''}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      className="h-9 w-24"
                      placeholder="0"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="blue"
                    className="shadow-none h-8"
                    disabled={cart.length === 0}
                    title="Pay"
                    onClick={() => setOpenPayModal(true)}
                  >
                    PAY
                  </Button>
                </div>
                <div className="flex justify-end gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sub Total : </span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-4 text-sm">
                  <span className="text-muted-foreground">Total : </span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-end">
                  <AlertDialog open={openEmptyCartAlert} onOpenChange={setOpenEmptyCartAlert}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 bg-red-50 text-red-700 hover:bg-red-100 border-red-100 shadow-none"
                      onClick={() => cart.length > 0 && setOpenEmptyCartAlert(true)}
                      disabled={cart.length === 0}
                    >
                      Empty Cart
                    </Button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are You Sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Do you want to continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={emptyCart}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal POS Invoice (reference-erp pos.create) */}
      <Dialog open={openPayModal} onOpenChange={setOpenPayModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>POS Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{customerName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Warehouse</span>
              <span className="font-medium">{warehouseName}</span>
            </div>
            <div className="border-t pt-3">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="p-2 text-left">Name</TableHead>
                    <TableHead className="p-2 text-center w-16">QTY</TableHead>
                    <TableHead className="p-2 text-right">Sub Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="p-2 text-sm">{item.name}</TableCell>
                      <TableCell className="p-2 text-center text-sm">{item.qty}</TableCell>
                      <TableCell className="p-2 text-right text-sm font-medium">
                        {formatPrice(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-4 border-t pt-3">
              <span className="text-muted-foreground">Sub Total :</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-end gap-4">
              <span className="text-muted-foreground">Discount :</span>
              <span className="font-medium">{formatPrice(discount)}</span>
            </div>
            <div className="flex justify-end gap-4 border-t pt-2">
              <span className="text-muted-foreground">Total :</span>
              <span className="font-semibold">{formatPrice(total)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="shadow-none" onClick={() => setOpenPayModal(false)}>
              Cancel
            </Button>
            <Button variant="blue" className="shadow-none" onClick={handleConfirmPayment}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
