'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useMemo } from 'react'

const CARD_STYLE = 'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type CategoryRow = { name: string; budget: number[]; actual: number[] }

function sumArr(values: number[]): number {
  return values.reduce((s, v) => s + v, 0)
}

const INCOME_CATEGORIES: CategoryRow[] = [
  { name: 'Maintenance Sales', budget: [15000, 0, 0, 8500, 0, 0, 0, 45000, 0, 0, 0, 1000], actual: [14000, 0, 0, 8000, 0, 0, 0, 46000, 0, 0, 0, 1200] },
  { name: 'Product Sales', budget: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], actual: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'income', budget: [0, 0, 8000, 0, 0, 0, 0, 0, 0, 0, 0, 0], actual: [0, 0, 7500, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
]

const EXPENSE_CATEGORIES: CategoryRow[] = [
  { name: 'Rent Or Lease', budget: [0, 15000, 0, 0, 100, 0, 4506, 0, 0, 0, 25040, 0], actual: [0, 15000, 0, 0, 150, 0, 4506, 0, 0, 0, 24800, 0] },
  { name: 'Travel', budget: [0, 0, 0, 8500, 0, 0, 0, 0, 2000, 0, 5000, 0], actual: [0, 0, 0, 9000, 0, 0, 0, 0, 1800, 0, 5200, 0] },
]

const BUDGET_INFO: Record<string, { name: string; from: string; budgetPeriod: string }> = {
  '1': { name: 'Monthly Budget Plan', from: '2025', budgetPeriod: 'Monthly' },
  '2': { name: 'Quarterly Budget Plan', from: '2025', budgetPeriod: 'Quarterly' },
  '3': { name: 'Half-Yearly Budget Plan', from: '2025', budgetPeriod: 'Half Yearly' },
  '4': { name: 'Yearly Budget Plan', from: '2025', budgetPeriod: 'Yearly' },
}

function formatNum(n: number) {
  return n === 0 ? '0' : new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(n)
}

export default function BudgetDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const budgetInfo = id ? BUDGET_INFO[id] : null

  const incomeTotals = useMemo(() => ({
    budgetByMonth: MONTHS.map((_, i) => INCOME_CATEGORIES.reduce((s, r) => s + (r.budget[i] ?? 0), 0)),
    actualByMonth: MONTHS.map((_, i) => INCOME_CATEGORIES.reduce((s, r) => s + (r.actual[i] ?? 0), 0)),
    budgetTotal: INCOME_CATEGORIES.reduce((s, r) => s + sumArr(r.budget), 0),
    actualTotal: INCOME_CATEGORIES.reduce((s, r) => s + sumArr(r.actual), 0),
  }), [])
  const expenseTotals = useMemo(() => ({
    budgetByMonth: MONTHS.map((_, i) => EXPENSE_CATEGORIES.reduce((s, r) => s + (r.budget[i] ?? 0), 0)),
    actualByMonth: MONTHS.map((_, i) => EXPENSE_CATEGORIES.reduce((s, r) => s + (r.actual[i] ?? 0), 0)),
    budgetTotal: EXPENSE_CATEGORIES.reduce((s, r) => s + sumArr(r.budget), 0),
    actualTotal: EXPENSE_CATEGORIES.reduce((s, r) => s + sumArr(r.actual), 0),
  }), [])

  if (!id || !budgetInfo) {
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
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              <Card className={CARD_STYLE}>
                <CardContent className="px-6 py-8 text-center text-muted-foreground">
                  Budget plan not found.
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="shadow-none" asChild>
                      <Link href="/accounting/budget">Back to Budget Planner</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <Card className={CARD_STYLE}>
              <CardContent className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Breadcrumb>
                      <BreadcrumbList className="text-muted-foreground">
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <Link href="/accounting/budget">Budget Planner</Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>{budgetInfo.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                    <h4 className="mt-2 text-xl font-semibold">{budgetInfo.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="shadow-none h-7" asChild>
                      <Link href="/accounting/budget">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                      asChild
                    >
                      <Link href={`/accounting/budget/${id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={CARD_STYLE}>
              <CardHeader className="px-6">
                <CardTitle className="text-base font-medium">Budget Information</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">{budgetInfo.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">From (Year)</p>
                    <p className="text-sm font-medium">{budgetInfo.from}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Budget Period</p>
                    <p className="text-sm font-medium">{budgetInfo.budgetPeriod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={CARD_STYLE}>
              <CardHeader className="px-6">
                <CardTitle className="text-base font-medium">Income & Expense by Category (Budget, Actual, Over Budget)</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[140px] px-3 py-2 font-semibold bg-muted/50 sticky left-0 z-10">
                          CATEGORY
                        </TableHead>
                        {MONTHS.map((m) => (
                          <TableHead key={m} colSpan={3} className="px-0 py-2 font-medium text-center text-xs whitespace-nowrap bg-muted/50">
                            {m}
                          </TableHead>
                        ))}
                        <TableHead colSpan={3} className="min-w-[180px] px-2 py-2 font-semibold text-center bg-muted/50">
                          TOTAL:
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-muted/50 z-10" />
                        {MONTHS.map((m) => (
                          <React.Fragment key={m}>
                            <TableHead className="min-w-[64px] px-1 py-1.5 font-normal text-center text-xs">Budget</TableHead>
                            <TableHead className="min-w-[64px] px-1 py-1.5 font-normal text-center text-xs">Actual</TableHead>
                            <TableHead className="min-w-[56px] px-1 py-1.5 font-normal text-center text-xs">Over Budget</TableHead>
                          </React.Fragment>
                        ))}
                        <TableHead className="min-w-[64px] px-1 py-1.5 font-normal text-center text-xs">Budget</TableHead>
                        <TableHead className="min-w-[64px] px-1 py-1.5 font-normal text-center text-xs">Actual</TableHead>
                        <TableHead className="min-w-[56px] px-1 py-1.5 font-normal text-center text-xs">Over Budget</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={40} className="px-3 py-2 font-semibold sticky left-0 bg-muted/30">
                          Income:
                        </TableCell>
                      </TableRow>
                      {INCOME_CATEGORIES.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell className="px-3 py-1.5 font-medium text-sm whitespace-nowrap sticky left-0 bg-background">
                            {row.name}
                          </TableCell>
                          {MONTHS.map((_, colIndex) => {
                            const b = row.budget[colIndex] ?? 0
                            const a = row.actual[colIndex] ?? 0
                            const over = a - b
                            return (
                              <TableCell key={colIndex} className="p-0">
                                <div className="flex border-b border-r last:border-r-0">
                                  <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums">{formatNum(b)}</div>
                                  <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums border-l">{formatNum(a)}</div>
                                  <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">{formatNum(over)}</div>
                                </div>
                              </TableCell>
                            )
                          })}
                          <TableCell className="p-0 align-top">
                            <div className="flex border-b">
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-medium">{formatNum(sumArr(row.budget))}</div>
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-medium border-l">{formatNum(sumArr(row.actual))}</div>
                              <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums font-medium border-l bg-muted/30">{formatNum(sumArr(row.actual) - sumArr(row.budget))}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/40 font-medium">
                        <TableCell className="px-3 py-2 sticky left-0 bg-muted/40">Total :</TableCell>
                        {MONTHS.map((_, i) => (
                          <TableCell key={i} colSpan={3} className="p-0">
                            <div className="flex border-b">
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums">{formatNum(incomeTotals.budgetByMonth[i])}</div>
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums border-l">{formatNum(incomeTotals.actualByMonth[i])}</div>
                              <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">{formatNum(incomeTotals.actualByMonth[i] - incomeTotals.budgetByMonth[i])}</div>
                            </div>
                          </TableCell>
                        ))}
                        <TableCell colSpan={3} className="p-0">
                          <div className="flex">
                            <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold">{formatNum(incomeTotals.budgetTotal)}</div>
                            <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l">{formatNum(incomeTotals.actualTotal)}</div>
                            <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l bg-muted/30">{formatNum(incomeTotals.actualTotal - incomeTotals.budgetTotal)}</div>
                          </div>
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={40} className="px-3 py-2 font-semibold sticky left-0 bg-muted/30">
                          Expense :
                        </TableCell>
                      </TableRow>
                      {EXPENSE_CATEGORIES.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell className="px-3 py-1.5 font-medium text-sm whitespace-nowrap sticky left-0 bg-background">
                            {row.name}
                          </TableCell>
                          {MONTHS.map((_, colIndex) => {
                            const b = row.budget[colIndex] ?? 0
                            const a = row.actual[colIndex] ?? 0
                            const over = a - b
                            return (
                              <TableCell key={colIndex} className="p-0">
                                <div className="flex border-b border-r last:border-r-0">
                                  <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums">{formatNum(b)}</div>
                                  <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums border-l">{formatNum(a)}</div>
                                  <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">{formatNum(over)}</div>
                                </div>
                              </TableCell>
                            )
                          })}
                          <TableCell className="p-0 align-top">
                            <div className="flex border-b">
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-medium">{formatNum(sumArr(row.budget))}</div>
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-medium border-l">{formatNum(sumArr(row.actual))}</div>
                              <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums font-medium border-l bg-muted/30">{formatNum(sumArr(row.actual) - sumArr(row.budget))}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/40 font-medium">
                        <TableCell className="px-3 py-2 sticky left-0 bg-muted/40">Total :</TableCell>
                        {MONTHS.map((_, i) => (
                          <TableCell key={i} colSpan={3} className="p-0">
                            <div className="flex border-b">
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums">{formatNum(expenseTotals.budgetByMonth[i])}</div>
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums border-l">{formatNum(expenseTotals.actualByMonth[i])}</div>
                              <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">{formatNum(expenseTotals.actualByMonth[i] - expenseTotals.budgetByMonth[i])}</div>
                            </div>
                          </TableCell>
                        ))}
                        <TableCell colSpan={3} className="p-0">
                          <div className="flex">
                            <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold">{formatNum(expenseTotals.budgetTotal)}</div>
                            <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l">{formatNum(expenseTotals.actualTotal)}</div>
                            <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l bg-muted/30">{formatNum(expenseTotals.actualTotal - expenseTotals.budgetTotal)}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
