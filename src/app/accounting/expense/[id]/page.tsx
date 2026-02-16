import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IconCalendar } from '@tabler/icons-react'

type ExpenseDetailPageProps = {
  params: Promise<{ id: string }>
}

async function fetchExpenseDetail(expenseId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/expenses/${expenseId}`,
    { cache: 'no-store' },
  )

  if (!res.ok) {
    return null
  }

  const json = await res.json()

  if (!json?.success || !json.data) {
    return null
  }

  return json.data as {
    expenseId: string
    type: string
    party: string
    date: string
    category: string
    total: number
    status: string
    reference: string | null
    description: string | null
  }
}

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const { id } = await params
  const expense = await fetchExpenseDetail(id)

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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Expense Detail</h1>
                <p className="text-muted-foreground">
                  Detail for expense{' '}
                  <span className="font-semibold">{expense?.expenseId ?? id}</span>
                </p>
              </div>
              {expense ? (
                <Badge className="bg-green-100 text-green-700 border-none">
                  {expense.status}
                </Badge>
              ) : null}
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
                  <div className="font-medium">{expense?.party ?? '-'}</div>
                  <div className="text-muted-foreground">
                    Type: {expense?.type ?? '-'}
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
                    <span className="font-medium">{expense?.expenseId ?? id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Date</span>
                    <span className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      {expense ? new Date(expense.date).toISOString().slice(0, 10) : '-'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="flex justify-end">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span>{expense?.category ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reference</span>
                    <span>{expense?.reference ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Description</span>
                    <span>{expense?.description ?? '-'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">
                      Rp {expense ? Number(expense.total ?? 0).toLocaleString() : '0'}
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
