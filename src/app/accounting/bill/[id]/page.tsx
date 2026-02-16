import React from 'react'
import Link from 'next/link'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IconArrowLeft } from '@tabler/icons-react'
import { prisma } from '@/lib/prisma'

type BillDetailPageProps = {
  params: Promise<{ id: string }>
}

async function getBill(id: string | undefined) {
  if (!id) {
    return null
  }

  const bill = await prisma.bill.findUnique({
    where: { billId: id },
    include: {
      vendor: true,
      items: true,
    },
  })

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

function getBillStatusBarClasses(status: string) {
  const s = status.toLowerCase()
  switch (s) {
    case 'draft':
      return 'bg-gray-300'
    case 'sent':
      return 'bg-blue-500'
    case 'partial':
    case 'unpaid':
      return 'bg-amber-500'
    case 'paid':
      return 'bg-green-500'
    default:
      return 'bg-slate-400'
  }
}

function mapBillStatus(status: string | null | undefined): { value: string; label: string } {
  const s = (status || '').toLowerCase()
  switch (s) {
    case 'draft':
      return { value: 'draft', label: 'Draft' }
    case 'sent':
      return { value: 'sent', label: 'Sent' }
    case 'partial':
      return { value: 'partial', label: 'Partial' }
    case 'unpaid':
      return { value: 'unpaid', label: 'Unpaid' }
    case 'paid':
      return { value: 'paid', label: 'Paid' }
    default:
      return { value: 'draft', label: 'Draft' }
  }
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params
  const bill = await getBill(id)

  const items = bill?.items ?? []
  const subTotal = items.reduce(
    (sum: number, it: any) => sum + Math.max(0, (it.price || 0) * (it.quantity || 0) - (it.discount || 0)),
    0,
  )
  const discountTotal = items.reduce((sum: number, it: any) => sum + (it.discount || 0), 0)
  const taxTotal = items.reduce((sum: number, it: any) => {
    const base = Math.max(0, (it.price || 0) * (it.quantity || 0) - (it.discount || 0))
    return sum + ((it.taxRate || 0) / 100) * base
  }, 0)
  const grandTotal = bill?.total ?? subTotal + taxTotal
  const billStatus = mapBillStatus((bill as any)?.status)

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
            <div className="flex items-center justify-between">
              <div className="min-w-0 space-y-1">
                <h1 className="text-2xl font-semibold">Bill Detail</h1>
                {bill && (
                  <p className="text-sm text-muted-foreground truncate">
                    {bill.billId}
                  </p>
                )}
              </div>
              {bill && (
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shadow-none h-8 px-3 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                  >
                    <Link href={`/accounting/bill/create/${bill.billId}`}>
                      Edit
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="shadow-none h-8 w-40 px-3"
                  >
                    <Link href={`/accounting/bill/create/${bill.billId}`}>
                      Change Status
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shadow-none h-8 w-8 p-0"
                  >
                    <Link href="/accounting/purchases?tab=bill">
                      <IconArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {!bill && (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
                <CardContent className="px-6 py-10">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-sm font-medium">Bill tidak ditemukan</p>
                    <p className="text-sm text-muted-foreground text-center">
                      Pastikan Anda membuka bill dari daftar yang benar atau memiliki akses ke cabang tersebut.
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="shadow-none h-8 px-3 mt-1"
                    >
                      <Link href="/accounting/purchases?tab=bill">Kembali ke daftar bill</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {bill && (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
                <CardHeader className="px-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium">Create Bill</div>
                          <div className="text-muted-foreground">
                            {bill.billDate
                              ? new Date(bill.billDate).toLocaleDateString('id-ID')
                              : '-'}
                          </div>
                        </div>
                        <Badge className={getBillStatusClasses('draft')}>
                          Draft
                        </Badge>
                      </div>
                    </div>
                    <div className="border rounded-md p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium">Send Bill</div>
                          <div className="text-muted-foreground">
                            {bill.billDate
                              ? new Date(bill.billDate).toLocaleDateString('id-ID')
                              : '-'}
                          </div>
                        </div>
                        <Badge className={getBillStatusClasses(bill.status || 'sent')}>
                          {bill.status || 'Sent'}
                        </Badge>
                      </div>
                    </div>
                    <div className="border rounded-md p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium">Make Payment</div>
                          <div className="text-muted-foreground">
                            Awaiting payment
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-8 px-3"
                        >
                          Add Payment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {bill && bill.status !== 'draft' && (
              <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
                {bill.status !== 'paid' && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Apply Debit Note
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Bill Reminder
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700"
                >
                  Resend Bill
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700"
                >
                  Download
                </Button>
              </div>
            )}

            {bill && (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
                <CardHeader className="px-6">
                  <div className="w-full flex items-center justify-between">
                    <CardTitle className="text-base font-normal">Bill</CardTitle>
                    <span className="text-base font-semibold">
                      #{bill.billId}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-6 space-y-6">
                  <div className="flex justify-end">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Issue Date :
                        </div>
                        <div className="text-sm font-medium">
                          {bill.billDate
                            ? new Date(bill.billDate).toLocaleDateString('id-ID')
                            : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Due Date :
                        </div>
                        <div className="text-sm font-medium">
                          {bill.dueDate
                            ? new Date(bill.dueDate).toLocaleDateString('id-ID')
                            : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">Billed To :</div>
                      <div>{bill.vendor?.billingName || bill.vendor?.name || '-'}</div>
                      <div className="text-muted-foreground">
                        {bill.vendor?.billingAddress || '-'}
                      </div>
                      <div className="text-muted-foreground">
                        {[
                          bill.vendor?.billingCity,
                          bill.vendor?.billingState,
                          bill.vendor?.billingZip,
                        ]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </div>
                      <div className="text-muted-foreground">
                        {bill.vendor?.billingCountry || '-'}
                      </div>
                      <div className="text-muted-foreground">
                        {bill.vendor?.billingPhone || '-'}
                      </div>
                      <div className="text-muted-foreground">
                        Tax Number: {bill.vendor?.taxNumber || '-'}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">Shipped To :</div>
                      <div>{bill.vendor?.shippingName || bill.vendor?.name || '-'}</div>
                      <div className="text-muted-foreground">
                        {bill.vendor?.shippingAddress || '-'}
                      </div>
                      <div className="text-muted-foreground">
                        {[
                          bill.vendor?.shippingCity,
                          bill.vendor?.shippingState,
                          bill.vendor?.shippingZip,
                        ]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </div>
                      <div className="text-muted-foreground">
                        {bill.vendor?.shippingCountry || '-'}
                      </div>
                      <div className="text-muted-foreground">
                        {bill.vendor?.shippingPhone || '-'}
                      </div>
                    </div>
                    <div className="flex items-start justify-end">
                      <div className="text-sm text-right space-y-1">
                        <div>
                          <span className="text-muted-foreground">Status :</span>{' '}
                          <Badge className={getBillStatusClasses(billStatus.value)}>
                            {billStatus.label}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total :</span>{' '}
                          <span className="font-semibold">
                            Rp {grandTotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <Table className="w-full min-w-full table-auto">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6">#</TableHead>
                          <TableHead className="px-6">Product</TableHead>
                          <TableHead className="px-6">Quantity</TableHead>
                          <TableHead className="px-6">Rate</TableHead>
                          <TableHead className="px-6">Discount</TableHead>
                          <TableHead className="px-6">Tax</TableHead>
                          <TableHead className="px-6">Description</TableHead>
                          <TableHead className="px-6 text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item: any, index: number) => {
                          const qty = item.quantity || 0
                          const rate = item.price || 0
                          const base = Math.max(0, qty * rate - (item.discount || 0))
                          const taxAmount = ((item.taxRate || 0) / 100) * base
                          const total = base + taxAmount
                          return (
                            <TableRow key={item.id || index}>
                              <TableCell className="px-6">{index + 1}</TableCell>
                              <TableCell className="px-6">{item.itemName}</TableCell>
                              <TableCell className="px-6">
                                {qty}{' '}
                                <span className="text-muted-foreground text-xs">
                                  Unit
                                </span>
                              </TableCell>
                              <TableCell className="px-6">
                                Rp {rate.toLocaleString('id-ID')}
                              </TableCell>
                              <TableCell className="px-6">
                                Rp {(item.discount || 0).toLocaleString('id-ID')}
                              </TableCell>
                              <TableCell className="px-6">
                                <div>Tax ({item.taxRate || 0}%)</div>
                                <div className="text-muted-foreground">
                                  Rp {taxAmount.toLocaleString('id-ID')}
                                </div>
                              </TableCell>
                              <TableCell className="px-6">
                                {item.description || '-'}
                              </TableCell>
                              <TableCell className="px-6 text-right">
                                <div>Rp {total.toLocaleString('id-ID')}</div>
                                <div className="text-[10px] text-pink-600">
                                  after tax & discount
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-start-4 md:col-span-1 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sub Total</span>
                        <span>
                          Rp {subTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span>
                          Rp {discountTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>
                          Rp {taxTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Total</span>
                        <span>
                          Rp {grandTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid</span>
                        <span>Rp {0..toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Debit Note Applied</span>
                        <span>Rp {0..toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Debit Note Issued</span>
                        <span>Rp {0..toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due</span>
                        <span>
                          Rp {grandTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
                    <CardHeader className="px-6">
                      <CardTitle className="text-base font-normal">
                        Payment Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6">
                      <div className="overflow-x-auto w-full">
                        <Table className="w-full min-w-full table-auto">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-6">Payment</TableHead>
                              <TableHead className="px-6">Date</TableHead>
                              <TableHead className="px-6">Amount</TableHead>
                              <TableHead className="px-6">Payment Type</TableHead>
                              <TableHead className="px-6">Account</TableHead>
                              <TableHead className="px-6">Reference</TableHead>
                              <TableHead className="px-6">Description</TableHead>
                              <TableHead className="px-6">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No payments found
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
                    <CardHeader className="px-6">
                      <CardTitle className="text-base font-normal">
                        Debit Note Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6">
                      <div className="overflow-x-auto w-full">
                        <Table className="w-full min-w-full table-auto">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-6">Debit Note</TableHead>
                              <TableHead className="px-6">Date</TableHead>
                              <TableHead className="px-6">Amount</TableHead>
                              <TableHead className="px-6">Description</TableHead>
                              <TableHead className="px-6">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No Data Found
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
