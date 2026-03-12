'use client'

import { memo } from 'react'

type TransactionRow = {
  id: string
  date: string
  type: string
  reference: string
  description: string
  account: string
  category: string
  debit: number
  credit: number
  amount: number
}

interface TransactionTableProps {
  data: TransactionRow[]
}

function TransactionTableComponent({ data }: TransactionTableProps) {
  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return '-'
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

  /**
   * ERP Badge color logic:
   * - Journal Entry: blue (double-entry accounting)
   * - Bank Transfer: purple (fund movement)
   * - Income: green (revenue)
   * - Expense: red (cost)
   * - Transfer: purple (internal)
   * - Other: gray
   */
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Journal Entry':
        return 'bg-blue-100 text-blue-700 border border-blue-200'
      case 'Bank Transfer':
        return 'bg-purple-100 text-purple-700 border border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Income':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      case 'Expense':
        return 'bg-rose-100 text-rose-700 border border-rose-200'
      case 'Transfer':
        return 'bg-violet-100 text-violet-700 border border-violet-200'
      default:
        return 'bg-amber-100 text-amber-700 border border-amber-200'
    }
  }

  return (
    <div className="rounded-md border overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium whitespace-nowrap">Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium whitespace-nowrap">Reference</th>
            <th className="px-3 py-2 text-left text-xs font-medium whitespace-nowrap">Type</th>
            <th className="px-3 py-2 text-left text-xs font-medium whitespace-nowrap">Category</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Account</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Description</th>
            <th className="px-3 py-2 text-right text-xs font-medium whitespace-nowrap">Debit</th>
            <th className="px-3 py-2 text-right text-xs font-medium whitespace-nowrap">Credit</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                No transactions found
              </td>
            </tr>
          ) : (
            data.map((transaction) => (
              <tr key={transaction.id} className="border-t hover:bg-muted/50">
                <td className="px-3 py-2 text-sm whitespace-nowrap">{formatDate(transaction.date)}</td>
                <td className="px-3 py-2 text-sm font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {transaction.reference || '-'}
                </td>
                <td className="px-3 py-2 text-sm whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadge(transaction.type)}`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryBadge(transaction.category)}`}>
                    {transaction.category}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm max-w-[180px] truncate" title={transaction.account}>
                  {transaction.account}
                </td>
                <td className="px-3 py-2 text-sm text-muted-foreground max-w-[200px] truncate" title={transaction.description}>
                  {transaction.description || '-'}
                </td>
                <td className="px-3 py-2 text-sm text-right font-medium text-green-600 whitespace-nowrap">
                  {formatCurrency(transaction.debit)}
                </td>
                <td className="px-3 py-2 text-sm text-right font-medium text-red-600 whitespace-nowrap">
                  {formatCurrency(transaction.credit)}
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
