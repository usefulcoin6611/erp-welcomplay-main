'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ExpenseCreatePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id ?? ''
  const isEdit = id && id !== '0'

  const categories = [
    { id: '1', name: 'Office Supplies' },
    { id: '2', name: 'Travel' },
    { id: '3', name: 'Utilities' },
    { id: '4', name: 'Marketing' },
  ]

  const mockExpenses = [
    {
      id: 'EXP-2025-001',
      date: '2025-11-05',
      categoryId: '1',
      amount: 1250000,
      reference: 'REF-EXP-001',
      description: 'Office supplies purchase',
      receipt: 'receipt_exp_001.pdf',
    },
    {
      id: 'EXP-2025-002',
      date: '2025-11-04',
      categoryId: '2',
      amount: 875000,
      reference: 'REF-EXP-002',
      description: 'Travel reimbursement',
      receipt: '',
    },
  ]

  const initial = useMemo(() => {
    if (!isEdit) return null
    return mockExpenses.find((e) => e.id === id) ?? null
  }, [id, isEdit])

  const [form, setForm] = useState({
    date: '',
    categoryId: '',
    amount: '',
    reference: '',
    description: '',
    receiptName: '',
  })

  useEffect(() => {
    if (isEdit && initial) {
      setForm({
        date: initial.date,
        categoryId: initial.categoryId,
        amount: String(initial.amount),
        reference: initial.reference,
        description: initial.description,
        receiptName: initial.receipt,
      })
      return
    }
    setForm({
      date: '',
      categoryId: '',
      amount: '',
      reference: '',
      description: '',
      receiptName: '',
    })
  }, [isEdit, initial])

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
                <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Expense' : 'Create Expense'}</h1>
                <p className="text-sm text-muted-foreground">
                  {isEdit ? `Update expense ${id}` : 'Create a new expense record.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="shadow-none h-7">
                  <Link href="/accounting/purchases?tab=expense">Back</Link>
                </Button>
              </div>
            </div>

            <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Expense Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                {isEdit && !initial ? (
                  <div className="text-sm text-muted-foreground">
                    Expense <span className="font-medium">{id}</span> not found (mock). You can still edit fields and save.
                  </div>
                ) : null}

                <form
                  className="grid gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    console.log('Submit expense:', { id, ...form })
                    router.push('/accounting/purchases?tab=expense')
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        className="h-9"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={form.categoryId}
                        onValueChange={(value) => setForm({ ...form, categoryId: value })}
                        required
                      >
                        <SelectTrigger id="category" className="h-9 w-full">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        className="h-9"
                        placeholder="Enter Amount"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="reference"
                        className="h-9"
                        placeholder="Enter Reference"
                        value={form.reference}
                        onChange={(e) => setForm({ ...form, reference: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter Description"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="receipt">Payment Receipt</Label>
                      <Input
                        id="receipt"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          setForm({ ...form, receiptName: e.target.files?.[0]?.name ?? '' })
                        }
                      />
                      {form.receiptName ? (
                        <p className="text-xs text-muted-foreground">Selected: {form.receiptName}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shadow-none h-7"
                      onClick={() => router.push('/accounting/purchases?tab=expense')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="blue" size="sm" className="shadow-none h-7 px-4">
                      {isEdit ? 'Update Expense' : 'Create Expense'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


