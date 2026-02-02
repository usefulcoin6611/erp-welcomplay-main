'use client'

import { useState, useMemo } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
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
  Pencil,
  Trash2,
  Search,
  X,
} from 'lucide-react'

// Mock data based on reference
const goalTypes = [
  { value: 'Invoice', label: 'Invoice' },
  { value: 'Bill', label: 'Bill' },
  { value: 'Revenue', label: 'Revenue' },
  { value: 'Payment', label: 'Payment' },
]

const mockGoals = [
  {
    id: 1,
    name: 'Increase Revenue',
    type: 'Revenue',
    from: '2025-01-01',
    to: '2025-12-31',
    amount: 500_000_000,
    is_display: 1,
  },
  {
    id: 2,
    name: 'Reduce Expenses',
    type: 'Payment',
    from: '2025-01-01',
    to: '2025-12-31',
    amount: 200_000_000,
    is_display: 0,
  },
  {
    id: 3,
    name: 'Increase Invoice Sales',
    type: 'Invoice',
    from: '2025-01-01',
    to: '2025-12-31',
    amount: 300_000_000,
    is_display: 1,
  },
  {
    id: 4,
    name: 'Reduce Bill Payments',
    type: 'Bill',
    from: '2025-01-01',
    to: '2025-12-31',
    amount: 150_000_000,
    is_display: 0,
  },
  {
    id: 5,
    name: 'Monthly Revenue Target',
    type: 'Revenue',
    from: '2025-01-01',
    to: '2025-12-31',
    amount: 600_000_000,
    is_display: 1,
  },
]

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function FinancialGoalPage() {
  const [goals, setGoals] = useState(mockGoals)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: '',
    from: '',
    to: '',
    is_display: true,
  })

  // Filter data
  const filteredData = useMemo(() => {
    if (!search.trim()) return goals
    const q = search.trim().toLowerCase()
    return goals.filter(
      (goal) =>
        goal.name.toLowerCase().includes(q) ||
        goal.type.toLowerCase().includes(q) ||
        goal.from.toLowerCase().includes(q) ||
        goal.to.toLowerCase().includes(q)
    )
  }, [goals, search])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.amount.trim().length > 0 &&
    formData.type.trim().length > 0 &&
    formData.from.trim().length > 0 &&
    formData.to.trim().length > 0

  const handleCreate = () => {
    if (!isFormValid) return
    const newGoal = {
      id: goals.length + 1,
      ...formData,
      amount: parseFloat(formData.amount),
      is_display: formData.is_display ? 1 : 0,
    }
    setGoals([...goals, newGoal])
    setFormData({
      name: '',
      amount: '',
      type: '',
      from: '',
      to: '',
      is_display: true,
    })
    setCreateDialogOpen(false)
  }

  const handleEdit = (goal: any) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      amount: goal.amount.toString(),
      type: goal.type,
      from: goal.from,
      to: goal.to,
      is_display: goal.is_display === 1,
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!editingGoal) return
    if (!isFormValid) return
    setGoals(
      goals.map((g) =>
        g.id === editingGoal.id
          ? {
              ...g,
              ...formData,
              amount: parseFloat(formData.amount),
              is_display: formData.is_display ? 1 : 0,
            }
          : g
      )
    )
    setEditDialogOpen(false)
    setEditingGoal(null)
    setFormData({
      name: '',
      amount: '',
      type: '',
      from: '',
      to: '',
      is_display: true,
    })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setGoals(goals.filter((g) => g.id !== id))
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
            {/* Title Page */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg font-semibold">Financial Goal</CardTitle>
                  <CardDescription>Manage your financial goals and dashboard visibility.</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="blue" size="sm" className="shadow-none h-7 px-4" title="Create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Goal</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">
                              Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              placeholder="Enter Name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                              placeholder="Enter Amount"
                              value={formData.amount}
                              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">
                            Type <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {goalTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="from">
                              From <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="from"
                              type="date"
                              value={formData.from}
                              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="to">
                              To <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="to"
                              type="date"
                              value={formData.to}
                              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_display"
                            checked={formData.is_display}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, is_display: checked as boolean })
                            }
                          />
                          <Label htmlFor="is_display" className="cursor-pointer">
                            Display On Dashboard
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button variant="blue" onClick={handleCreate} disabled={!isFormValid} className="shadow-none">
                          Create
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Goals Table */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                <CardTitle>Goals</CardTitle>
                <div className="flex w-full max-w-md items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search goals..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
                    />
                    {search.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearch('')
                          setCurrentPage(1)
                        }}
                        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Name</TableHead>
                        <TableHead className="px-6">Type</TableHead>
                        <TableHead className="px-6">From</TableHead>
                        <TableHead className="px-6">To</TableHead>
                        <TableHead className="px-6">Amount</TableHead>
                        <TableHead className="px-6">Is Dashboard Display</TableHead>
                        <TableHead className="px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((goal) => (
                          <TableRow key={goal.id}>
                            <TableCell className="px-6 font-style">{goal.name}</TableCell>
                            <TableCell className="px-6 font-style">{goal.type}</TableCell>
                            <TableCell className="px-6 font-style">{goal.from}</TableCell>
                            <TableCell className="px-6 font-style">{goal.to}</TableCell>
                            <TableCell className="px-6 font-style">
                              {formatPrice(goal.amount)}
                            </TableCell>
                            <TableCell className="px-6 font-style">
                              <Badge
                                className={
                                  goal.is_display === 1
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-red-100 text-red-700 border-red-200'
                                }
                              >
                                {goal.is_display === 1 ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                                  title="Edit"
                                  onClick={() => handleEdit(goal)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  title="Delete"
                                  onClick={() => handleDelete(goal.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="px-6 text-center py-8 text-muted-foreground">
                            No goals found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="px-6 pb-6 pt-4">
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

            {/* Edit Dialog (single instance) */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Goal</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        placeholder="Enter Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-amount">
                        Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-amount"
                        type="number"
                        step="0.01"
                        placeholder="Enter Amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-from">
                        From <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-from"
                        type="date"
                        value={formData.from}
                        onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-to">
                        To <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-to"
                        type="date"
                        value={formData.to}
                        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-is_display"
                      checked={formData.is_display}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          is_display: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="edit-is_display" className="cursor-pointer">
                      Display On Dashboard
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="blue" onClick={handleUpdate} disabled={!isFormValid} className="shadow-none">
                    Update
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
