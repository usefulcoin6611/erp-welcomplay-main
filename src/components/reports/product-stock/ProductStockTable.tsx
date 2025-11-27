'use client'

import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { ProductStock } from './constants'
import { statusStyles } from './constants'

interface ProductStockTableProps {
  data: ProductStock[]
}

function ProductStockTableComponent({ data }: ProductStockTableProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium">Name</th>
            <th className="px-3 py-2 text-left text-xs font-medium">SKU</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Category</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Unit</th>
            <th className="px-3 py-2 text-right text-xs font-medium">Current Quantity</th>
            <th className="px-3 py-2 text-right text-xs font-medium">Min Stock</th>
            <th className="px-3 py-2 text-right text-xs font-medium">Max Stock</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Status</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Last Updated</th>
            <th className="px-3 py-2 text-center text-xs font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                No products found
              </td>
            </tr>
          ) : (
            data.map((product) => (
              <tr key={product.id} className="border-t hover:bg-muted/50">
                <td className="px-3 py-2 text-sm font-medium">{product.name}</td>
                <td className="px-3 py-2 text-sm text-muted-foreground">{product.sku}</td>
                <td className="px-3 py-2 text-sm">{product.category}</td>
                <td className="px-3 py-2 text-sm">{product.unit}</td>
                <td className="px-3 py-2 text-sm text-right font-medium">{product.quantity}</td>
                <td className="px-3 py-2 text-sm text-right text-muted-foreground">{product.minStock}</td>
                <td className="px-3 py-2 text-sm text-right text-muted-foreground">{product.maxStock}</td>
                <td className="px-3 py-2 text-sm">
                  <Badge className={statusStyles[product.status].className}>
                    {statusStyles[product.status].label}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-sm text-muted-foreground">{formatDate(product.lastUpdated)}</td>
                <td className="px-3 py-2 text-sm text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    title="Update Quantity"
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
  )
}

export const ProductStockTable = memo(ProductStockTableComponent)
