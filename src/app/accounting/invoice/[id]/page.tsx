'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'

type PageProps = {
  params: Promise<{ id: string }>
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: 'Draft', color: 'bg-blue-100 text-blue-700 border-none' },
  1: { label: 'Sent', color: 'bg-yellow-100 text-yellow-700 border-none' },
  2: { label: 'Unpaid', color: 'bg-red-100 text-red-700 border-none' },
  3: { label: 'Partial', color: 'bg-cyan-100 text-cyan-700 border-none' },
  4: { label: 'Paid', color: 'bg-blue-100 text-blue-700 border-none' },
}

function getStatusClasses(status: number) {
  switch (status) {
    case 0: return 'bg-blue-100 text-blue-700 border-none'
    case 1: return 'bg-cyan-100 text-cyan-700 border-none'
    case 2: return 'bg-yellow-100 text-yellow-700 border-none'
    case 3: return 'bg-orange-100 text-orange-700 border-none'
    case 4: return 'bg-green-100 text-green-700 border-none'
    default: return 'bg-gray-100 text-gray-700 border-none'
  }
}

type InvoiceDetail = {
  invoiceId: string
  status: number
  issueDate: string
  dueDate: string
  dueAmount: number
  description?: string
  customer?: { name?: string; customerCode?: string }
  items: {
    id: string
    itemName: string
    quantity: number
    price: number
    discount: number
    taxRate: number
    amount: number
    description?: string
  }[]
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { id } = await params
        const res = await fetch(`/api/invoices/${id}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.message || 'Failed to fetch invoice detail')
        const e = json.data as any
        setInvoice({
          invoiceId: e.invoiceId,
          status: e.status,
          issueDate: e.issueDate,
          dueDate: e.dueDate,
          dueAmount: e.dueAmount,
          description: e.description ?? '',
          customer: { name: e.customer?.name ?? '', customerCode: e.customer?.customerCode ?? '' },
          items: (e.items ?? []).map((it: any) => ({
            id: it.id,
            itemName: it.itemName,
            quantity: it.quantity,
            price: it.price,
            discount: it.discount,
            taxRate: it.taxRate,
            amount: it.amount,
            description: it.description ?? '',
          })),
        })
      } catch (err: any) {
        setError(err.message || 'Gagal memuat detail')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  const computeTotals = useMemo(() => {
    if (!invoice) return { subTotal: 0, discount: 0, tax: 0, total: 0 }
    const subTotal = invoice.items.reduce((sum, it) => sum + (it.quantity * it.price - it.discount), 0)
    const tax = invoice.items.reduce((sum, it) => {
      const base = it.quantity * it.price - it.discount
      return sum + (it.taxRate / 100) * base
    }, 0)
    const total = invoice.items.reduce((sum, it) => sum + it.amount, 0) || subTotal + tax
    const discount = invoice.items.reduce((sum, it) => sum + it.discount, 0)
    return { subTotal, discount, tax, total }
  }, [invoice])

  return (
    <SidebarProvider
      style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 space-y-1">
                <h1 className="text-2xl font-semibold">Invoice Detail</h1>
                {invoice && <p className="text-sm text-muted-foreground truncate">{invoice.invoiceId}</p>}
              </div>
              {invoice && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="shadow-none h-8 px-3 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100" asChild>
                    <Link href={`/accounting/invoice/${invoice.invoiceId}/edit`}>Edit</Link>
                  </Button>
                  <Select
                    value={String(invoice.status)}
                    onValueChange={(v) => {
                      const n = parseInt(v, 10)
                      fetch(`/api/invoices/${invoice.invoiceId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: n }),
                      }).then(() => {
                        setInvoice({ ...invoice, status: n })
                      })
                    }}
                  >
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue placeholder={statusMap[invoice.status].label} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusMap).map(([k, v]) => (
                        <SelectItem key={k} value={String(k)}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button asChild variant="outline" size="sm" className="shadow-none h-8 w-8 p-0">
                    <Link href="/accounting/sales?tab=invoice">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
              <CardHeader className="px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium">Create Invoice</div>
                        {invoice && <div className="text-muted-foreground">{new Date(invoice.issueDate).toLocaleDateString('id-ID')}</div>}
                      </div>
                      {invoice && <Badge className={getStatusClasses(0)}>{statusMap[0].label}</Badge>}
                    </div>
                  </div>
                  <div className="border rounded-md p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium">Send Invoice</div>
                        {invoice && <div className="text-muted-foreground">{new Date(invoice.issueDate).toLocaleDateString('id-ID')}</div>}
                      </div>
                      {invoice && <Badge className={getStatusClasses(Math.max(1, invoice.status))}>{statusMap[Math.max(1, invoice.status)].label}</Badge>}
                    </div>
                  </div>
                  <div className="border rounded-md p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium">Get Paid</div>
                        <div className="text-muted-foreground">Awaiting payment</div>
                      </div>
                      <Button variant="outline" size="sm" className="shadow-none h-8 px-3">Add Payment</Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {invoice && invoice.status !== 0 && (
              <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
                {invoice.status !== 4 && (
                  <>
                    <Button size="sm" variant="default" className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700">
                      Apply Credit Note
                    </Button>
                    <Button size="sm" variant="default" className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700">
                      Receipt Reminder
                    </Button>
                  </>
                )}
                <Button size="sm" variant="default" className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700">
                  Resend Invoice
                </Button>
                <Button size="sm" variant="default" className="h-8 px-3 shadow-none bg-blue-600 text-white hover:bg-blue-700">
                  Download
                </Button>
              </div>
            )}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
              <CardHeader className="px-6">
                <div className="w-full flex items-center justify-between">
                  <CardTitle className="text-base font-normal">Invoice</CardTitle>
                  {invoice && <span className="text-base font-semibold">#{invoice.invoiceId}</span>}
                </div>
              </CardHeader>
              <CardContent className="px-6 space-y-6">
                {invoice && (
                  <div className="flex justify-end">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-xs text-muted-foreground">Issue Date :</div>
                        <div className="text-sm font-medium">{new Date(invoice.issueDate).toLocaleDateString('id-ID')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Due Date :</div>
                        <div className="text-sm font-medium">{new Date(invoice.dueDate).toLocaleDateString('id-ID')}</div>
                      </div>
                    </div>
                  </div>
                )}
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : error ? (
                  <div className="text-sm text-red-600">Error: {error}</div>
                ) : invoice ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">Billed To :</div>
                        <div>{invoice.customer?.name || '-'}</div>
                        <div className="text-muted-foreground">{invoice.customer?.customerCode || '-'}</div>
                        <div className="text-muted-foreground">Tax Number : 001</div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">Shipped To :</div>
                        <div>{invoice.customer?.name || '-'}</div>
                        <div className="text-muted-foreground">{invoice.customer?.customerCode || '-'}</div>
                      </div>
                      <div className="flex items-start justify-end"></div>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Status :</span>{' '}
                      <Badge className={getStatusClasses(invoice.status)}>{statusMap[invoice.status].label}</Badge>
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
                          {invoice.items.map((it, idx) => {
                            const qty = it.quantity
                            const rate = it.price
                            const base = qty * rate - it.discount
                            const taxAmount = (it.taxRate / 100) * base
                            const total = base + taxAmount
                            return (
                              <TableRow key={it.id}>
                                <TableCell className="px-6">{idx + 1}</TableCell>
                                <TableCell className="px-6">{it.itemName}</TableCell>
                                <TableCell className="px-6">{qty} <span className="text-muted-foreground text-xs">Piece</span></TableCell>
                                <TableCell className="px-6">Rp {rate.toLocaleString('id-ID')}</TableCell>
                                <TableCell className="px-6">Rp {it.discount.toLocaleString('id-ID')}</TableCell>
                                <TableCell className="px-6">
                                  <div>Tax ({it.taxRate}%)</div>
                                  <div className="text-muted-foreground">Rp {taxAmount.toLocaleString('id-ID')}</div>
                                </TableCell>
                                <TableCell className="px-6">{it.description || '-'}</TableCell>
                                <TableCell className="px-6 text-right">
                                  <div>Rp {total.toLocaleString('id-ID')}</div>
                                  <div className="text-[10px] text-pink-600">after tax & discount</div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-start-4 md:col-span-1 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Sub Total</span><span>Rp {computeTotals.subTotal.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>Rp {computeTotals.discount.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>Rp {computeTotals.tax.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between font-medium border-t pt-2"><span>Total</span><span>Rp {computeTotals.total.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>Rp {(Math.max(computeTotals.total - (invoice?.dueAmount || 0), 0)).toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Credit Note Applied</span><span>Rp {0..toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Credit Note Issued</span><span>Rp {0..toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Due</span><span>Rp {(invoice?.dueAmount || 0).toLocaleString('id-ID')}</span></div>
                      </div>
                    </div>
                    <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
                      <CardHeader className="px-6">
                        <CardTitle className="text-base font-normal">Receipt Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="px-6">
                        <div className="overflow-x-auto w-full">
                          <Table className="w-full min-w-full table-auto">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="px-6">Payment Receipt</TableHead>
                                <TableHead className="px-6">Date</TableHead>
                                <TableHead className="px-6">Amount</TableHead>
                                <TableHead className="px-6">Payment Type</TableHead>
                                <TableHead className="px-6">Account</TableHead>
                                <TableHead className="px-6">Reference</TableHead>
                                <TableHead className="px-6">Description</TableHead>
                                <TableHead className="px-6">Receipt</TableHead>
                                <TableHead className="px-6">OrderId</TableHead>
                                <TableHead className="px-6">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No receipts found</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
                      <CardHeader className="px-6">
                        <CardTitle className="text-base font-normal">Credit Note Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="px-6">
                        <div className="overflow-x-auto w-full">
                          <Table className="w-full min-w-full table-auto">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="px-6">Credit Note</TableHead>
                                <TableHead className="px-6">Date</TableHead>
                                <TableHead className="px-6">Amount</TableHead>
                                <TableHead className="px-6">Description</TableHead>
                                <TableHead className="px-6">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No Data Found</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
