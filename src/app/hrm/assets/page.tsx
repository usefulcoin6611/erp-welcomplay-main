"use client"

import { useState, useMemo } from 'react'
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MainContentWrapper } from "@/components/main-content-wrapper"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconPlus,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { Search, X } from 'lucide-react'
import { SimplePagination } from '@/components/ui/simple-pagination'

interface Asset {
  id: number
  name: string
  employeeIds: number[]
  employees: { id: number; name: string; avatar?: string }[]
  purchaseDate: string
  supportedDate: string
  amount: number
  description: string
}

const employees = [
  { id: 1, name: 'John Doe', avatar: '' },
  { id: 2, name: 'Jane Smith', avatar: '' },
  { id: 3, name: 'Bob Johnson', avatar: '' },
  { id: 4, name: 'Alice Williams', avatar: '' },
  { id: 5, name: 'Charlie Brown', avatar: '' },
]

const assets: Asset[] = [
  {
    id: 1,
    name: 'Dell Laptop - Latitude 5520',
    employeeIds: [1, 2],
    employees: [
      { id: 1, name: 'John Doe', avatar: '' },
      { id: 2, name: 'Jane Smith', avatar: '' },
    ],
    purchaseDate: '2023-01-15',
    supportedDate: '2026-01-15',
    amount: 1200,
    description: 'High-performance laptop for development team',
  },
  {
    id: 2,
    name: 'iPhone 13 Pro',
    employeeIds: [3],
    employees: [
      { id: 3, name: 'Bob Johnson', avatar: '' },
    ],
    purchaseDate: '2023-03-20',
    supportedDate: '2025-03-20',
    amount: 999,
    description: 'Mobile device for sales team',
  },
  {
    id: 3,
    name: 'Herman Miller Chair',
    employeeIds: [4],
    employees: [
      { id: 4, name: 'Alice Williams', avatar: '' },
    ],
    purchaseDate: '2022-11-10',
    supportedDate: '2027-11-10',
    amount: 800,
    description: 'Ergonomic office chair',
  },
  {
    id: 4,
    name: 'HP Printer - LaserJet Pro',
    employeeIds: [5],
    employees: [
      { id: 5, name: 'Charlie Brown', avatar: '' },
    ],
    purchaseDate: '2023-02-05',
    supportedDate: '2026-02-05',
    amount: 450,
    description: 'Office printer for all departments',
  },
  {
    id: 5,
    name: 'MacBook Pro 16"',
    employeeIds: [1, 3],
    employees: [
      { id: 1, name: 'John Doe', avatar: '' },
      { id: 3, name: 'Bob Johnson', avatar: '' },
    ],
    purchaseDate: '2023-05-10',
    supportedDate: '2026-05-10',
    amount: 2500,
    description: 'High-end laptop for design team',
  },
  {
    id: 6,
    name: 'Samsung Monitor 27"',
    employeeIds: [2, 4],
    employees: [
      { id: 2, name: 'Jane Smith', avatar: '' },
      { id: 4, name: 'Alice Williams', avatar: '' },
    ],
    purchaseDate: '2023-06-15',
    supportedDate: '2026-06-15',
    amount: 350,
    description: '4K monitor for design and development',
  },
  {
    id: 7,
    name: 'Logitech MX Master 3',
    employeeIds: [5],
    employees: [
      { id: 5, name: 'Charlie Brown', avatar: '' },
    ],
    purchaseDate: '2023-07-20',
    supportedDate: '2026-07-20',
    amount: 99,
    description: 'Wireless mouse for productivity',
  },
  {
    id: 8,
    name: 'iPad Pro 12.9"',
    employeeIds: [1],
    employees: [
      { id: 1, name: 'John Doe', avatar: '' },
    ],
    purchaseDate: '2023-08-01',
    supportedDate: '2026-08-01',
    amount: 1100,
    description: 'Tablet for presentations and meetings',
  },
]

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export default function EmployeesAssetSetupPage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [rows, setRows] = useState<Asset[]>(assets)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    employeeIds: [] as number[],
    purchaseDate: '',
    supportedDate: '',
    amount: '',
    description: '',
  })

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return rows
    
    const q = search.trim().toLowerCase()
    return rows.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        asset.description.toLowerCase().includes(q) ||
        asset.employees.some((emp) => emp.name.toLowerCase().includes(q))
    )
  }, [search, rows])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        name: '',
        employeeIds: [],
        purchaseDate: '',
        supportedDate: '',
        amount: '',
        description: '',
      })
    }
  }

  const handleEdit = (asset: Asset) => {
    setEditingId(asset.id)
    setFormData({
      name: asset.name,
      employeeIds: asset.employeeIds,
      purchaseDate: asset.purchaseDate,
      supportedDate: asset.supportedDate,
      amount: asset.amount.toString(),
      description: asset.description,
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', formData)
    handleDialogOpenChange(false)
  }

  const handleDelete = (id: number) => {
    const row = rows.find((a) => a.id === id) ?? null
    setAssetToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!assetToDelete) return
    setRows((prev) => prev.filter((a) => a.id !== assetToDelete.id))
    setAssetToDelete(null)
    setDeleteDialogOpen(false)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="px-6">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-semibold">Assets</CardTitle>
                    <CardDescription>Manage employee assets and equipment</CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button variant="blue" size="sm" className="shadow-none h-7 px-4" title="Create Asset">
                        <IconPlus className="mr-2 h-4 w-4" />
                        Create Asset
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingId ? 'Edit Assets' : 'Create New Assets'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingId ? 'Update asset information' : 'Add a new asset to the system'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="employee_id">
                          Employee
                        </Label>
                        <Select
                          value=""
                          onValueChange={(value) => {
                            const id = parseInt(value)
                            if (!formData.employeeIds.includes(id)) {
                              setFormData({ ...formData, employeeIds: [...formData.employeeIds, id] })
                            }
                          }}
                        >
                          <SelectTrigger id="employee_id">
                            <SelectValue placeholder="Select Employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees
                              .filter((emp) => !formData.employeeIds.includes(emp.id))
                              .map((emp) => (
                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            {employees.filter((emp) => !formData.employeeIds.includes(emp.id)).length === 0 && (
                              <SelectItem value="no-more" disabled>
                                All employees selected
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create employee here. <Link href="/hrm/employees" className="font-medium text-primary hover:underline">Create employee</Link>
                        </p>
                        {formData.employeeIds.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.employeeIds.map((empId) => {
                              const emp = employees.find((e) => e.id === empId)
                              return emp ? (
                                <Badge
                                  key={empId}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {emp.name}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        employeeIds: formData.employeeIds.filter((id) => id !== empId),
                                      })
                                    }}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ) : null
                            })}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter Name"
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
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="Enter Amount"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="purchase_date">
                            Purchase Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="purchase_date"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supported_date">
                            Supported Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="supported_date"
                            type="date"
                            value={formData.supportedDate}
                            onChange={(e) => setFormData({ ...formData, supportedDate: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter Description"
                          rows={3}
                        />
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
                      <Button
                        type="submit"
                        variant="blue"
                        size="sm"
                        className="shadow-none h-7"
                      >
                        {editingId ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
                </CardHeader>
              </Card>

            {/* Assets Table */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pl-8 pr-6">
                <CardTitle>Assets List</CardTitle>
                <div className="flex w-full max-w-md items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="h-9 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
                    />
                    {search.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                        onClick={() => handleSearchChange('')}
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Supported Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell className="font-medium">
                              {asset.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex -space-x-2">
                                {asset.employees.map((employee) => (
                                  <Avatar
                                    key={employee.id}
                                    className="h-9 w-9 border-2 border-white"
                                  >
                                    <AvatarImage src={employee.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {getInitials(employee.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(asset.purchaseDate)}
                            </TableCell>
                            <TableCell>
                              {formatDate(asset.supportedDate)}
                            </TableCell>
                            <TableCell>
                              {formatPrice(asset.amount)}
                            </TableCell>
                            <TableCell>
                              {asset.description || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 justify-start">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                  title="Edit"
                                  onClick={() => handleEdit(asset)}
                                >
                                  <IconPencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  title="Delete"
                                  onClick={() => handleDelete(asset.id)}
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
                            No assets found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalRecords > 0 && (
                  <div className="mt-4">
                    <SimplePagination
                      totalCount={totalRecords}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
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
                  <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this asset? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setAssetToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </div>
          </MainContentWrapper>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
