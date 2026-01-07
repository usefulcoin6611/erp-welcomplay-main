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
  IconSearch,
} from '@tabler/icons-react'

// Mock bills similar to BillController::index/view
const bills = [
  {
    id: 'BILL-2025-001',
    vendor: 'PT Supply Berkah',
    billDate: '2025-11-01',
    dueDate: '2025-11-30',
    category: 'Office Supplies',
    total: 16095000,
    status: 'Draft',
  },
  {
    id: 'BILL-2025-002',
    vendor: 'CV Logistik Nusantara',
    billDate: '2025-11-03',
    dueDate: '2025-12-03',
    category: 'Logistics',
    total: 9800000,
    status: 'Sent',
  },
  {
    id: 'BILL-2025-003',
    vendor: 'PT Teknologi Digital',
    billDate: '2025-11-05',
    dueDate: '2025-11-20',
    category: 'Services',
    total: 12300000,
    status: 'Partial',
  },
] as const

function getBillStatusClasses(status: string) {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 text-gray-700 border-none'
    case 'Sent':
      return 'bg-blue-100 text-blue-700 border-none'
    case 'Partial':
      return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Paid':
      return 'bg-green-100 text-green-700 border-none'
    default:
      return 'bg-slate-100 text-slate-700 border-none'
  }
}

export default function BillPage() {
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
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                Create Bill
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
                              {bill.id}
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
                          <span className="text-sm">{bill.category}</span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            Rp {bill.total.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBillStatusClasses(bill.status)}>
                            {bill.status}
                          </Badge>
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

