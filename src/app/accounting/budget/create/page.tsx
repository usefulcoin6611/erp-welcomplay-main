'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'
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

function getLabelsForPeriod(period: string): string[] {
  return PERIOD_LABELS[period] ?? PERIOD_LABELS.Monthly
}

function createDefaultIncomeCategories(size: number): CategoryRow[] {
  const blanks = Array(size).fill('')
  return [
    { name: 'Maintenance Sales', budget: blanks.slice(), actual: blanks.slice() },
    { name: 'Product Sales', budget: blanks.slice(), actual: blanks.slice() },
    { name: 'Other Income', budget: blanks.slice(), actual: blanks.slice() },
  ]
}

function createDefaultExpenseCategories(size: number): CategoryRow[] {
  const blanks = Array(size).fill('')
  return [
    { name: 'Rent Or Lease', budget: blanks.slice(), actual: blanks.slice() },
    { name: 'Travel', budget: blanks.slice(), actual: blanks.slice() },
  ]
}

function sumArr(values: string[]): number {
  return values.reduce((s, v) => s + (Number(v) || 0), 0)
}

export default function BudgetCreatePage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    budgetPeriod: '',
    from: '',
  })
  const [incomeCategories, setIncomeCategories] = useState<CategoryRow[]>(() =>
    createDefaultIncomeCategories(MONTHS.length)
  )
  const [expenseCategories, setExpenseCategories] = useState<CategoryRow[]>(() =>
    createDefaultExpenseCategories(MONTHS.length)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isFormValid =
    form.name.trim().length > 0 &&
    form.budgetPeriod.trim().length > 0 &&
    /^[0-9]{4}$/.test(form.from.trim())

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

  const currentLabels = getLabelsForPeriod(form.budgetPeriod || 'Monthly')

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

  const formatNum = (n: number) =>
    n === 0 ? '0' : new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(n)

  const renderCategoryRows = (
    rows: CategoryRow[],
    type: 'income' | 'expense'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        from: form.from.trim(),
        budgetPeriod: form.budgetPeriod,
        details: {
          incomeCategories,
          expenseCategories,
        },
      }

      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || 'Gagal membuat budget plan')
        return
      }

      toast.success('Budget plan berhasil dibuat')
      router.push('/accounting/budget')
    } catch (error) {
      toast.error('Terjadi kesalahan saat membuat budget plan')
    } finally {
      setIsSubmitting(false)
    }
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
                          <BreadcrumbPage>Budget Create</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                    <h4 className="mt-2 text-xl font-semibold">Create Budget Planner</h4>
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
                    <Input
                      id="name"
                      placeholder="Enter Name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from">From (Year)</Label>
                    <Input
                      id="from"
                      type="number"
                      inputMode="numeric"
                      min={1900}
                      max={2100}
                      placeholder="YYYY"
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
                    <Select
                      value={form.budgetPeriod}
                      onValueChange={(value) => setForm((f) => ({ ...f, budgetPeriod: value }))}
                    >
                      <SelectTrigger id="period" className="h-9">
                        <SelectValue placeholder="Select Period" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIOD_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={CARD_STYLE}>
              <CardHeader className="px-6">
                <CardTitle className="text-base font-medium">
                  Income & Expense by Category (Budget, Actual, Over Budget)
                </CardTitle>
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
                          {currentLabels.map((m) => (
                            <TableHead
                              key={m}
                              colSpan={3}
                              className="px-0 py-2 font-medium text-center text-xs whitespace-nowrap bg-muted/50"
                            >
                              {m}
                            </TableHead>
                          ))}
                          <TableHead
                            colSpan={3}
                            className="min-w-[180px] px-2 py-2 font-semibold text-center bg-muted/50"
                          >
                            TOTAL:
                          </TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-muted/50 z-10" />
                          {currentLabels.map((m) => (
                            <React.Fragment key={m}>
                              <TableHead className="min-w-[64px] px-1 py-1.5 font-normal text-center text-xs">
                                Budget
                              </TableHead>
                              <TableHead className="min-w-[64px] px-1 py-1.5 font-normal text-center text-xs">
                                Actual
                              </TableHead>
                              <TableHead className="min-w-[56px] px-1 py-1.5 font-normal text-center text-xs">
                                Over Budget
                              </TableHead>
                            </React.Fragment>
                          ))}
                          <TableHead className="min-w-[64px] px-1 py-1.5 font-normal text-center text-xs">
                            Budget
                          </TableHead>
                          <TableHead className="min-w-[64px] px-1 py-1.5 font-normal text-center text-xs">
                            Actual
                          </TableHead>
                          <TableHead className="min-w-[56px] px-1 py-1.5 font-normal text-center text-xs">
                            Over Budget
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-muted/30">
                          <TableCell
                            colSpan={40}
                            className="px-3 py-2 font-semibold sticky left-0 bg-muted/30"
                          >
                            Income:
                          </TableCell>
                        </TableRow>
                        {renderCategoryRows(incomeCategories, 'income')}
                        <TableRow className="bg-muted/40 font-medium">
                          <TableCell className="px-3 py-2 sticky left-0 bg-muted/40">
                            Total :
                          </TableCell>
                          {currentLabels.map((_, i) => (
                            <TableCell key={i} colSpan={3} className="p-0">
                              <div className="flex border-b">
                                <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums">
                                  {formatNum(incomeTotals.budgetByMonth[i])}
                                </div>
                                <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums border-l">
                                  {formatNum(incomeTotals.actualByMonth[i])}
                                </div>
                                <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">
                                  {formatNum(
                                    incomeTotals.actualByMonth[i] - incomeTotals.budgetByMonth[i]
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          ))}
                          <TableCell colSpan={3} className="p-0">
                            <div className="flex">
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold">
                                {formatNum(incomeTotals.budgetTotal)}
                              </div>
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l">
                                {formatNum(incomeTotals.actualTotal)}
                              </div>
                              <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l bg-muted/30">
                                {formatNum(incomeTotals.actualTotal - incomeTotals.budgetTotal)}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/30">
                          <TableCell
                            colSpan={40}
                            className="px-3 py-2 font-semibold sticky left-0 bg-muted/30"
                          >
                            Expense :
                          </TableCell>
                        </TableRow>
                        {renderCategoryRows(expenseCategories, 'expense')}
                        <TableRow className="bg-muted/40 font-medium">
                          <TableCell className="px-3 py-2 sticky left-0 bg-muted/40">
                            Total :
                          </TableCell>
                          {currentLabels.map((_, i) => (
                            <TableCell key={i} colSpan={3} className="p-0">
                              <div className="flex border-b">
                                <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums">
                                  {formatNum(expenseTotals.budgetByMonth[i])}
                                </div>
                                <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums border-l">
                                  {formatNum(expenseTotals.actualByMonth[i])}
                                </div>
                                <div className="flex-1 min-w-[56px] px-1 py-1.5 text-right text-xs tabular-nums border-l bg-muted/30">
                                  {formatNum(
                                    expenseTotals.actualByMonth[i] - expenseTotals.budgetByMonth[i]
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          ))}
                          <TableCell colSpan={3} className="p-0">
                            <div className="flex">
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold">
                                {formatNum(expenseTotals.budgetTotal)}
                              </div>
                              <div className="flex-1 min-w-[64px] px-1 py-1.5 text-right text-xs tabular-nums font-semibold border-l">
                                {formatNum(expenseTotals.actualTotal)}
                              </div>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shadow-none"
                      asChild
                    >
                      <Link href="/accounting/budget">Cancel</Link>
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      variant="blue"
                      className="shadow-none"
                      disabled={!isFormValid || isSubmitting}
                    >
                      Create
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
