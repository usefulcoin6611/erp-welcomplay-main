'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

type ExpenseFormState = {
  date: string
  type: string
  party: string
  category: string
  amount: string
  reference: string
  description: string
  receiptName: string
}

export default function ExpenseCreatePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id ?? ''
  const isEdit = id && id !== '0'

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ExpenseFormState>({
    date: '',
    type: 'Vendor',
    party: '',
    category: '',
    amount: '',
    reference: '',
    description: '',
    receiptName: '',
  })

  useEffect(() => {
    if (!isEdit) {
      setForm({
        date: '',
        type: 'Vendor',
        party: '',
        category: '',
        amount: '',
        reference: '',
        description: '',
        receiptName: '',
      })
      return
    }

    const loadExpense = async () => {
      try {
        const res = await fetch(`/api/expenses/${id}`, { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        if (!json?.success || !json.data) return
        const e = json.data as any
        setForm({
          date: new Date(e.date).toISOString().slice(0, 10),
          type: e.type ?? 'Vendor',
          party: e.party ?? '',
          category: e.category ?? '',
          amount: String(e.total ?? ''),
          reference: e.reference ?? '',
          description: e.description ?? '',
          receiptName: '',
        })
      } catch {
      }
    }

    loadExpense()
  }, [id, isEdit])

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
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!form.date || !form.party || !form.category || !form.amount) {
                      toast.error('Tanggal, Payer, Category, dan Amount wajib diisi')
                      return
                    }

                    const payload = {
                      date: form.date,
                      type: form.type,
                      party: form.party,
                      category: form.category,
                      total: Number(form.amount) || 0,
                      reference: form.reference || null,
                      description: form.description || null,
                      status: 'Paid',
                    }

                    try {
                      setLoading(true)
                      const res = await fetch(isEdit ? `/api/expenses/${id}` : '/api/expenses', {
                        method: isEdit ? 'PUT' : 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                      })

                      const json = await res.json().catch(() => null)

                      if (!res.ok || !json?.success) {
                        toast.error(json?.message || 'Gagal menyimpan expense')
                        return
                      }

                      toast.success(isEdit ? 'Expense berhasil diupdate' : 'Expense berhasil dibuat')
                      router.push('/accounting/purchases?tab=expense')
                    } catch {
                      toast.error('Terjadi kesalahan saat menyimpan expense')
                    } finally {
                      setLoading(false)
                    }
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
                      <Label htmlFor="type">
                        Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={form.type}
                        onValueChange={(value) => setForm({ ...form, type: value })}
                      >
                        <SelectTrigger id="type" className="h-9 w-full">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vendor">Vendor</SelectItem>
                          <SelectItem value="Employee">Employee</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="party">
                        Payer / Vendor <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="party"
                        className="h-9"
                        placeholder="Masukkan nama payer / vendor"
                        value={form.party}
                        onChange={(e) => setForm({ ...form, party: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="category"
                        className="h-9"
                        placeholder="Masukkan kategori"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        required
                      />
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
                    <Button
                      type="submit"
                      variant="blue"
                      size="sm"
                      className="shadow-none h-7 px-4"
                      disabled={loading}
                    >
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


