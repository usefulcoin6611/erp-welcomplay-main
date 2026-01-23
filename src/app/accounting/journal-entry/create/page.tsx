'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'

type JournalLine = {
  id: string
  accountId: string
  debit: number
  credit: number
  description: string
}

const mockChartAccounts = [
  { id: '1000', name: 'Cash & Bank' },
  { id: '1100', name: 'Accounts Receivable' },
  { id: '2000', name: 'Accounts Payable' },
  { id: '4000', name: 'Sales Revenue' },
  { id: '6000', name: 'Operating Expenses' },
]

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function JournalEntryCreatePage() {
  const journalNumber = useMemo(() => `JR-${new Date().getFullYear()}-001`, [])

  const [header, setHeader] = useState({
    date: '',
    reference: '',
    description: '',
  })

  const [lines, setLines] = useState<JournalLine[]>([
    { id: 'row-1', accountId: '', debit: 0, credit: 0, description: '' },
  ])

  const totals = useMemo(() => {
    const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
    const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
    return { totalDebit, totalCredit, balanced: totalDebit === totalCredit }
  }, [lines])

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: `row-${prev.length + 1}`, accountId: '', debit: 0, credit: 0, description: '' },
    ])
  }

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.id !== id)))
  }

  const updateLine = (id: string, patch: Partial<JournalLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Create Journal Entry:', { header, lines })
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Journal Entry Create</h1>
              </div>
              <Button asChild variant="outline" size="sm" className="shadow-none h-7">
                <Link href="/accounting/double-entry?tab=journal-entry">Back</Link>
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 space-y-2">
                      <Label>Journal Number</Label>
                      <Input value={journalNumber} readOnly className="h-9 bg-gray-50" />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <Label htmlFor="date">
                        Transaction Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={header.date}
                        onChange={(e) => setHeader({ ...header, date: e.target.value })}
                        className="h-9"
                        required
                      />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="reference"
                        value={header.reference}
                        onChange={(e) => setHeader({ ...header, reference: e.target.value })}
                        placeholder="Enter Reference"
                        className="h-9"
                      />
                    </div>
                    <div className="md:col-span-12 space-y-2">
                      <Label htmlFor="desc">Description</Label>
                      <Textarea
                        id="desc"
                        value={header.description}
                        onChange={(e) => setHeader({ ...header, description: e.target.value })}
                        placeholder="Enter Description"
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Accounts</div>
                <Button type="button" variant="blue" size="sm" className="shadow-none h-7" onClick={addLine}>
                  <Plus className="h-3 w-3" /> Add Accounts
                </Button>
              </div>

              <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <Table className="w-full min-w-full table-auto">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-4 py-3 min-w-[220px]">Account *</TableHead>
                          <TableHead className="px-4 py-3 min-w-[140px]">Debit *</TableHead>
                          <TableHead className="px-4 py-3 min-w-[140px]">Credit *</TableHead>
                          <TableHead className="px-4 py-3 min-w-[220px]">Description</TableHead>
                          <TableHead className="px-4 py-3 min-w-[140px] text-right">Amount</TableHead>
                          <TableHead className="px-4 py-3 w-[60px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lines.map((line) => {
                          const amount = (Number(line.debit) || 0) || (Number(line.credit) || 0)
                          return (
                            <TableRow key={line.id}>
                              <TableCell className="px-4 py-3">
                                <Select
                                  value={line.accountId}
                                  onValueChange={(value) => updateLine(line.id, { accountId: value })}
                                  required
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select Chart of Account" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockChartAccounts.map((a) => (
                                      <SelectItem key={a.id} value={a.id}>
                                        {a.id} - {a.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Input
                                  className="h-9"
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={line.debit}
                                  onChange={(e) => updateLine(line.id, { debit: Number(e.target.value || 0), credit: 0 })}
                                  required
                                />
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Input
                                  className="h-9"
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={line.credit}
                                  onChange={(e) => updateLine(line.id, { credit: Number(e.target.value || 0), debit: 0 })}
                                  required
                                />
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Input
                                  className="h-9"
                                  value={line.description}
                                  onChange={(e) => updateLine(line.id, { description: e.target.value })}
                                  placeholder="Description"
                                />
                              </TableCell>
                              <TableCell className="px-4 py-3 text-right font-medium">
                                {formatPrice(amount)}
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  title="Delete"
                                  onClick={() => removeLine(line.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="p-4 border-t grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Debit</span>
                      <span className="font-medium">{formatPrice(totals.totalDebit)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Credit</span>
                      <span className="font-medium">{formatPrice(totals.totalCredit)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 mt-2">
                      <span className="font-semibold">Balanced</span>
                      <span className={totals.balanced ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                        {totals.balanced ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-2">
                <Button asChild type="button" variant="outline" size="sm" className="shadow-none h-7">
                  <Link href="/accounting/double-entry?tab=journal-entry">Cancel</Link>
                </Button>
                <Button type="submit" variant="blue" size="sm" className="shadow-none h-7" disabled={!totals.balanced}>
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


