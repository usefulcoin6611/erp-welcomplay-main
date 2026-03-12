'use client'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { ArrowLeft } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

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

const PERIOD_OPTIONS = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Half Yearly', label: 'Half Yearly' },
  { value: 'Yearly', label: 'Yearly' },
]

const PERIOD_LABELS: Record<string, string[]> = {
  Monthly: MONTHS,
  Quarterly: ['Q1', 'Q2', 'Q3', 'Q4'],
  'Half Yearly': ['H1', 'H2'],
  Yearly: ['Year'],
}

type CategoryRow = { name: string; budget: string[]; actual: string[] }

type BudgetDetails = {
  incomeCategories?: CategoryRow[]
  expenseCategories?: CategoryRow[]
}

function getLabelsForPeriod(period: string): string[] {
  return PERIOD_LABELS[period] ?? PERIOD_LABELS.Monthly
}

function normalizeArray(values: string[], size: number): string[] {
  const result = values.slice(0, size)
  while (result.length < size) {
    result.push('0')
  }
  return result
}

function createDefaultIncomeCategories(size: number): CategoryRow[] {
  const baseBudget = '150000000'
  const baseActual = '145000000'
  const zeros = Array(size).fill('0')
  const budgetArr = zeros.map((_, index) =>
    index === 0 ? baseBudget : '0'
  )
  const actualArr = zeros.map((_, index) =>
    index === 0 ? baseActual : '0'
  )
  return [
    { name: 'Maintenance Sales', budget: budgetArr, actual: actualArr },
    { name: 'Product Sales', budget: zeros.slice(), actual: zeros.slice() },
    { name: 'Other Income', budget: zeros.slice(), actual: zeros.slice() },
  ]
}

function createDefaultExpenseCategories(size: number): CategoryRow[] {
  const rentBudget = '25000000'
  const rentActual = '24500000'
  const travelBudget = '10000000'
  const travelActual = '9500000'
  const zeros = Array(size).fill('0')
  const rentBudgetArr = zeros.map((_, index) =>
    index === 0 ? rentBudget : '0'
  )
  const rentActualArr = zeros.map((_, index) =>
    index === 0 ? rentActual : '0'
  )
  const travelBudgetArr = zeros.map((_, index) =>
    index === 1 ? travelBudget : '0'
  )
  const travelActualArr = zeros.map((_, index) =>
    index === 1 ? travelActual : '0'
  )
  return [
    { name: 'Rent Or Lease', budget: rentBudgetArr, actual: rentActualArr },
    { name: 'Travel', budget: travelBudgetArr, actual: travelActualArr },
  ]
}

function sumArr(values: string[]): number {
  return values.reduce((s, v) => s + (Number(v) || 0), 0)
}

function overBudget(actual: string, budget: string): number {
  return (Number(actual) || 0) - (Number(budget) || 0)
}

export default function BudgetEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : ''

  const [form, setForm] = useState({
    name: 'Yearly Budget Plan',
    from: '2025',
    budgetPeriod: 'Yearly',
  })

  const [incomeCategories, setIncomeCategories] = useState<CategoryRow[]>(() =>
    createDefaultIncomeCategories(MONTHS.length)
  )
  const [expenseCategories, setExpenseCategories] = useState<CategoryRow[]>(() =>
    createDefaultExpenseCategories(MONTHS.length)
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateCategoryValue = (
    type: 'income' | 'expense',
    rowIndex: number,
    colIndex: number,
    field: 'budget' | 'actual',
    value: string
  ) => {
    if (type === 'income') {
      setIncomeCategories((prev) =>
        prev.map((row, i) =>
          i === rowIndex
            ? { ...row, [field]: row[field].map((v, j) => (j === colIndex ? value : v)) }
            : row
        )
      )
    } else {
      setExpenseCategories((prev) =>
        prev.map((row, i) =>
          i === rowIndex
            ? { ...row, [field]: row[field].map((v, j) => (j === colIndex ? value : v)) }
            : row
        )
      )
    }
  }

  const currentLabels = getLabelsForPeriod(form.budgetPeriod)

  const incomeTotals = useMemo(
    () => ({
      budgetByMonth: currentLabels.map((_, i) =>
        incomeCategories.reduce((s, r) => s + (Number(r.budget[i]) || 0), 0)
      ),
      actualByMonth: currentLabels.map((_, i) =>
        incomeCategories.reduce((s, r) => s + (Number(r.actual[i]) || 0), 0)
      ),
      budgetTotal: incomeCategories.reduce((s, r) => s + sumArr(r.budget), 0),
      actualTotal: incomeCategories.reduce((s, r) => s + sumArr(r.actual), 0),
    }),
    [incomeCategories, currentLabels]
  )

  const expenseTotals = useMemo(
    () => ({
      budgetByMonth: currentLabels.map((_, i) =>
        expenseCategories.reduce((s, r) => s + (Number(r.budget[i]) || 0), 0)
      ),
      actualByMonth: currentLabels.map((_, i) =>
        expenseCategories.reduce((s, r) => s + (Number(r.actual[i]) || 0), 0)
      ),
      budgetTotal: expenseCategories.reduce((s, r) => s + sumArr(r.budget), 0),
      actualTotal: expenseCategories.reduce((s, r) => s + sumArr(r.actual), 0),
    }),
    [expenseCategories, currentLabels]
  )

  useEffect(() => {
    if (!id) {
      toast.error('Budget plan tidak ditemukan')
      router.push('/accounting/budget')
      return
    }

    const loadBudget = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/budgets?id=${encodeURIComponent(id)}`)
        const json = await res.json().catch(() => null)

        if (!res.ok || !json?.success || !json.data) {
          toast.error(json?.message || 'Gagal memuat budget plan')
          return
        }

        const period = json.data.budgetPeriod || ''

        setForm({
          name: json.data.name || '',
          from: json.data.from || '',
          budgetPeriod: period || 'Monthly',
        })

        const labels = getLabelsForPeriod(period || 'Monthly')
        const size = labels.length

        const details: BudgetDetails | null = json.data.details ?? null
        if (details && Array.isArray(details.incomeCategories) && details.incomeCategories.length > 0) {
          setIncomeCategories(
            details.incomeCategories.map((row) => ({
              name: row.name,
              budget: normalizeArray(row.budget, size),
              actual: normalizeArray(row.actual, size),
            }))
          )
        } else {
          setIncomeCategories(createDefaultIncomeCategories(size))
        }

        if (details && Array.isArray(details.expenseCategories) && details.expenseCategories.length > 0) {
          setExpenseCategories(
            details.expenseCategories.map((row) => ({
              name: row.name,
              budget: normalizeArray(row.budget, size),
              actual: normalizeArray(row.actual, size),
            }))
          )
        } else {
          setExpenseCategories(createDefaultExpenseCategories(size))
        }
      } catch (error) {
        toast.error('Terjadi kesalahan saat memuat budget plan')
      } finally {
        setIsLoading(false)
      }
    }

    loadBudget()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/budgets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          name: form.name,
          from: form.from,
          budgetPeriod: form.budgetPeriod,
          details: {
            incomeCategories,
            expenseCategories,
          },
        }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || 'Gagal memperbarui budget plan')
        return
      }

      toast.success('Budget plan updated.')
      router.push(`/accounting/budget/${id}`)
    } catch (error) {
      toast.error('Terjadi kesalahan saat memperbarui budget plan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatNum = (n: number) =>
    n === 0 ? '0' : new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(n)

  const renderCategoryRows = (
    rows: CategoryRow[],
    type: 'income' | 'expense',
    rowOffset: number
  ) =>
    rows.map((row, rowIndex) => (
      <TableRow key={row.name}>
        <TableCell className="px-3 py-1.5 font-medium text-sm whitespace-nowrap sticky left-0 bg-background">
          {row.name}
        </TableCell>
        {currentLabels.map((_, colIndex) => {
          const b = Number(row.budget[colIndex]) || 0
          const a = Number(row.actual[colIndex]) || 0
          const over = a - b
          return (
            <TableCell key={colIndex} className="p-0">
              <div className="flex border-b border-r last:border-r-0">
                <div className="flex-1 min-w-[112px] px-1 py-1">
                  <Input
                    type="number"
                    value={row.budget[colIndex]}
                    onChange={(e) => updateCategoryValue(type, rowIndex, colIndex, 'budget', e.target.value)}
                    className="h-7 w-full text-right text-xs"
                  />
                </div>
                <div className="flex-1 min-w-[112px] px-1 py-1 border-l">
                  <Input
                    type="number"
                    value={row.actual[colIndex]}
                    onChange={(e) => updateCategoryValue(type, rowIndex, colIndex, 'actual', e.target.value)}
                    className="h-7 w-full text-right text-xs"
                  />
                </div>
                <div className="flex-1 min-w-[96px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">
                  {formatNum(over)}
                </div>
              </div>
            </TableCell>
          )
        })}
        <TableCell className="p-0 align-top">
          <div className="flex border-b">
            <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums font-medium">
              {formatNum(sumArr(row.budget))}
            </div>
            <div className="flex-1 min-w-[112px] px-1 py-1.5 text-right text-xs tabular-nums font-medium border-l">
              {formatNum(sumArr(row.actual))}
            </div>
            <div className="flex-1 min-w-[96px] px-1 py-1.5 text-right text-xs tabular-nums font-medium border-l bg-muted/30">
              {formatNum(sumArr(row.actual) - sumArr(row.budget))}
            </div>
          </div>
        </TableCell>
      </TableRow>
    ))

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
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
                          <BreadcrumbPage>Edit Budget</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                    <h4 className="mt-2 text-xl font-semibold">Edit Budget Plan</h4>
                  </div>
                  <Button variant="outline" size="sm" className="shadow-none h-7" asChild>
                    <Link href="/accounting/budget">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={CARD_STYLE}>
              <CardHeader className="px-6">
                <CardTitle className="text-base font-medium">Budget Information</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from">From (Year)</Label>
                    <Input
                      id="from"
                      type="number"
                      inputMode="numeric"
                      min={1900}
                      max={2100}
                      value={form.from}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setForm((f) => ({ ...f, from: raw }))
                      }}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">Budget Period</Label>
                    <Select value={form.budgetPeriod} onValueChange={(v) => setForm((f) => ({ ...f, budgetPeriod: v }))}>
                      <SelectTrigger id="period" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIOD_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={CARD_STYLE}>
              <CardHeader className="px-6">
                <CardTitle className="text-base font-medium">Income & Expense by Category (Budget, Actual, Over Budget)</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        {renderCategoryRows(incomeCategories, 'income', 0)}
                        <TableRow className="bg-muted/40 font-medium">
                          <TableCell className="px-3 py-2 sticky left-0 bg-muted/40">Total :</TableCell>
                          {MONTHS.map((_, i) => (
                            <TableCell key={i} colSpan={3} className="p-0">
                              <div className="flex border-b">
                                <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums">{formatNum(incomeTotals.budgetByMonth[i])}</div>
                                <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums border-l">{formatNum(incomeTotals.actualByMonth[i])}</div>
                                <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">
                                  {formatNum(incomeTotals.actualByMonth[i] - incomeTotals.budgetByMonth[i])}
                                </div>
                              </div>
                            </TableCell>
                          ))}
                          <TableCell colSpan={3} className="p-0">
                            <div className="flex">
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold">{formatNum(incomeTotals.budgetTotal)}</div>
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l">{formatNum(incomeTotals.actualTotal)}</div>
                              <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l bg-muted/30">
                                {formatNum(incomeTotals.actualTotal - incomeTotals.budgetTotal)}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={40} className="px-3 py-2 font-semibold sticky left-0 bg-muted/30">
                            Expense :
                          </TableCell>
                        </TableRow>
                        {renderCategoryRows(expenseCategories, 'expense', incomeCategories.length)}
                        <TableRow className="bg-muted/40 font-medium">
                          <TableCell className="px-3 py-2 sticky left-0 bg-muted/40">Total :</TableCell>
                          {MONTHS.map((_, i) => (
                            <TableCell key={i} colSpan={3} className="p-0">
                              <div className="flex border-b">
                                <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums">{formatNum(expenseTotals.budgetByMonth[i])}</div>
                                <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums border-l">{formatNum(expenseTotals.actualByMonth[i])}</div>
                                <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">
                                  {formatNum(expenseTotals.actualByMonth[i] - expenseTotals.budgetByMonth[i])}
                                </div>
                              </div>
                            </TableCell>
                          ))}
                          <TableCell colSpan={3} className="p-0">
                            <div className="flex">
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold">{formatNum(expenseTotals.budgetTotal)}</div>
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l">{formatNum(expenseTotals.actualTotal)}</div>
                              <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l bg-muted/30">
                                {formatNum(expenseTotals.actualTotal - expenseTotals.budgetTotal)}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-4">
                    <Button type="button" variant="outline" size="sm" className="shadow-none" asChild>
                      <Link href={id ? `/accounting/budget/${id}` : '/accounting/budget'}>Cancel</Link>
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      variant="blue"
                      className="shadow-none"
                      disabled={isSubmitting || isLoading}
                    >
                      Update
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
