'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Bill } from '../constants'
import { statusStyles } from '../constants'

interface BillsTableProps {
  data: Bill[]
}

function BillsTableComponent({ data }: BillsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

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
            <th className="px-3 py-2 text-left text-xs font-medium">Bill</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Vendor</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Category</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Status</th>
            <th className="px-3 py-2 text-right text-xs font-medium">Paid Amount</th>
            <th className="px-3 py-2 text-right text-xs font-medium">Due Amount</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Payment Date</th>
            <th className="px-3 py-2 text-right text-xs font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-sm text-muted-foreground">
                No bills found
              </td>
            </tr>
          ) : (
            data.map((bill) => (
              <tr key={bill.id} className="border-t hover:bg-muted/50">
                <td className="px-3 py-2 text-sm">
                  <Link href={`/accounting/bill/${bill.id}`}>
                    <Button variant="outline" size="sm" className="font-medium h-7 px-2">
                      {bill.billNumber}
                    </Button>
                  </Link>
                </td>
                <td className="px-3 py-2 text-sm">{formatDate(bill.date)}</td>
                <td className="px-3 py-2 text-sm font-medium">{bill.vendor}</td>
                <td className="px-3 py-2 text-sm text-muted-foreground">{bill.category}</td>
                <td className="px-3 py-2 text-sm">
                  <Badge className={statusStyles[bill.status].className}>
                    {statusStyles[bill.status].label}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-sm text-right">
                  {formatCurrency(bill.paidAmount)}
                </td>
                <td className="px-3 py-2 text-sm text-right">
                  {formatCurrency(bill.dueAmount)}
                </td>
                <td className="px-3 py-2 text-sm">{formatDate(bill.paymentDate)}</td>
                <td className="px-3 py-2 text-sm text-right font-medium">
                  {formatCurrency(bill.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export const BillsTable = memo(BillsTableComponent)
