'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

type Customer = { id: string; name: string }
type Warehouse = { id: string; name: string }

const WALK_IN_CUSTOMER: Customer = { id: 'walk-in', name: 'Walk-in Customer' }

/**
 * Halaman Add POS: form untuk memulai transaksi baru (customer, warehouse),
 * lalu tombol Buka POS mengarah ke halaman kasir (/pos/sales).
 * Data customer dan warehouse diambil dari API.
 */
export default function POSAddPOSPage() {
  const router = useRouter()
  const [customerCode, setCustomerCode] = useState('walk-in')
  const [warehouseId, setWarehouseId] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([WALK_IN_CUSTOMER])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingWarehouses, setLoadingWarehouses] = useState(true)

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

  useEffect(() => {
    setLoadingWarehouses(true)
    fetch('/api/pos/warehouses')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setWarehouses(res.data)
          if (res.data.length > 0) {
            setWarehouseId(res.data[0].id)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingWarehouses(false))
  }, [])

  const handleOpenPOS = () => {
    // Pass selected customer and warehouse as query params to POS sales page
    const params = new URLSearchParams()
    if (customerCode && customerCode !== 'walk-in') params.set('customerId', customerCode)
    if (warehouseId) params.set('warehouseId', warehouseId)
    const query = params.toString()
    router.push(`/pos/sales${query ? `?${query}` : ''}`)
  }

  return (
    <POSPageLayout
      title="Add POS"
      breadcrumbLabel="Add POS"
      actionButton={
        <Button
          size="sm"
          variant="blue"
          className="shadow-none"
          onClick={handleOpenPOS}
          disabled={loadingWarehouses}
        >
          {loadingWarehouses ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buka POS'}
        </Button>
      }
    >
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardContent className="p-0">
          <form className="p-6" onSubmit={(e) => { e.preventDefault(); handleOpenPOS() }}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="add-pos-customer" className="text-foreground">
                  Customer
                </Label>
                <Select
                  value={customerCode}
                  onValueChange={setCustomerCode}
                  disabled={loadingCustomers}
                >
                  <SelectTrigger id="add-pos-customer" className="h-9">
                    <SelectValue placeholder={loadingCustomers ? 'Loading...' : 'Select Customer'} />
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
              <div className="space-y-2">
                <Label htmlFor="add-pos-warehouse" className="text-foreground">
                  Warehouse
                </Label>
                <Select
                  value={warehouseId}
                  onValueChange={setWarehouseId}
                  disabled={loadingWarehouses}
                >
                  <SelectTrigger id="add-pos-warehouse" className="h-9">
                    <SelectValue placeholder={loadingWarehouses ? 'Loading...' : 'Select Warehouse'} />
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
            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href="/pos/warehouse">Cancel</Link>
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="blue"
                className="shadow-none"
                disabled={loadingWarehouses}
              >
                {loadingWarehouses ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buka POS'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </POSPageLayout>
  )
}
