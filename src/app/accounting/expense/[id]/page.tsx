'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { IconCalendar } from '@tabler/icons-react'

type ExpenseDetailPageProps = {
  params: Promise<{ id: string }>
}

type ExpenseDetail = {
  expenseId: string
  type: string
  party: string
  date: string
  category: string
  total: number
  status: string
  reference: string | null
  description: string | null
  items: {
    id: string
    productId: string | null
    itemName: string
    quantity: number
    price: number
    discount: number
    taxRate: number
    amount: number
    description: string | null
    productName: string | null
    accountName: string | null
  }[]
}

export default function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const [expense, setExpense] = useState<ExpenseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { id } = await params
        const res = await fetch(`/api/expenses/${id}`, { cache: 'no-store' })
        if (!res.ok) {
          throw new Error('Gagal mengambil detail expense')
        }
        const json = await res.json()
        if (!json?.success || !json.data) {
          throw new Error(json?.message || 'Data expense tidak ditemukan')
        }
        const e = json.data as any
        setExpense({
          expenseId: e.expenseId,
          type: e.type,
          party: e.party,
          date: e.date,
          category: e.category,
          total: Number(e.total) || 0,
          status: e.status,
          reference: e.reference ?? null,
          description: e.description ?? null,
          items: Array.isArray(e.items)
            ? e.items.map((it: any) => ({
                id: it.id as string,
                productId: (it.productId as string | null) ?? null,
                itemName: (it.itemName as string) || '',
                quantity: Number(it.quantity) || 0,
                price: Number(it.price) || 0,
                discount: Number(it.discount) || 0,
                taxRate: Number(it.taxRate) || 0,
                amount: Number(it.amount) || 0,
                description: (it.description as string | null) ?? null,
                productName: it.product?.name ? (it.product.name as string) : null,
                accountName: it.product?.expenseAccountName
                  ? (it.product.expenseAccountName as string)
                  : null,
              }))
            : [],
        })
      } catch (err: any) {
        setError(err?.message || 'Terjadi kesalahan saat memuat data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  const computedTotals = useMemo(() => {
    const items = expense?.items ?? []
    if (!items.length) {
      return {
        subTotal: expense ? Number(expense.total ?? 0) : 0,
        discount: 0,
        tax: 0,
        total: expense ? Number(expense.total ?? 0) : 0,
      }
    }
    let subTotal = 0
    let discount = 0
    let tax = 0
    items.forEach((it) => {
      const lineBase = Math.max(0, it.price * it.quantity - it.discount)
      const lineTax = (it.taxRate / 100) * lineBase
      subTotal += it.price * it.quantity
      discount += it.discount
      tax += lineTax
    })
    const total = Math.max(0, subTotal - discount + tax)
    return { subTotal, discount, tax, total }
  }, [expense])

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
            <div className="flex items-center justify-end">
              <Button asChild variant="outline" size="sm" className="shadow-none h-7">
                <Link href="/accounting/purchases?tab=expense">Back</Link>
              </Button>
            </div>
            {/* Top Card */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6">
                <div className="flex w-full items-center">
                  <CardTitle className="text-xl font-semibold flex-1">Expense</CardTitle>
                  <div className="text-2xl font-semibold ml-auto text-right">{expense ? `# ${expense.expenseId}` : ''}</div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {/* Top 3-column section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Billed To */}
                  <div>
                    <div className="text-sm font-semibold mb-2">Billed To :</div>
                    <div className="text-sm">
                      <div className="font-medium">{expense?.party ?? '-'}</div>
                      <div className="text-muted-foreground">-</div>
                      <div className="text-muted-foreground">-</div>
                      <div className="text-muted-foreground">-</div>
                      <div className="text-muted-foreground">-</div>
                    </div>
                  </div>

                  {/* Shipped To */}
                  <div>
                    <div className="text-sm font-semibold mb-2">Shipped To :</div>
                    <div className="text-sm">
                      <div className="font-medium">{expense?.party ?? '-'}</div>
                      <div className="text-muted-foreground">-</div>
                      <div className="text-muted-foreground">-</div>
                      <div className="text-muted-foreground">-</div>
                      <div className="text-muted-foreground">-</div>
                    </div>
                  </div>

                  {/* Payment Date */}
                  <div>
                    <div className="text-sm font-semibold mb-2">Payment Date :</div>
                    <div className="text-sm flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      <span>{expense ? new Date(expense.date).toISOString().slice(0, 10) : '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Status row */}
                <div className="grid grid-cols-1 md:grid-cols-3 mt-4">
                  <div>
                    <div className="text-sm font-semibold mb-2">Status :</div>
                    {expense ? (
                      <Badge className="bg-green-100 text-green-700 border-none">
                        {expense.status}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700 border-none">-</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Product Summary</CardTitle>
                <CardDescription>All items here cannot be deleted.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Chart Of Account</TableHead>
                      <TableHead>Account Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">
                        Price
                        <br />
                        <span className="text-xs text-red-600 font-bold">after tax & discount</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expense && expense.items.length > 0 ? (
                      expense.items.map((it, idx) => {
                        const qty = it.quantity
                        const rate = it.price
                        const base = Math.max(0, qty * rate - it.discount)
                        const taxAmount = (it.taxRate / 100) * base
                        const lineTotal = base + taxAmount
                        return (
                          <TableRow key={it.id}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{it.productName || it.itemName || '-'}</TableCell>
                            <TableCell>{qty}</TableCell>
                            <TableCell>
                              {`Rp ${rate.toLocaleString('id-ID')}`}
                            </TableCell>
                            <TableCell>
                              {`Rp ${it.discount.toLocaleString('id-ID')}`}
                            </TableCell>
                            <TableCell>
                              <div>Tax ({it.taxRate}%)</div>
                              <div className="text-muted-foreground">
                                {`Rp ${taxAmount.toLocaleString('id-ID')}`}
                              </div>
                            </TableCell>
                            <TableCell>{it.accountName || '-'}</TableCell>
                            <TableCell>
                              {`Rp ${base.toLocaleString('id-ID')}`}
                            </TableCell>
                            <TableCell>{it.description || expense?.description || '-'}</TableCell>
                            <TableCell className="text-right">
                              {`Rp ${lineTotal.toLocaleString('id-ID')}`}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>
                          {expense ? `Rp ${Number(expense.total ?? 0).toLocaleString('id-ID')}` : 'Rp 0'}
                        </TableCell>
                        <TableCell>Rp 0</TableCell>
                        <TableCell>Rp 0</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          {expense ? `Rp ${Number(expense.total ?? 0).toLocaleString('id-ID')}` : 'Rp 0'}
                        </TableCell>
                        <TableCell>{expense?.description ?? '-'}</TableCell>
                        <TableCell className="text-right">
                          {expense ? `Rp ${Number(expense.total ?? 0).toLocaleString('id-ID')}` : 'Rp 0'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={8} />
                      <TableCell className="text-right font-semibold">Sub Total</TableCell>
                      <TableCell className="text-right">
                        {`Rp ${computedTotals.subTotal.toLocaleString('id-ID')}`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} />
                      <TableCell className="text-right font-semibold">Discount</TableCell>
                      <TableCell className="text-right">
                        {`Rp ${computedTotals.discount.toLocaleString('id-ID')}`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} />
                      <TableCell className="text-right text-blue-600 font-semibold">Total</TableCell>
                      <TableCell className="text-right text-blue-600 font-semibold">
                        {`Rp ${computedTotals.total.toLocaleString('id-ID')}`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} />
                      <TableCell className="text-right font-semibold">Paid</TableCell>
                      <TableCell className="text-right">
                        {expense && expense.status?.toLowerCase() === 'paid'
                          ? `Rp ${computedTotals.total.toLocaleString('id-ID')}`
                          : 'Rp 0'}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
