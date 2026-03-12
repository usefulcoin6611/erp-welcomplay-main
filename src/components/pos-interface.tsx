'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Home, Minus, Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

type Customer = { id: string; name: string }
type Warehouse = { id: string; name: string }
type Category = { id: string; name: string }
type Product = {
  id: string
  name: string
  sku: string
  salePrice: number
  quantity: number
  categoryId: string | null
  taxRate: number
  taxName: string
  unitName: string
}

type CartItem = {
  id: string
  productId: string
  name: string
  sku: string
  qty: number
  tax: string
  taxRate: number
  price: number
  discount: number
  subtotal: number
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

const WALK_IN_CUSTOMER: Customer = { id: 'walk-in', name: 'Walk-in Customer' }

export function POSInterface() {
  const [searchProduct, setSearchProduct] = useState('')
  const [searchBarcode, setSearchBarcode] = useState('')
  const [customerCode, setCustomerCode] = useState('walk-in')
  const [warehouseId, setWarehouseId] = useState('')
  const [discount, setDiscount] = useState(0)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('0')
  const [openPayModal, setOpenPayModal] = useState(false)
  const [openEmptyCartAlert, setOpenEmptyCartAlert] = useState(false)

  // Data from API
  const [customers, setCustomers] = useState<Customer[]>([WALK_IN_CUSTOMER])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Loading states
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingWarehouses, setLoadingWarehouses] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [submittingOrder, setSubmittingOrder] = useState(false)

  const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0)
  const total = subtotal - discount

  const customerName = customers.find((c) => c.id === customerCode)?.name ?? 'Walk-in Customer'
  const warehouseName = warehouses.find((w) => w.id === warehouseId)?.name ?? ''

  // Load customers
  useEffect(() => {
    setLoadingCustomers(true)
    fetch('/api/customers')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCustomers([WALK_IN_CUSTOMER, ...res.data.map((c: any) => ({ id: c.id, name: c.name }))])
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCustomers(false))
  }, [])

  // Load warehouses
  useEffect(() => {
    setLoadingWarehouses(true)
    fetch('/api/pos/warehouses')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setWarehouses(res.data)
          if (res.data.length > 0 && !warehouseId) {
            setWarehouseId(res.data[0].id)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingWarehouses(false))
  }, [])

  // Load categories
  useEffect(() => {
    setLoadingCategories(true)
    fetch('/api/pos/product-categories')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [])

  // Load products (debounced search)
  const loadProducts = useCallback(() => {
    setLoadingProducts(true)
    const params = new URLSearchParams()
    if (searchBarcode.trim()) {
      params.set('sku', searchBarcode.trim())
      params.set('type', 'sku')
    } else if (searchProduct.trim()) {
      params.set('search', searchProduct.trim())
    }
    if (selectedCategoryId && selectedCategoryId !== '0') {
      params.set('cat_id', selectedCategoryId)
    }
    if (warehouseId) {
      params.set('war_id', warehouseId)
    }

    fetch(`/api/pos/search-products?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false))
  }, [searchProduct, searchBarcode, selectedCategoryId, warehouseId])

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300)
    return () => clearTimeout(timer)
  }, [loadProducts])

  const handleWarehouseChange = (value: string) => {
    setWarehouseId(value)
    setCart([]) // Empty cart when warehouse changes (reference-erp behavior)
  }

  const addToCart = (product: Product, qty = 1) => {
    const existing = cart.find((c) => c.productId === product.id)
    if (existing) {
      setCart(
        cart.map((c) =>
          c.productId === product.id
            ? {
                ...c,
                qty: c.qty + qty,
                subtotal: (c.qty + qty) * product.salePrice * (1 + c.taxRate / 100),
              }
            : c
        )
      )
    } else {
      const itemSubtotal = qty * product.salePrice * (1 + product.taxRate / 100)
      setCart([
        ...cart,
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          qty,
          tax: product.taxName || '-',
          taxRate: product.taxRate,
          price: product.salePrice,
          discount: 0,
          subtotal: Math.round(itemSubtotal * 100) / 100,
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
          return {
            ...c,
            qty: newQty,
            subtotal: Math.round(newQty * c.price * (1 + c.taxRate / 100) * 100) / 100,
          }
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

  const handleConfirmPayment = async () => {
    if (cart.length === 0) return
    setSubmittingOrder(true)
    try {
      const body = {
        customerId: customerCode === 'walk-in' ? null : customerCode,
        warehouseId: warehouseId || null,
        discount,
        items: cart.map((item) => ({
          productId: item.productId,
          itemName: item.name,
          sku: item.sku,
          quantity: item.qty,
          price: item.price,
          discount: item.discount,
          taxRate: item.taxRate,
        })),
      }

      const res = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`Payment completed! Order: ${data.data.posId}`)
        setCart([])
        setDiscount(0)
        setOpenPayModal(false)
      } else {
        toast.error(data.message ?? 'Failed to process payment')
      }
    } catch (error) {
      toast.error('Failed to process payment')
    } finally {
      setSubmittingOrder(false)
    }
  }

  return (
    <div className="flex flex-col h-screen w-full min-h-0">
      {/* Top bar: POS focus mode – blue theme */}
      <header className="shrink-0 flex items-center justify-between h-12 px-4 bg-blue-600 text-white shadow-sm">
        <span className="text-lg font-semibold tracking-tight">POS</span>
        <Link
          href="/dashboard"
          className="flex items-center justify-center h-9 w-9 rounded-md text-white/90 hover:bg-white/20 hover:text-white transition-colors"
          title="Exit to Dashboard"
        >
          <Home className="h-5 w-5" />
        </Link>
      </header>

      {/* Main: two columns, full height */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left: Search + Categories + Products */}
        <div className="lg:col-span-7 flex flex-col min-h-0 rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="shrink-0 p-4 space-y-3 border-b bg-blue-50/80 dark:bg-blue-950/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search product"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="pl-9 h-10 bg-background"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Barcode"
                  value={searchBarcode}
                  onChange={(e) => setSearchBarcode(e.target.value)}
                  className="pl-9 h-10 bg-background"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                key="all"
                size="sm"
                variant="outline"
                className={`h-8 shadow-none rounded-md ${
                  selectedCategoryId === '0'
                    ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white'
                    : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-300'
                }`}
                onClick={() => setSelectedCategoryId('0')}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant="outline"
                className={`h-8 shadow-none rounded-md ${
                  selectedCategoryId === cat.id
                    ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white'
                    : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-300'
                }`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 min-h-0">
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No products found.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    className="flex flex-col items-center rounded-lg border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/50 active:scale-[0.98]"
                  >
                    <div className="mb-2 h-14 w-14 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium line-clamp-2 text-center w-full">{product.name}</span>
                    <span className="text-sm text-muted-foreground mt-1">{formatPrice(product.salePrice)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Customer, Warehouse, Cart + Totals */}
        <div className="lg:col-span-5 flex flex-col min-h-0 rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="shrink-0 p-4 border-b bg-blue-50/80 dark:bg-blue-950/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Customer</Label>
                <Select value={customerCode} onValueChange={setCustomerCode} disabled={loadingCustomers}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Warehouse</Label>
                <Select value={warehouseId} onValueChange={handleWarehouseChange} disabled={loadingWarehouses}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder={loadingWarehouses ? 'Loading...' : 'Warehouse'} />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-blue-50/60 dark:bg-blue-950/20">
                  <TableHead className="w-10 p-2"></TableHead>
                  <TableHead className="p-2 text-left text-xs font-medium">Name</TableHead>
                  <TableHead className="p-2 text-center w-20 text-xs font-medium">Qty</TableHead>
                  <TableHead className="p-2 w-14 text-xs font-medium">Tax</TableHead>
                  <TableHead className="p-2 text-right text-xs font-medium">Price</TableHead>
                  <TableHead className="p-2 text-right text-xs font-medium">Subtotal</TableHead>
                  <TableHead className="w-10 p-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground text-sm">
                      Cart is empty.
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow key={item.id} className="border-b">
                      <TableCell className="p-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="p-2 text-sm">{item.name}</TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center justify-center gap-0.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 shadow-none rounded"
                            onClick={() => updateQty(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="min-w-[1.75rem] text-center text-sm font-medium">{item.qty}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 shadow-none rounded"
                            onClick={() => updateQty(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 text-xs text-muted-foreground">{item.tax}</TableCell>
                      <TableCell className="p-2 text-right text-sm">{formatPrice(item.price)}</TableCell>
                      <TableCell className="p-2 text-right text-sm font-medium">{formatPrice(item.subtotal)}</TableCell>
                      <TableCell className="p-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 shadow-none rounded"
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

          <div className="shrink-0 p-4 space-y-3 border-t bg-blue-50/80 dark:bg-blue-950/30">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-sm text-muted-foreground shrink-0">Discount</Label>
              <Input
                type="number"
                min={0}
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="h-10 w-24 text-right bg-background"
                placeholder="0"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <AlertDialog open={openEmptyCartAlert} onOpenChange={setOpenEmptyCartAlert}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-10 rounded-md border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => cart.length > 0 && setOpenEmptyCartAlert(true)}
                  disabled={cart.length === 0}
                >
                  Empty cart
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Empty cart?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all items. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={emptyCart}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Empty cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                size="sm"
                className="flex-1 h-10 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-none font-semibold"
                disabled={cart.length === 0}
                title="Pay"
                onClick={() => setOpenPayModal(true)}
              >
                Pay
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal POS Invoice */}
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
              <span className="font-medium">{warehouseName || '-'}</span>
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
            <Button
              variant="outline"
              className="shadow-none"
              onClick={() => setOpenPayModal(false)}
              disabled={submittingOrder}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-none"
              onClick={handleConfirmPayment}
              disabled={submittingOrder}
            >
              {submittingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
