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
  IconPlus,
} from '@tabler/icons-react'

const budgets = [
  {
    id: 'BDG-2025-ANNUAL',
    name: 'Budget Tahunan 2025',
    period: 'Yearly',
    year: 2025,
    plannedIncome: 800_000_000,
    plannedExpense: 520_000_000,
  },
  {
    id: 'BDG-2025-Q1',
    name: 'Budget Q1 2025',
    period: 'Quarterly',
    year: 2025,
    plannedIncome: 200_000_000,
    plannedExpense: 130_000_000,
  },
] as const

export default function BudgetPlannerPage() {
  const totalPlannedIncome = budgets.reduce(
    (sum, b) => sum + b.plannedIncome,
    0,
  )
  const totalPlannedExpense = budgets.reduce(
    (sum, b) => sum + b.plannedExpense,
    0,
  )

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
                <h1 className="text-3xl font-bold">Budget Planner</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                <IconPlus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Planned Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalPlannedIncome.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Planned Expense
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalPlannedExpense.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Planned Net Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp{' '}
                    {(
                      totalPlannedIncome - totalPlannedExpense
                    ).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter budget berdasarkan tahun dan periode.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="w-full md:w-36">
                    <label className="mb-1 block text-sm font-medium">
                      Year
                    </label>
                    <Input type="number" defaultValue={2025} />
                  </div>
                  <div className="w-full md:w-40">
                    <label className="mb-1 block text-sm font-medium">
                      Period
                    </label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="All Periods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Periods</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="half-yearly">
                          Half-Yearly
                        </SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Plans</CardTitle>
                <CardDescription>
                  Daftar budget plan seperti di modul Budget ERP.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Budget</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">
                        Planned Income
                      </TableHead>
                      <TableHead className="text-right">
                        Planned Expense
                      </TableHead>
                      <TableHead className="text-right">
                        Net Profit
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((b) => {
                      const netProfit = b.plannedIncome - b.plannedExpense
                      return (
                        <TableRow key={b.id}>
                          <TableCell>
                            <div className="text-sm font-semibold">
                              {b.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {b.id}
                            </div>
                          </TableCell>
                          <TableCell>{b.year}</TableCell>
                          <TableCell>{b.period}</TableCell>
                          <TableCell className="text-right">
                            Rp {b.plannedIncome.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            Rp {b.plannedExpense.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            Rp {netProfit.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-50 text-blue-700 border-none">
                              Detail
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Period Overview</CardTitle>
                <CardDescription>
                  Ringkasan tahunan untuk perbandingan budget.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span>Tahun 2025</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-none">
                    On Track
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

