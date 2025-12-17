'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface IncomeVsExpenseTableProps {
  monthList: string[]
  revenueTotal: number[]
  invoiceTotal: number[]
  paymentTotal: number[]
  billTotal: number[]
  incomeTotal: number[]
  expenseTotal: number[]
  profitTotal: number[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function IncomeVsExpenseTableComponent({
  monthList,
  revenueTotal,
  invoiceTotal,
  paymentTotal,
  billTotal,
  incomeTotal,
  expenseTotal,
  profitTotal,
}: IncomeVsExpenseTableProps) {
  // Calculate grand totals
  const grandRevenueTotal = revenueTotal.reduce((sum, val) => sum + val, 0)
  const grandInvoiceTotal = invoiceTotal.reduce((sum, val) => sum + val, 0)
  const grandIncomeTotal = incomeTotal.reduce((sum, val) => sum + val, 0)
  const grandPaymentTotal = paymentTotal.reduce((sum, val) => sum + val, 0)
  const grandBillTotal = billTotal.reduce((sum, val) => sum + val, 0)
  const grandExpenseTotal = expenseTotal.reduce((sum, val) => sum + val, 0)
  const grandProfitTotal = profitTotal.reduce((sum, val) => sum + val, 0)

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Income vs Expense Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">
                  Category
                </TableHead>
                {monthList.map((month) => (
                  <TableHead key={month} className="text-right">
                    {month}
                  </TableHead>
                ))}
                <TableHead className="text-right font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Income Section */}
              <TableRow className="bg-green-50/50">
                <TableCell
                  colSpan={monthList.length + 2}
                  className="sticky left-0 z-10 bg-green-50/50 font-bold text-green-700"
                >
                  Income
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-0 z-10 bg-background">Revenue</TableCell>
                {revenueTotal.map((value, index) => (
                  <TableCell key={index} className="text-right">
                    {formatCurrency(value)}
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold">
                  {formatCurrency(grandRevenueTotal)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-0 z-10 bg-background">Invoice</TableCell>
                {invoiceTotal.map((value, index) => (
                  <TableCell key={index} className="text-right">
                    {formatCurrency(value)}
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold">
                  {formatCurrency(grandInvoiceTotal)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-green-100/50 font-semibold">
                <TableCell className="sticky left-0 z-10 bg-green-100/50">
                  Total Income
                </TableCell>
                {incomeTotal.map((value, index) => (
                  <TableCell key={index} className="text-right">
                    {formatCurrency(value)}
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold">
                  {formatCurrency(grandIncomeTotal)}
                </TableCell>
              </TableRow>

              {/* Expense Section */}
              <TableRow className="bg-red-50/50">
                <TableCell
                  colSpan={monthList.length + 2}
                  className="sticky left-0 z-10 bg-red-50/50 font-bold text-red-700"
                >
                  Expense
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-0 z-10 bg-background">Payment</TableCell>
                {paymentTotal.map((value, index) => (
                  <TableCell key={index} className="text-right">
                    {formatCurrency(value)}
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold">
                  {formatCurrency(grandPaymentTotal)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-0 z-10 bg-background">Bill</TableCell>
                {billTotal.map((value, index) => (
                  <TableCell key={index} className="text-right">
                    {formatCurrency(value)}
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold">
                  {formatCurrency(grandBillTotal)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-red-100/50 font-semibold">
                <TableCell className="sticky left-0 z-10 bg-red-100/50">
                  Total Expense
                </TableCell>
                {expenseTotal.map((value, index) => (
                  <TableCell key={index} className="text-right">
                    {formatCurrency(value)}
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold">
                  {formatCurrency(grandExpenseTotal)}
                </TableCell>
              </TableRow>

              {/* Profit Row */}
              <TableRow className="bg-orange-100/50 font-bold">
                <TableCell className="sticky left-0 z-10 bg-orange-100/50">Profit</TableCell>
                {profitTotal.map((value, index) => (
                  <TableCell
                    key={index}
                    className={`text-right ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(value)}
                  </TableCell>
                ))}
                <TableCell
                  className={`text-right font-bold ${grandProfitTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(grandProfitTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export const IncomeVsExpenseTable = memo(IncomeVsExpenseTableComponent)
