import Link from 'next/link'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
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
import {
  IconCalendar,
  IconCreditCard,
  IconSearch,
} from '@tabler/icons-react'

// Mock payments similar to PaymentController::index
const payments = [
  {
    id: 'PAY-2025-001',
    date: '2025-11-07',
    vendor: 'PT Supply Berkah',
    account: 'BCA - Main Operating',
    category: 'Expense',
    amount: 5000000,
    status: 'Completed',
  },
  {
    id: 'PAY-2025-002',
    date: '2025-11-08',
    vendor: 'CV Logistik Nusantara',
    account: 'Mandiri - Purchases',
    category: 'Logistics',
    amount: 3200000,
    status: 'Completed',
  },
] as const

export default function PaymentPage() {
  const totalPayments = payments.length
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)

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
                <h1 className="text-3xl font-bold">Payments</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                Create Payment
              </Button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPayments}</div>
                  <p className="text-xs text-muted-foreground">
                    Recorded payment entries
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
                    Total paid to vendors
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Search and filter payments by vendor, date, and category.
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
                      <Input placeholder="Search payments..." className="pl-10" />
                    </div>
                  </div>
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      Date
                    </label>
                    <Input type="date" />
                  </div>
                  <div className="w-full md:w-40">
                    <label className="mb-1 block text-sm font-medium">
                      Category
                    </label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payments table */}
            <Card>
              <CardHeader>
                <CardTitle>Payment List</CardTitle>
                <CardDescription>
                  Overview of vendor payments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Button
                            asChild
                            variant="link"
                            className="h-auto p-0 text-sm font-semibold"
                          >
                            <Link href={`/accounting/payment/${payment.id}`}>
                              {payment.id}
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{payment.date}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.vendor}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCreditCard className="h-3 w-3" />
                            <span>{payment.account}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-50 text-blue-700 border-none">
                            {payment.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            Rp {payment.amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-50 text-blue-700 border-none">
                            Detail
                          </Badge>
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

