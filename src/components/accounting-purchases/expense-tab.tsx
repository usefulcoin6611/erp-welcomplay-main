'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

type ExpenseRow = {
  id: string
  expenseId: string
  category: string
  date: string
  status: string
  amount: number
  reference: string | null
  description: string | null
  receipt: string | null
}

function getExpenseStatusClasses(status: string) {
  switch (status) {
    case 'Paid': return 'bg-green-100 text-green-700 border-green-200'
    case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

export function ExpenseTab() {
  const [rows, setRows] = useState<ExpenseRow[]>([])
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<(typeof expenses)[number] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    amount: '',
    reference: '',
    description: '',
    receiptName: '',
  })
  const [paymentDate, setPaymentDate] = useState('')
  const [category, setCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const res = await fetch('/api/expenses', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        if (!json?.success || !Array.isArray(json.data)) return
        const mapped: ExpenseRow[] = json.data.map((e: any) => ({
          id: e.id as string,
          expenseId: e.expenseId as string,
          category: e.category as string,
          date: new Date(e.date).toISOString().slice(0, 10),
          status: e.status as string,
          amount: Number(e.total) || 0,
          reference: e.reference ?? null,
          description: e.description ?? null,
          receipt: null,
        }))
        setRows(mapped)
      } catch {
      }
    }

    loadExpenses()
  }, [])

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return rows.filter((exp) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const hay = [
          exp.id,
          exp.category,
          exp.date,
          exp.status,
          exp.reference ?? '',
          exp.description ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (paymentDate && exp.date !== paymentDate) return false
          if (category !== 'all' && exp.category !== category) {
            return false
          }
      return true
    })
  }, [paymentDate, category, rows, search])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleReset = () => {
    setPaymentDate('')
    setCategory('all')
    setCurrentPage(1)
  }

  const handleDeleteClick = (exp: ExpenseRow) => {
    setExpenseToDelete(exp)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return
    await fetch(`/api/expenses/${expenseToDelete.expenseId}`, {
      method: 'DELETE',
    }).catch(() => null)
    setRows((prev) => prev.filter((e) => e.id !== expenseToDelete.id))
    setExpenseToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        date: '',
        category: '',
        amount: '',
        reference: '',
        description: '',
        receiptName: '',
      })
    }
  }

  const handleEdit = (exp: ExpenseRow) => {
    setEditingId(exp.id)
    setFormData({
        date: exp.date,
        category: exp.category,
        amount: String(exp.amount ?? ''),
        reference: exp.reference ?? '',
        description: exp.description ?? '',
        receiptName: exp.receipt ?? '',
      })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextAmount = Number(formData.amount) || 0

    const payload = {
      date: formData.date,
      type: 'Vendor',
      party: 'Manual',
      category: formData.category,
      total: nextAmount,
      reference: formData.reference || null,
      description: formData.description || null,
      status: 'Paid',
    }

    const target = rows.find((r) => r.id === editingId)
    const url = editingId && target ? `/api/expenses/${target.expenseId}` : '/api/expenses'
    const method = editingId && target ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null)

    if (!res || !res.ok) {
      return
    }

    const json = await res.json().catch(() => null)
    if (!json?.success || !json.data) {
      return
    }

    const saved: any = json.data
    const mapped: ExpenseRow = {
      id: saved.id as string,
      expenseId: saved.expenseId as string,
      category: saved.category as string,
      date: new Date(saved.date).toISOString().slice(0, 10),
      status: saved.status as string,
      amount: Number(saved.total) || 0,
      reference: saved.reference ?? null,
      description: saved.description ?? null,
      receipt: null,
    }

    if (editingId && target) {
      setRows((prev) => prev.map((r) => (r.id === editingId ? mapped : r)))
    } else {
      setRows((prev) => [mapped, ...prev])
    }

    handleDialogOpenChange(false)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [paymentDate, category, search])

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Expense</CardTitle>
            <CardDescription>Track and manage expenses.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="blue"
              size="sm"
              className="shadow-none h-7 px-4"
              title="Create"
              onClick={() => setEditingId(null)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Expense' : 'Create Expense'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update expense information.' : 'Add a new expense to the system.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exp-date">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="exp-date"
                      type="date"
                      className="h-9"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exp-category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      required
                    >
                      <SelectTrigger id="exp-category" className="h-9 w-full">
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
                    <Label htmlFor="exp-amount">
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="exp-amount"
                      type="number"
                      step="0.01"
                      className="h-9"
                      placeholder="Enter Amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exp-reference">Reference</Label>
                    <Input
                      id="exp-reference"
                      className="h-9"
                      placeholder="Enter Reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="exp-description">Description</Label>
                    <Textarea
                      id="exp-description"
                      placeholder="Enter Description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="exp-receipt">Payment Receipt</Label>
                    <Input
                      id="exp-receipt"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setFormData({ ...formData, receiptName: e.target.files?.[0]?.name ?? '' })
                      }
                    />
                    {formData.receiptName ? (
                      <p className="text-xs text-muted-foreground">Selected: {formData.receiptName}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-7"
                  onClick={() => handleDialogOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="blue" size="sm" className="shadow-none h-7 px-4">
                  {editingId ? 'Update Expense' : 'Create Expense'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
        <CardContent className="px-6 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setCurrentPage(1)
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_auto] md:justify-start"
          >
            <div className="space-y-2">
              <Label htmlFor="expense-filter-date" className="text-sm font-medium">
                Payment Date
              </Label>
              <DatePicker
                id="expense-filter-date"
                value={paymentDate}
                onValueChange={(v) => setPaymentDate(v)}
                placeholder="Set a date"
                className="!h-9 px-3"
                iconPlacement="right"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Input
                value={category === 'all' ? '' : category}
                onChange={(e) => setCategory(e.target.value || 'all')}
                className="h-9"
                placeholder="Filter category"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:pt-6">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                title="Apply"
              >
                <Search className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                onClick={handleReset}
                title="Reset"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Expense List</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
              />
              {search.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Expense</TableHead>
                  <TableHead className="px-6">Category</TableHead>
                  <TableHead className="px-6">Date</TableHead>
                  <TableHead className="px-6">Status</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="px-6">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="shadow-none"
                        >
                          <Link href={`/accounting/expense/${exp.expenseId}`}>
                            {exp.expenseId}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="px-6">{exp.category}</TableCell>
                      <TableCell className="px-6">{exp.date}</TableCell>
                      <TableCell className="px-6">
                        <Badge className={getExpenseStatusClasses(exp.status)}>
                          {exp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                            title="View"
                            asChild
                          >
                            <Link href={`/accounting/expense/${exp.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => handleEdit(exp)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(exp)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 text-center py-8 text-muted-foreground">
                      No expenses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <div className="px-6 pb-6 pt-4">
              <SimplePagination
                totalCount={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExpenseToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
