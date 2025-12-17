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
import type { TaxData } from './constants'

interface TaxSummaryTableProps {
  title: string
  monthList: string[]
  taxData: TaxData[]
  emptyMessage: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function TaxSummaryTableComponent({
  title,
  monthList,
  taxData,
  emptyMessage,
}: TaxSummaryTableProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 min-w-[150px] bg-background">
                  Tax
                </TableHead>
                {monthList.map((month) => (
                  <TableHead key={month} className="text-right">
                    {month}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxData.length > 0 ? (
                taxData.map((tax) => (
                  <TableRow key={tax.taxName}>
                    <TableCell className="sticky left-0 z-10 bg-background font-medium">
                      {tax.taxName}
                    </TableCell>
                    {tax.monthlyValues.map((value, index) => (
                      <TableCell key={index} className="text-right">
                        {formatCurrency(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={monthList.length + 1} className="text-center text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export const TaxSummaryTable = memo(TaxSummaryTableComponent)
