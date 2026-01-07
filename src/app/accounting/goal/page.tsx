import React from "react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  IconCalendar,
  IconPlus,
} from '@tabler/icons-react'

const goals = [
  {
    id: 'GL-2025-001',
    name: 'Tingkatkan Pendapatan 20%',
    type: 'Revenue',
    from: '2025-01-01',
    to: '2025-12-31',
    amount: 200_000_000,
    isDisplay: true,
  },
  {
    id: 'GL-2025-002',
    name: 'Kurangi Biaya Operasional 10%',
    type: 'Expense',
    from: '2025-01-01',
    to: '2025-12-31',
    amount: 80_000_000,
    isDisplay: false,
  },
] as const

export default function FinancialGoalPage() {
  const totalGoals = goals.length
  const totalAmount = goals.reduce((sum, g) => sum + g.amount, 0)

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Financial Goal</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                <IconPlus className="mr-2 h-4 w-4" />
                Create Goal
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalGoals}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Target Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalAmount.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter financial goal berdasarkan periode.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      From
                    </label>
                    <Input type="date" />
                  </div>
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      To
                    </label>
                    <Input type="date" />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal List</CardTitle>
                <CardDescription>
                  Daftar financial goal seperti modul Goal ERP.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Goal</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Display</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goals.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell>
                          <div className="text-sm font-semibold">
                            {g.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {g.id}
                          </div>
                        </TableCell>
                        <TableCell>{g.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{g.from}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{g.to}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {g.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {g.isDisplay ? (
                            <Badge className="bg-green-100 text-green-700 border-none">
                              On Dashboard
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 border-none">
                              Hidden
                            </Badge>
                          )}
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

