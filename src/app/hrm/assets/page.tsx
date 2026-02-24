"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
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
import { EmployeeMultiCombobox } from "@/components/ui/employee-multi-combobox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconPlus,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { Search, X } from "lucide-react"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { toast } from "sonner"

interface Asset {
  id: number
  name: string
  employeeIds: string[]
  employees: { id: string; name: string; avatar?: string }[]
  purchaseDate: string
  supportedDate: string
  amount: number
  description: string
}

interface EmployeeOption {
  id: string
  name: string
  avatar?: string
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
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
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [rows, setRows] = useState<Asset[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    employeeIds: [] as string[],
    purchaseDate: "",
    supportedDate: "",
    amount: "",
    description: "",
  })
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return rows

    const q = search.trim().toLowerCase()
    return rows.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        (asset.description ?? "").toLowerCase().includes(q) ||
        asset.employees.some((emp) => emp.name.toLowerCase().includes(q)),
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

  const fetchAssets = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/hrm/assets")
      const json = await res.json()
      if (json.success) {
        setRows(json.data ?? [])
      } else {
        toast.error(json.message || "Gagal memuat data assets")
      }
    } catch (error) {
      console.error("Error fetching assets:", error)
      toast.error("Gagal memuat data assets")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/hrm/assets/employees")
      const json = await res.json()
      if (json.success) {
        setEmployees(
          (json.data ?? []).map((e: any) => ({
            id: e.id as string,
            name: e.name as string,
            avatar: "",
          })),
        )
      } else {
        toast.error(json.message || "Gagal memuat data employee")
      }
    } catch (error) {
      console.error("Error fetching employees for assets:", error)
      toast.error("Gagal memuat data employee")
    }
  }

  useEffect(() => {
    fetchAssets()
    fetchEmployees()
  }, [])

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        name: "",
        employeeIds: [],
        purchaseDate: "",
        supportedDate: "",
        amount: "",
        description: "",
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
      description: asset.description ?? "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Name wajib diisi")
      return
    }
    if (!formData.amount || Number.isNaN(Number(formData.amount)) || Number(formData.amount) < 0) {
      toast.error("Amount harus berupa angka positif")
      return
    }
    if (!formData.purchaseDate || !formData.supportedDate) {
      toast.error("Purchase date dan supported date wajib diisi")
      return
    }
    if (new Date(formData.supportedDate) < new Date(formData.purchaseDate)) {
      toast.error("Supported date tidak boleh sebelum purchase date")
      return
    }
    if (formData.employeeIds.length === 0) {
      toast.error("Minimal satu employee harus dipilih")
      return
    }

    try {
      setIsSubmitting(true)
      const url = editingId ? `/api/hrm/assets/${editingId}` : "/api/hrm/assets"
      const method = editingId ? "PUT" : "POST"

      const payload = {
        name: formData.name.trim(),
        employeeIds: formData.employeeIds,
        purchaseDate: formData.purchaseDate,
        supportedDate: formData.supportedDate,
        amount: Number(formData.amount),
        description: formData.description.trim(),
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (json.success) {
        toast.success(
          json.message || (editingId ? "Asset berhasil diperbarui" : "Asset berhasil dibuat"),
        )
        await fetchAssets()
        handleDialogOpenChange(false)
      } else {
        toast.error(json.message || "Gagal menyimpan asset")
      }
    } catch (error) {
      console.error("Error submitting asset:", error)
      toast.error("Gagal menyimpan asset")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id: number) => {
    const row = rows.find((a) => a.id === id) ?? null
    setAssetToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    ;(async () => {
      if (!assetToDelete) {
        setDeleteDialogOpen(false)
        return
      }
      try {
        const res = await fetch(`/api/hrm/assets/${assetToDelete.id}`, {
          method: "DELETE",
        })
        const json = await res.json()
        if (json.success) {
          toast.success(json.message || "Asset berhasil dihapus")
          await fetchAssets()
        } else {
          toast.error(json.message || "Gagal menghapus asset")
        }
      } catch (error) {
        console.error("Error deleting asset:", error)
        toast.error("Gagal menghapus asset")
      } finally {
        setAssetToDelete(null)
        setDeleteDialogOpen(false)
      }
    })()
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
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
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
                      <EmployeeMultiCombobox
                        id="employee_id"
                        label={
                          <>
                            Employee <span className="text-red-500">*</span>
                          </>
                        }
                        placeholder="Select Employee"
                        options={employees.map((e) => ({
                          value: e.id,
                          label: e.name,
                        }))}
                        value={formData.employeeIds}
                        onChange={(next) =>
                          setFormData((prev) => ({
                            ...prev,
                            employeeIds: next,
                          }))
                        }
                        helperText="Press to select employee."
                        createHref="/hrm/employees"
                      />
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
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
                </CardHeader>
              </Card>

            {/* Assets Table */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                <CardTitle>Assets List</CardTitle>
                <div className="flex w-full max-w-md items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="h-9 pl-9 pr-9 border-0 bg-gray-50 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0"
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
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Name</TableHead>
                        <TableHead className="px-6">Users</TableHead>
                        <TableHead className="px-6">Purchase Date</TableHead>
                        <TableHead className="px-6">Supported Date</TableHead>
                        <TableHead className="px-6">Amount</TableHead>
                        <TableHead className="px-6">Description</TableHead>
                        <TableHead className="px-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="px-6 text-center py-8 text-muted-foreground"
                          >
                            Loading assets...
                          </TableCell>
                        </TableRow>
                      ) : paginatedData.length > 0 ? (
                        paginatedData.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell className="px-6 font-medium">
                              {asset.name}
                            </TableCell>
                            <TableCell className="px-6">
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
                            <TableCell className="px-6">
                              {formatDate(asset.purchaseDate)}
                            </TableCell>
                            <TableCell className="px-6">
                              {formatDate(asset.supportedDate)}
                            </TableCell>
                            <TableCell className="px-6">
                              {formatPrice(asset.amount)}
                            </TableCell>
                            <TableCell className="px-6">
                              {asset.description || '-'}
                            </TableCell>
                            <TableCell className="px-6">
                              <div className="flex items-center gap-2 justify-start">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                  title="Edit"
                                  onClick={() => handleEdit(asset)}
                                >
                                  <IconPencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
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
                          <TableCell
                            colSpan={7}
                            className="px-6 text-center py-8 text-muted-foreground"
                          >
                            No assets found
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
