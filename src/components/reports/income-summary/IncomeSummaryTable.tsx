'use client'

import { memo } from 'react'
import type { IncomeData } from './constants'

interface IncomeSummaryTableProps {
  revenueData: IncomeData[]
  invoiceData: IncomeData[]
  totalData: number[]
  monthLabels: string[]
}

function IncomeSummaryTableComponent({
  revenueData,
  invoiceData,
  totalData,
  monthLabels,
}: IncomeSummaryTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium sticky left-0 bg-muted/50 z-10">
              Category
            </th>
            {monthLabels.map((month) => (
              <th key={month} className="px-3 py-2 text-right text-xs font-medium whitespace-nowrap">
                {month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Revenue Section */}
          <tr className="border-t bg-muted/30">
            <td
              colSpan={monthLabels.length + 1}
              className="px-3 py-2 text-sm font-semibold sticky left-0 bg-muted/30"
            >
              Revenue :
            </td>
          </tr>
          {revenueData.map((revenue, index) => (
            <tr key={`revenue-${index}`} className="border-t hover:bg-muted/50">
              <td className="px-3 py-2 text-sm font-medium sticky left-0 bg-background">
                {revenue.category}
              </td>
              {revenue.data.map((value, idx) => (
                <td key={idx} className="px-3 py-2 text-sm text-right whitespace-nowrap">
                  {formatCurrency(value)}
                </td>
              ))}
            </tr>
          ))}

          {/* Invoice Section */}
          <tr className="border-t bg-muted/30">
            <td
              colSpan={monthLabels.length + 1}
              className="px-3 py-2 text-sm font-semibold sticky left-0 bg-muted/30"
            >
              Invoice :
            </td>
          </tr>
          {invoiceData.map((invoice, index) => (
            <tr key={`invoice-${index}`} className="border-t hover:bg-muted/50">
              <td className="px-3 py-2 text-sm font-medium sticky left-0 bg-background">
                {invoice.category}
              </td>
              {invoice.data.map((value, idx) => (
                <td key={idx} className="px-3 py-2 text-sm text-right whitespace-nowrap">
                  {formatCurrency(value)}
                </td>
              ))}
            </tr>
          ))}

          {/* Total Section */}
          <tr className="border-t bg-muted/30">
            <td
              colSpan={monthLabels.length + 1}
              className="px-3 py-2 text-sm font-semibold sticky left-0 bg-muted/30"
            >
              Income = Revenue + Invoice :
            </td>
          </tr>
          <tr className="border-t bg-muted/50 font-semibold">
            <td className="px-3 py-2 text-sm font-bold sticky left-0 bg-muted/50">
              Total
            </td>
            {totalData.map((value, idx) => (
              <td key={idx} className="px-3 py-2 text-sm text-right font-bold whitespace-nowrap">
                {formatCurrency(value)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export const IncomeSummaryTable = memo(IncomeSummaryTableComponent)
