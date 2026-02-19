'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

const CARD_STYLE = 'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const PERIOD_LABELS: Record<string, string[]> = {
  Monthly: MONTHS,
  Quarterly: ['Q1', 'Q2', 'Q3', 'Q4'],
  'Half Yearly': ['H1', 'H2'],
  Yearly: ['Year'],
}

type CategoryRow = { name: string; budget: number[]; actual: number[] }

type StoredCategoryRow = { name: string; budget: (number | string)[]; actual: (number | string)[] }

type BudgetDetails = {
  incomeCategories?: StoredCategoryRow[]
  expenseCategories?: StoredCategoryRow[]
}

function sumArr(values: number[]): number {
  return values.reduce((s, v) => s + v, 0)
}

function getLabelsForPeriod(period: string | undefined | null): string[] {
  if (!period) return PERIOD_LABELS.Monthly
  return PERIOD_LABELS[period] ?? PERIOD_LABELS.Monthly
}

function formatNum(n: number) {
  return n === 0 ? '0' : new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(n)
}

export default function BudgetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : ''

  const [budgetInfo, setBudgetInfo] = useState<{ name: string; from: string; budgetPeriod: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [incomeCategories, setIncomeCategories] = useState<CategoryRow[]>([])
  const [expenseCategories, setExpenseCategories] = useState<CategoryRow[]>([])

  useEffect(() => {
    if (!id) {
      setLoadError(true)
      return
    }

    const loadBudget = async () => {
      try {
        setIsLoading(true)
        setLoadError(false)
        const res = await fetch(`/api/budgets?id=${encodeURIComponent(id)}`)
        const json = await res.json().catch(() => null)

        if (!res.ok || !json?.success || !json.data) {
          setLoadError(true)
          setBudgetInfo(null)
          return
        }

        setBudgetInfo({
          name: json.data.name,
          from: json.data.from,
          budgetPeriod: json.data.budgetPeriod,
        })

        const details: BudgetDetails | null = json.data.details ?? null
        if (details) {
          if (Array.isArray(details.incomeCategories)) {
            setIncomeCategories(
              details.incomeCategories.map((r) => ({
                name: r.name,
                budget: (r.budget || []).map((v) => (typeof v === 'number' ? v : Number(v) || 0)),
                actual: (r.actual || []).map((v) => (typeof v === 'number' ? v : Number(v) || 0)),
              }))
            )
          }
          if (Array.isArray(details.expenseCategories)) {
            setExpenseCategories(
              details.expenseCategories.map((r) => ({
                name: r.name,
                budget: (r.budget || []).map((v) => (typeof v === 'number' ? v : Number(v) || 0)),
                actual: (r.actual || []).map((v) => (typeof v === 'number' ? v : Number(v) || 0)),
              }))
            )
          }
        }
      } catch {
        setLoadError(true)
        setBudgetInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadBudget()
  }, [id])

  const periodLabels = useMemo(
    () => getLabelsForPeriod(budgetInfo?.budgetPeriod),
    [budgetInfo?.budgetPeriod]
  )

  const incomeTotals = useMemo(
    () => ({
      budgetByMonth: periodLabels.map((_, i) =>
        incomeCategories.reduce((s, r) => s + (r.budget[i] ?? 0), 0)
      ),
      actualByMonth: periodLabels.map((_, i) =>
        incomeCategories.reduce((s, r) => s + (r.actual[i] ?? 0), 0)
      ),
      budgetTotal: incomeCategories.reduce((s, r) => s + sumArr(r.budget), 0),
      actualTotal: incomeCategories.reduce((s, r) => s + sumArr(r.actual), 0),
    }),
    [incomeCategories, periodLabels]
  )
  const expenseTotals = useMemo(
    () => ({
      budgetByMonth: periodLabels.map((_, i) =>
        expenseCategories.reduce((s, r) => s + (r.budget[i] ?? 0), 0)
      ),
      actualByMonth: periodLabels.map((_, i) =>
        expenseCategories.reduce((s, r) => s + (r.actual[i] ?? 0), 0)
      ),
      budgetTotal: expenseCategories.reduce((s, r) => s + sumArr(r.budget), 0),
      actualTotal: expenseCategories.reduce((s, r) => s + sumArr(r.actual), 0),
    }),
    [expenseCategories, periodLabels]
  )

  if (!id || loadError || (!isLoading && !budgetInfo)) {
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
                          <BreadcrumbPage>{budgetInfo?.name || 'Budget Plan'}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                    <h4 className="mt-2 text-xl font-semibold">
                      {budgetInfo?.name || 'Budget Plan'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-none h-7"
                      onClick={() => router.push('/accounting/budget')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
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
                    <p className="text-sm font-medium">{budgetInfo?.name ?? '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">From (Year)</p>
                    <p className="text-sm font-medium">{budgetInfo?.from ?? '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Budget Period</p>
                    <p className="text-sm font-medium">{budgetInfo?.budgetPeriod ?? '-'}</p>
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
                        {periodLabels.map((m) => (
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
                        {periodLabels.map((m) => (
                          <React.Fragment key={m}>
                            <TableHead className="min-w-[112px] px-1 py-1.5 font-normal text-center text-xs">Budget</TableHead>
                            <TableHead className="min-w-[112px] px-1 py-1.5 font-normal text-center text-xs">Actual</TableHead>
                            <TableHead className="min-w-[96px] px-1 py-1.5 font-normal text-center text-xs">Over Budget</TableHead>
                          </React.Fragment>
                        ))}
                        <TableHead className="min-w-[112px] px-1 py-1.5 font-normal text-center text-xs">Budget</TableHead>
                        <TableHead className="min-w-[112px] px-1 py-1.5 font-normal text-center text-xs">Actual</TableHead>
                        <TableHead className="min-w-[96px] px-1 py-1.5 font-normal text-center text-xs">Over Budget</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={40} className="px-3 py-2 font-semibold sticky left-0 bg-muted/30">
                          Income:
                        </TableCell>
                      </TableRow>
                      {incomeCategories.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell className="px-3 py-1.5 font-medium text-sm whitespace-nowrap sticky left-0 bg-background">
                            {row.name}
                          </TableCell>
                          {periodLabels.map((_, colIndex) => {
                            const b = row.budget[colIndex] ?? 0
                            const a = row.actual[colIndex] ?? 0
                            const over = a - b
                            return (
                              <TableCell key={colIndex} className="p-0">
                                <div className="flex border-b border-r last:border-r-0">
                                  <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums">{formatNum(b)}</div>
                                  <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums border-l">{formatNum(a)}</div>
                                  <div className="flex-1 min-w-[96px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">{formatNum(over)}</div>
                                </div>
                              </TableCell>
                            )
                          })}
                          <TableCell className="p-0 align-top">
                            <div className="flex border-b">
                            <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums font-medium">{formatNum(sumArr(row.budget))}</div>
                            <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums font-medium border-l">{formatNum(sumArr(row.actual))}</div>
                            <div className="flex-1 min-w-[96px] px-1 py-1.5 text-right text-xs tabular-nums font-medium border-l bg-muted/30">{formatNum(sumArr(row.actual) - sumArr(row.budget))}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/40 font-medium">
                        <TableCell className="px-3 py-2 sticky left-0 bg-muted/40">Total :</TableCell>
                        {periodLabels.map((_, i) => (
                          <TableCell key={i} colSpan={3} className="p-0">
                            <div className="flex border-b">
                              <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums">{formatNum(incomeTotals.budgetByMonth[i])}</div>
                              <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums border-l">{formatNum(incomeTotals.actualByMonth[i])}</div>
                              <div className="flex-1 min-w-[96px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">{formatNum(incomeTotals.actualByMonth[i] - incomeTotals.budgetByMonth[i])}</div>
                            </div>
                          </TableCell>
                        ))}
                        <TableCell colSpan={3} className="p-0">
                          <div className="flex">
                            <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold">{formatNum(incomeTotals.budgetTotal)}</div>
                            <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l">{formatNum(incomeTotals.actualTotal)}</div>
                            <div className="flex-1 min-w-[96px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l bg-muted/30">{formatNum(incomeTotals.actualTotal - incomeTotals.budgetTotal)}</div>
                          </div>
                        </TableCell>
                      </TableRow>

                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={40} className="px-3 py-2 font-semibold sticky left-0 bg-muted/30">
                          Expense :
                        </TableCell>
                      </TableRow>
                      {expenseCategories.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell className="px-3 py-1.5 font-medium text-sm whitespace-nowrap sticky left-0 bg-background">
                            {row.name}
                          </TableCell>
                          {periodLabels.map((_, colIndex) => {
                            const b = row.budget[colIndex] ?? 0
                            const a = row.actual[colIndex] ?? 0
                            const over = a - b
                            return (
                              <TableCell key={colIndex} className="p-0">
                                <div className="flex border-b border-r last:border-r-0">
                                  <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums">{formatNum(b)}</div>
                                  <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums border-l">{formatNum(a)}</div>
                                  <div className="flex-1 min-w-[96px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">{formatNum(over)}</div>
                                </div>
                              </TableCell>
                            )
                          })}
                          <TableCell className="p-0 align-top">
                            <div className="flex border-b">
                              <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums font-medium">{formatNum(sumArr(row.budget))}</div>
                              <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums font-medium border-l">{formatNum(sumArr(row.actual))}</div>
                              <div className="flex-1 min-w-[96px] px-1 py-1.5 text-right text-xs tabular-nums font-medium border-l bg-muted/30">{formatNum(sumArr(row.actual) - sumArr(row.budget))}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/40 font-medium">
                        <TableCell className="px-3 py-2 sticky left-0 bg-muted/40">Total :</TableCell>
                        {periodLabels.map((_, i) => (
                          <TableCell key={i} colSpan={3} className="p-0">
                            <div className="flex border-b">
                              <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums">{formatNum(expenseTotals.budgetByMonth[i])}</div>
                              <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums border-l">{formatNum(expenseTotals.actualByMonth[i])}</div>
                              <div className="flex-1 min-w-[96px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">{formatNum(expenseTotals.actualByMonth[i] - expenseTotals.budgetByMonth[i])}</div>
                            </div>
                          </TableCell>
                        ))}
                        <TableCell colSpan={3} className="p-0">
                          <div className="flex">
                            <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold">{formatNum(expenseTotals.budgetTotal)}</div>
                            <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l">{formatNum(expenseTotals.actualTotal)}</div>
                            <div className="flex-1 min-w-[96px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l bg-muted/30">{formatNum(expenseTotals.actualTotal - expenseTotals.budgetTotal)}</div>
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
