'use client'

import { memo } from 'react'
import type { ExpenseData } from './constants'

interface ExpenseSummaryTableProps {
  paymentData: ExpenseData[]
  billData: ExpenseData[]
  totalData: number[]
  monthLabels: string[]
}

function ExpenseSummaryTableComponent({
  paymentData,
  billData,
  totalData,
  monthLabels,
}: ExpenseSummaryTableProps) {
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
          {/* Payment Section */}
          <tr className="border-t bg-muted/30">
            <td
              colSpan={monthLabels.length + 1}
              className="px-3 py-2 text-sm font-semibold sticky left-0 bg-muted/30"
            >
              Payment :
            </td>
          </tr>
          {paymentData.map((payment, index) => (
            <tr key={`payment-${index}`} className="border-t hover:bg-muted/50">
              <td className="px-3 py-2 text-sm font-medium sticky left-0 bg-background">
                {payment.category}
              </td>
              {payment.data.map((value, idx) => (
                <td key={idx} className="px-3 py-2 text-sm text-right whitespace-nowrap">
                  {formatCurrency(value)}
                </td>
              ))}
            </tr>
          ))}

          {/* Bill Section */}
          <tr className="border-t bg-muted/30">
            <td
              colSpan={monthLabels.length + 1}
              className="px-3 py-2 text-sm font-semibold sticky left-0 bg-muted/30"
            >
              Bill :
            </td>
          </tr>
          {billData.map((bill, index) => (
            <tr key={`bill-${index}`} className="border-t hover:bg-muted/50">
              <td className="px-3 py-2 text-sm font-medium sticky left-0 bg-background">
                {bill.category}
              </td>
              {bill.data.map((value, idx) => (
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
              Expense = Payment + Bill :
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

export const ExpenseSummaryTable = memo(ExpenseSummaryTableComponent)
