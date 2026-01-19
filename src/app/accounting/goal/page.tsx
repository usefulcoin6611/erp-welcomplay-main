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
} from '@/components/ui/card'
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
  IconPlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconX,
} from '@tabler/icons-react'

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

  const handleCreate = () => {
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Manage Goals</h1>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="blue" size="sm" className="shadow-none h-7">
                    <IconPlus className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                    <DialogDescription>
                      Add a new financial goal to track your progress.
                    </DialogDescription>
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
                      variant="secondary"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="blue" onClick={handleCreate}>
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    placeholder="Search goals by name, type, or date..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10 pr-10"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('')
                        setCurrentPage(1)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Goals Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Is Dashboard Display</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((goal) => (
                          <TableRow key={goal.id}>
                            <TableCell className="font-style">{goal.name}</TableCell>
                            <TableCell className="font-style">{goal.type}</TableCell>
                            <TableCell className="font-style">{goal.from}</TableCell>
                            <TableCell className="font-style">{goal.to}</TableCell>
                            <TableCell className="font-style">
                              {formatPrice(goal.amount)}
                            </TableCell>
                            <TableCell className="font-style">
                              {goal.is_display === 1 ? 'Yes' : 'No'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 justify-start">
                                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                                    title="Edit"
                                    onClick={() => handleEdit(goal)}
                                  >
                                    <IconPencil className="h-3 w-3" />
                                  </Button>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Goal</DialogTitle>
                                      <DialogDescription>
                                        Update the financial goal details.
                                      </DialogDescription>
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
                                            onChange={(e) =>
                                              setFormData({ ...formData, name: e.target.value })
                                            }
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
                                            onChange={(e) =>
                                              setFormData({ ...formData, amount: e.target.value })
                                            }
                                            required
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-type">
                                          Type <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                          value={formData.type}
                                          onValueChange={(value) =>
                                            setFormData({ ...formData, type: value })
                                          }
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
                                          <Label htmlFor="edit-from">
                                            From <span className="text-red-500">*</span>
                                          </Label>
                                          <Input
                                            id="edit-from"
                                            type="date"
                                            value={formData.from}
                                            onChange={(e) =>
                                              setFormData({ ...formData, from: e.target.value })
                                            }
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
                                            onChange={(e) =>
                                              setFormData({ ...formData, to: e.target.value })
                                            }
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
                                      <Button
                                        variant="secondary"
                                        onClick={() => setEditDialogOpen(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button variant="blue" onClick={handleUpdate}>
                                        Update
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="shadow-none h-7"
                                  title="Delete"
                                  onClick={() => handleDelete(goal.id)}
                                >
                                  <IconTrash className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No goals found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 px-4 pb-4">
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
