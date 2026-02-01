'use client'

import { useState } from 'react'
import Link from 'next/link'
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

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Walk-in Customer' },
  { id: '2', name: 'PT Pelanggan A' },
  { id: '3', name: 'CV Mitra B' },
]

const MOCK_WAREHOUSES = [
  { id: '1', name: 'Gudang Utama' },
  { id: '2', name: 'Gudang Cabang A' },
]

/**
 * Halaman Add POS: form untuk memulai transaksi baru (customer, warehouse),
 * lalu tombol Buka POS mengarah ke halaman kasir (/pos/sales).
 */
export default function POSAddPOSPage() {
  const [customerId, setCustomerId] = useState('1')
  const [warehouseId, setWarehouseId] = useState('1')

  return (
    <POSPageLayout
      title="Add POS"
      breadcrumbLabel="Add POS"
      actionButton={
        <Button asChild size="sm" variant="blue" className="shadow-none">
          <Link href="/pos/sales">Buka POS</Link>
        </Button>
      }
    >
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardContent className="p-0">
          <form className="p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="add-pos-customer" className="text-foreground">
                  Customer
                </Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger id="add-pos-customer" className="h-9">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-pos-warehouse" className="text-foreground">
                  Warehouse
                </Label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                  <SelectTrigger id="add-pos-warehouse" className="h-9">
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
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href="/pos/warehouse">Cancel</Link>
              </Button>
              <Button type="submit" size="sm" variant="blue" className="shadow-none" asChild>
                <Link href="/pos/sales">Buka POS</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </POSPageLayout>
  )
}
