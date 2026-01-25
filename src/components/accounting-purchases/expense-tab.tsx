'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
} from 'lucide-react'

// Mock expenses
const expenses = [
  {
    id: 'EXP-2025-001',
    category: 'Office Supplies',
    categoryId: '1',
    date: '2025-11-05',
    status: 'Paid',
    amount: 1250000,
    reference: 'REF-EXP-001',
    description: 'Office supplies purchase',
    receipt: 'receipt_exp_001.pdf',
  },
  {
    id: 'EXP-2025-002',
    category: 'Travel',
    categoryId: '2',
    date: '2025-11-04',
    status: 'Pending',
    amount: 875000,
    reference: 'REF-EXP-002',
    description: 'Travel reimbursement',
    receipt: '',
  },
  {
    id: 'EXP-2025-003',
    category: 'Utilities',
    categoryId: '3',
    date: '2025-11-03',
    status: 'Paid',
    amount: 540000,
    reference: 'REF-EXP-003',
    description: 'Monthly utilities',
    receipt: '',
  },
]

function getExpenseStatusClasses(status: string) {
  switch (status) {
    case 'Paid': return 'bg-green-100 text-green-700 border-green-200'
    case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const categories = [
  { id: '1', name: 'Office Supplies' },
  { id: '2', name: 'Travel' },
  { id: '3', name: 'Utilities' },
  { id: '4', name: 'Marketing' },
]

export function ExpenseTab() {
  const [rows, setRows] = useState<typeof expenses>(expenses)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<(typeof expenses)[number] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    categoryId: '',
    amount: '',
    reference: '',
    description: '',
    receiptName: '',
  })
  const [paymentDate, setPaymentDate] = useState('')
  const [category, setCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return rows.filter((exp) => {
      if (paymentDate && exp.date !== paymentDate) return false
      if (category !== 'all') {
        const cat = categories.find(c => c.id === category)
        if (cat && exp.category !== cat.name) return false
      }
      return true
    })
  }, [paymentDate, category, rows])

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

  const handleDeleteClick = (exp: (typeof expenses)[number]) => {
    setExpenseToDelete(exp)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!expenseToDelete) return
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
        categoryId: '',
        amount: '',
        reference: '',
        description: '',
        receiptName: '',
      })
    }
  }

  const handleEdit = (exp: (typeof expenses)[number]) => {
    setEditingId(exp.id)
    setFormData({
      date: exp.date,
      categoryId: exp.categoryId,
      amount: String(exp.amount ?? ''),
      reference: exp.reference ?? '',
      description: exp.description ?? '',
      receiptName: exp.receipt ?? '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const categoryName = categories.find((c) => c.id === formData.categoryId)?.name ?? ''
    const nextAmount = Number(formData.amount) || 0

    if (editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                date: formData.date,
                categoryId: formData.categoryId,
                category: categoryName || r.category,
                amount: nextAmount,
                reference: formData.reference,
                description: formData.description,
                receipt: formData.receiptName,
              }
            : r,
        ),
      )
    } else {
      const nextSeq = rows.length + 1
      const newId = `EXP-2025-${String(nextSeq).padStart(3, '0')}`
      const newRow = {
        id: newId,
        category: categoryName,
        categoryId: formData.categoryId,
        date: formData.date,
        status: 'Pending',
        amount: nextAmount,
        reference: formData.reference,
        description: formData.description,
        receipt: formData.receiptName,
      }
      setRows((prev) => [newRow, ...prev])
    }

    handleDialogOpenChange(false)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [paymentDate, category])

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Expense</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage expenses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-end sm:ml-auto sm:self-auto">
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
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="w-full md:w-56">
              <label className="mb-1 block text-sm font-medium">Payment Date</label>
              <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="h-9" />
            </div>
            <div className="w-full md:w-56">
              <label className="mb-1 block text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" variant="outline" size="sm" className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Apply">
                <Search className="h-3 w-3" />
              </Button>
              <Button type="button" variant="outline" size="sm" className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100" onClick={handleReset} title="Reset">
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">Expense</TableHead>
                  <TableHead className="px-4 py-3">Category</TableHead>
                  <TableHead className="px-4 py-3">Date</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                  <TableHead className="px-4 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="px-4 py-3">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="shadow-none"
                        >
                          <Link href={`/accounting/expense/${exp.id}`}>
                            {exp.id}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="px-4 py-3">{exp.category}</TableCell>
                      <TableCell className="px-4 py-3">{exp.date}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={getExpenseStatusClasses(exp.status)}>
                          {exp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
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
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No expenses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <div className="mt-4 px-4 pb-4">
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

