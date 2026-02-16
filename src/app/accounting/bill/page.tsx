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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconCalendar, IconSearch } from '@tabler/icons-react'

type BillRow = {
  id: string
  billNumber: string
  vendor: string
  billDate: string
  dueDate: string
  category: string
  total: number
  status: string
  statusLabel: string
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

async function fetchBills(): Promise<BillRow[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/bills`, {
      cache: 'no-store',
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.success || !Array.isArray(json.data)) {
      return []
    }
    return json.data as BillRow[]
  } catch {
    return []
  }
}

export default async function BillPage() {
  const bills = await fetchBills()
  const totalBills = bills.length
  const totalAmount = bills.reduce((sum, bill) => sum + bill.total, 0)

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Bills</h1>
              </div>
              <Button
                asChild
                className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
              >
                <Link href="/accounting/bill/create/new">Create Bill</Link>
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Bills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBills}</div>
                  <p className="text-xs text-muted-foreground">
                    All vendor bills
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Combined bill value
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Search and filter bills by vendor, date, and status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1 min-w-0">
                    <label className="mb-1 block text-sm font-medium">
                      Search
                    </label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input placeholder="Search bills..." className="pl-10" />
                    </div>
                  </div>
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      Bill Date
                    </label>
                    <Input type="date" />
                  </div>
                  <div className="w-full md:w-40">
                    <label className="mb-1 block text-sm font-medium">
                      Status
                    </label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Bills table */}
            <Card>
              <CardHeader>
                <CardTitle>Bill List</CardTitle>
                <CardDescription>
                  Overview of all purchase bills.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Bill Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>
                          <Button
                            asChild
                            variant="link"
                            className="h-auto p-0 text-sm font-semibold"
                          >
                            <Link href={`/accounting/bill/${bill.id}`}>
                              {bill.billNumber}
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{bill.vendor}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{bill.billDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{bill.dueDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{bill.category || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            Rp {bill.total.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBillStatusClasses(bill.status)}>
                            {bill.statusLabel || bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 shadow-none bg-blue-50 text-blue-700 border-blue-100"
                            >
                              <Link href={`/accounting/bill/${bill.id}`}>View</Link>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 shadow-none bg-cyan-50 text-cyan-700 border-cyan-100"
                            >
                              <Link href={`/accounting/bill/create/${bill.id}`}>Edit</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

