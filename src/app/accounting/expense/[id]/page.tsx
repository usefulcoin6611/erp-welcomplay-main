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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconCalendar } from '@tabler/icons-react'

type ExpenseDetailPageProps = {
  params: { id: string }
}

// Mock expense detail based on ExpenseController::show / expense()
const mockExpense = {
  number: 'EXP-2025-001',
  type: 'Vendor',
  userName: 'PT Supply Berkah',
  date: '2025-11-05',
  status: 'Paid',
  items: [
    {
      name: 'Office Supplies',
      description: 'General office stationery',
      quantity: 5,
      price: 250000,
      discount: 0,
      taxLabel: 'PPN 11%',
      total: 1387500,
    },
    {
      name: 'Internet Subscription',
      description: 'Monthly broadband subscription',
      quantity: 1,
      price: 750000,
      discount: 0,
      taxLabel: 'PPN 11%',
      total: 832500,
    },
  ],
  subtotal: 2000000,
  discountTotal: 0,
  taxTotal: 221250,
  grandTotal: 2221250,
}

export default function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const id = params.id
  const expense = mockExpense

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
                <h1 className="text-3xl font-bold">Expense Detail</h1>
                <p className="text-muted-foreground">
                  Detail for expense{' '}
                  <span className="font-semibold">{expense.number}</span>{' '}
                  (mock data, id: {id})
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-none">
                {expense.status}
              </Badge>
            </div>

            {/* Info cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payer / Vendor</CardTitle>
                  <CardDescription>
                    Entity associated with this expense transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="font-medium">{expense.userName}</div>
                  <div className="text-muted-foreground">
                    Type: {expense.type}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expense No.</span>
                    <span className="font-medium">{expense.number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Date</span>
                    <span className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      {expense.date}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expense.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {item.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.taxLabel}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {item.discount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          Rp {item.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Totals */}
            <div className="flex justify-end">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rp {expense.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>Rp {expense.discountTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>Rp {expense.taxTotal.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">
                      Rp {expense.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

