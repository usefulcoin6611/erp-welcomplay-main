'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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

  useEffect(() => {
    setCurrentPage(1)
  }, [paymentDate, category])

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Button asChild variant="blue" size="sm" className="shadow-none h-7" title="Create">
          <Link href="/accounting/expense/create/0">
            <Plus className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Payment Date</label>
                <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9">
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
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" variant="outline" size="sm" className="shadow-none h-9 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Apply">
                <Search className="h-3 w-3" />
              </Button>
              <Button type="button" variant="outline" size="sm" className="shadow-none h-9 bg-red-50 text-red-700 hover:bg-red-100 border-red-100" onClick={handleReset} title="Reset">
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
                            asChild
                          >
                            <Link href={`/accounting/expense/${exp.id}/edit`}>
                              <Pencil className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
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
    </div>
  )
}

