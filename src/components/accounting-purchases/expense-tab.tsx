'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  IconCalendar,
  IconSearch,
  IconPlus,
  IconRefresh,
  IconEye,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'

// Mock expenses
const expenses = [
  {
    id: 'EXP-2025-001',
    category: 'Office Supplies',
    date: '2025-11-05',
    status: 'Paid',
  },
  {
    id: 'EXP-2025-002',
    category: 'Travel',
    date: '2025-11-04',
    status: 'Pending',
  },
  {
    id: 'EXP-2025-003',
    category: 'Utilities',
    date: '2025-11-03',
    status: 'Paid',
  },
]

function getExpenseStatusClasses(status: string) {
  switch (status) {
    case 'Paid': return 'bg-green-100 text-green-700 border-none'
    case 'Pending': return 'bg-yellow-100 text-yellow-700 border-none'
    default: return 'bg-slate-100 text-slate-700 border-none'
  }
}

const categories = [
  { id: '1', name: 'Office Supplies' },
  { id: '2', name: 'Travel' },
  { id: '3', name: 'Utilities' },
  { id: '4', name: 'Marketing' },
]

export function ExpenseTab() {
  const [paymentDate, setPaymentDate] = useState('')
  const [category, setCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return expenses.filter((exp) => {
      if (paymentDate && exp.date !== paymentDate) return false
      if (category !== 'all') {
        const cat = categories.find(c => c.id === category)
        if (cat && exp.category !== cat.name) return false
      }
      return true
    })
  }, [paymentDate, category])

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

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Button asChild variant="blue" size="sm" className="shadow-none h-7">
          <Link href="/accounting/expense/create">
            <IconPlus className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter expenses by payment date and category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-sm font-medium">Payment Date</label>
              <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </div>
            <div className="w-full md:w-40">
              <label className="mb-1 block text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
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
            <div className="flex gap-2">
              <Button type="submit" variant="blue" size="sm" className="shadow-none h-7">
                <IconSearch className="h-3 w-3 mr-2" />
                Apply
              </Button>
              <Button type="button" variant="destructive" size="sm" className="shadow-none h-7" onClick={handleReset}>
                <IconRefresh className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
          <CardDescription>
            Overview of all recorded expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>
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
                      <TableCell>{exp.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="h-3 w-3" />
                          <span>{exp.date}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getExpenseStatusClasses(exp.status)}>
                          {exp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="shadow-none h-7 bg-yellow-500 hover:bg-yellow-600 text-white"
                            title="View"
                            asChild
                          >
                            <Link href={`/accounting/expense/${exp.id}`}>
                              <IconEye className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                            title="Edit"
                            asChild
                          >
                            <Link href={`/accounting/expense/${exp.id}/edit`}>
                              <IconPencil className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="shadow-none h-7"
                            title="Delete"
                          >
                            <IconTrash className="h-3 w-3" />
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
          <div className="mt-4">
            <SimplePagination
              totalCount={totalRecords}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
