'use client'

import { useState, useMemo } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Search, X, Eye, Pencil, Trash2 } from 'lucide-react'

const CARD_STYLE = 'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white'

const BUDGETS_MOCK = [
  { id: '1', name: 'Monthly Budget Plan', from: '2025', budgetPeriod: 'Monthly' },
  { id: '2', name: 'Quarterly Budget Plan', from: '2025', budgetPeriod: 'Quarterly' },
  { id: '3', name: 'Half-Yearly Budget Plan', from: '2025', budgetPeriod: 'Half Yearly' },
  { id: '4', name: 'Yearly Budget Plan', from: '2025', budgetPeriod: 'Yearly' },
]

export default function BudgetPlannerPage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [budgets, setBudgets] = useState(BUDGETS_MOCK)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredData = useMemo(() => {
    if (!search.trim()) return budgets
    const q = search.trim().toLowerCase()
    return budgets.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.budgetPeriod.toLowerCase().includes(q) ||
        b.from.toLowerCase().includes(q)
    )
  }, [budgets, search])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleDelete = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
    setDeleteId(null)
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
            {/* Header: Manage Budget Planner + breadcrumb + Add (reference-erp) */}
            <Card className={CARD_STYLE}>
              <CardContent className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="mb-2 text-xl font-semibold">Manage Budget Planner</h4>
                    <Breadcrumb>
                      <BreadcrumbList className="text-muted-foreground">
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>Budget Planner</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                  <Button variant="blue" size="sm" className="shadow-none h-7 px-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Table controls: entries per page (left), Search (right) - reference-erp */}
            <Card className={CARD_STYLE}>
              <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(Number(v))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="h-9 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries per page</span>
                </div>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                  />
                  {search.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => {
                        setSearch('')
                        setCurrentPage(1)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4 py-3 font-normal">NAME</TableHead>
                        <TableHead className="px-4 py-3 font-normal">FROM</TableHead>
                        <TableHead className="px-4 py-3 font-normal">BUDGET PERIOD</TableHead>
                        <TableHead className="px-4 py-3 font-normal w-32">ACTION</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                            No budget found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell className="px-4 py-3 text-sm font-medium">{b.name}</TableCell>
                            <TableCell className="px-4 py-3 text-sm">{b.from}</TableCell>
                            <TableCell className="px-4 py-3 text-sm">{b.budgetPeriod}</TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                  title="Edit"
                                  asChild
                                >
                                  <Link href={`/accounting/budget/${b.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                                  title="View"
                                  asChild
                                >
                                  <Link href={`/accounting/budget/${b.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  title="Delete"
                                  onClick={() => setDeleteId(b.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalRecords > 0 && (
                  <div className="px-4 py-3 border-t flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1} to{' '}
                      {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
                    </span>
                    <SimplePagination
                      totalCount={totalRecords}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                      }}
                      hideRowsSelector
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete budget plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
