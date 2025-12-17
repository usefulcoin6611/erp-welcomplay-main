'use client'

import { memo } from 'react'
import type { Transaction } from './constants'

interface TransactionTableProps {
  data: Transaction[]
}

function TransactionTableComponent({ data }: TransactionTableProps) {
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
            <th className="px-3 py-2 text-left text-xs font-medium">Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Account</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Type</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Category</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Description</th>
            <th className="px-3 py-2 text-right text-xs font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">
                No transactions found
              </td>
            </tr>
          ) : (
            data.map((transaction) => (
              <tr key={transaction.id} className="border-t hover:bg-muted/50">
                <td className="px-3 py-2 text-sm">{formatDate(transaction.date)}</td>
                <td className="px-3 py-2 text-sm font-medium">{transaction.account}</td>
                <td className="px-3 py-2 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    transaction.type === 'Income' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm">{transaction.category}</td>
                <td className="px-3 py-2 text-sm text-muted-foreground">{transaction.description || '-'}</td>
                <td className={`px-3 py-2 text-sm text-right font-medium ${
                  transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'Income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export const TransactionTable = memo(TransactionTableComponent)
