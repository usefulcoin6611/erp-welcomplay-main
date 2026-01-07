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

// Mock expenses similar to ExpenseController::index
const expenses = [
  {
    id: 'EXP-2025-001',
    type: 'Vendor',
    party: 'PT Supply Berkah',
    date: '2025-11-05',
    category: 'Office Supplies',
    total: 2221250,
    status: 'Paid',
  },
  {
    id: 'EXP-2025-002',
    type: 'Employee',
    party: 'Budi Santoso',
    date: '2025-11-04',
    category: 'Travel',
    total: 1750000,
    status: 'Pending',
  },
] as const

function getExpenseStatusClasses(status: string) {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-700 border-none'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 border-none'
    default:
      return 'bg-slate-100 text-slate-700 border-none'
  }
}

export default function ExpensePage() {
  const totalExpenses = expenses.length
  const totalAmount = expenses.reduce((sum, e) => sum + e.total, 0)

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
                <h1 className="text-3xl font-bold">Expenses</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                Create Expense
              </Button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalExpenses}</div>
                  <p className="text-xs text-muted-foreground">
                    Recorded expense entries
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
                    Impact on cash outflow
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Search and filter expenses by type, party, and category.
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
                      <Input placeholder="Search expenses..." className="pl-10" />
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
                      Status
                    </label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Expenses table */}
            <Card>
              <CardHeader>
                <CardTitle>Expense List</CardTitle>
                <CardDescription>
                  Overview of all recorded expenses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expense</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell>
                          <Button
                            asChild
                            variant="link"
                            className="h-auto p-0 text-sm font-semibold"
                          >
                            <Link href={`/accounting/expense/${exp.id}`}>
                              {exp.id}
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell>{exp.type}</TableCell>
                        <TableCell>{exp.party}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{exp.date}</span>
                          </div>
                        </TableCell>
                        <TableCell>{exp.category}</TableCell>
                        <TableCell>
                          <div className="font-medium">
                            Rp {exp.total.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getExpenseStatusClasses(exp.status)}>
                            {exp.status}
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

