import React from 'react'
import Link from 'next/link'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IconArrowLeft, IconCalendar, IconDownload, IconPrinter } from '@tabler/icons-react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-server'
import { headers } from 'next/headers'

type BillDetailPageProps = {
  params: { id: string }
}

async function getBill(id: string | undefined) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    return null
  }
  const branchId = (session.user as any).branchId as string | null
  if (!branchId || !id) {
    return null
  }

  const bill = await prisma.bill.findUnique({
    where: { billId: id },
    include: {
      vendor: true,
      items: true,
    },
  })
  if (!bill || bill.branchId !== branchId) {
    return null
  }
  return bill
}

function getBillStatusClasses(status: string) {
  const s = status.toLowerCase()
  switch (s) {
    case 'draft':
      return 'bg-gray-100 text-gray-700 border-none'
    case 'sent':
      return 'bg-blue-100 text-blue-700 border-none'
    case 'partial':
      return 'bg-yellow-100 text-yellow-700 border-none'
    case 'unpaid':
      return 'bg-amber-100 text-amber-700 border-none'
    case 'paid':
      return 'bg-green-100 text-green-700 border-none'
    default:
      return 'bg-slate-100 text-slate-700 border-none'
  }
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const bill = await getBill(params.id)

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Bill</h1>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-gray-900">
                      {bill?.billId || params.id}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shadow-none h-8 px-3"
                  >
                    <Link href="/accounting/purchases?tab=bill">
                      <IconArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Link>
                  </Button>
                  {bill && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="shadow-none h-8 px-3 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                    >
                      <Link href={`/accounting/bill/create/${bill.billId}`}>
                        Edit
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="shadow-none h-8 px-3">
                    <IconDownload className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="shadow-none h-8 px-3">
                    <IconPrinter className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-6">
                <div className="flex flex-wrap justify-between gap-6">
                  <div className="space-y-2 text-sm">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Billed To
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {bill?.vendor?.name || '-'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {bill?.vendor?.email || '-'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {bill?.vendor?.billingAddress ||
                        bill?.vendor?.shippingAddress ||
                        '-'}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Bill Date
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-900">
                        <IconCalendar className="h-3 w-3" />
                        {bill?.billDate
                          ? new Date(bill.billDate).toLocaleDateString('id-ID')
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Due Date
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-900">
                        <IconCalendar className="h-3 w-3" />
                        {bill?.dueDate
                          ? new Date(bill.dueDate).toLocaleDateString('id-ID')
                          : '-'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Status
                      </span>
                      <Badge className={getBillStatusClasses(bill?.status || 'draft')}>
                        {bill?.status || 'Draft'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Product Summary
                  </div>
                  <div className="text-xs text-muted-foreground">
                    All items here cannot be deleted.
                  </div>
                  <div className="mt-3 border border-gray-100 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-10 text-gray-600">#</TableHead>
                          <TableHead className="text-gray-600">Product</TableHead>
                          <TableHead className="text-gray-600 text-right">
                            Quantity
                          </TableHead>
                          <TableHead className="text-gray-600 text-right">
                            Rate
                          </TableHead>
                          <TableHead className="text-gray-600 text-right">
                            Tax
                          </TableHead>
                          <TableHead className="text-gray-600 text-right">
                            Discount
                          </TableHead>
                          <TableHead className="text-gray-600">
                            Description
                          </TableHead>
                          <TableHead className="text-right text-gray-600">
                            Price
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bill?.items?.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs text-gray-500">
                              {index + 1}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-gray-900">
                              {item.itemName}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              Rp {item.price.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {item.taxRate}%
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              Rp {item.discount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {item.description || '-'}
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold">
                              Rp {item.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-full max-w-sm">
                    <div className="border border-gray-100 rounded-md">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">
                          Summary
                        </div>
                      </div>
                      <div className="px-4 py-3 space-y-1.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Sub Total</span>
                          <span className="font-medium">
                            Rp{' '}
                            {bill
                              ? bill.items
                                  .reduce(
                                    (sum: number, it: any) =>
                                      sum +
                                      ((it.price || 0) * (it.quantity || 0) || 0),
                                    0,
                                  )
                                  .toLocaleString()
                              : '0'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="font-medium">
                            Rp{' '}
                            {bill
                              ? bill.items
                                  .reduce(
                                    (sum: number, it: any) => sum + (it.discount || 0),
                                    0,
                                  )
                                  .toLocaleString()
                              : '0'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="font-medium">
                            Rp{' '}
                            {bill
                              ? bill.items
                                  .reduce(
                                    (sum: number, it: any) =>
                                      sum +
                                      ((it.taxRate || 0) / 100) *
                                        Math.max(
                                          0,
                                          (it.price || 0) * (it.quantity || 0) -
                                            (it.discount || 0),
                                        ),
                                    0,
                                  )
                                  .toLocaleString()
                              : '0'}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-sm font-semibold">
                          <span className="text-gray-900">Total</span>
                          <span className="text-base text-gray-900">
                            Rp {bill?.total.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
