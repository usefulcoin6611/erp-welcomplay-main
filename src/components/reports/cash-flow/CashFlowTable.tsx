'use client'

import { memo } from 'react'
import type { CashFlowCategory } from './constants'
import { monthList } from './constants'

interface CashFlowTableProps {
  title: string
  subtitle: string
  categories: CashFlowCategory[]
  totalRow?: {
    label: string
    data: number[]
  }
  className?: string
}

function CashFlowTableComponent({ title, subtitle, categories, totalRow, className = '' }: CashFlowTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h5 className="text-sm font-semibold">{title}</h5>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium w-[200px]">Category</th>
              {monthList.map((month) => (
                <th key={month} className="px-3 py-2 text-right text-xs font-medium min-w-[100px]">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subtitle && (
              <tr>
                <td colSpan={13} className="px-3 py-2 text-sm font-semibold bg-muted/30">
                  {subtitle}
                </td>
              </tr>
            )}
            {categories.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No data available
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-t hover:bg-muted/50">
                  <td className="px-3 py-2 text-sm">{category.category}</td>
                  {category.data.map((value, index) => (
                    <td key={index} className="px-3 py-2 text-sm text-right">
                      {formatCurrency(value)}
                    </td>
                  ))}
                </tr>
              ))
            )}
            {totalRow && (
              <>
                <tr>
                  <td colSpan={13} className="px-3 py-2 text-sm font-semibold bg-muted/30">
                    {totalRow.label}
                  </td>
                </tr>
                <tr className="bg-blue-50 dark:bg-blue-950">
                  <td className="px-3 py-2 text-sm font-semibold">Total</td>
                  {totalRow.data.map((value, index) => (
                    <td key={index} className="px-3 py-2 text-sm text-right font-semibold">
                      {formatCurrency(value)}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const CashFlowTable = memo(CashFlowTableComponent)
