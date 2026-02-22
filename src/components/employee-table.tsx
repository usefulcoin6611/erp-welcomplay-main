"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Plus,
  FileDown,
  FileUp,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Employee {
  id: string
  employeeId: string
  name: string
  email: string
  branch: string
  department: string
  designation: string
  dateOfJoining: string
  lastLogin: string
  isActive: boolean
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  salaryType?: string | null
  basicSalary?: number | null
  accountHolderName?: string | null
  accountNumber?: string | null
  bankName?: string | null
  bankIdentifierCode?: string | null
  branchLocation?: string | null
  taxPayerId?: string | null
}

// Employee Table Component
export function EmployeeTable() {
  const t = useTranslations("hrm.employee")
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Employee | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/employees")
      const json = await res.json().catch(() => null)

      if (!json || !json.success) {
        toast.error(json?.message || t("failedToLoadEmployees"))
        return
      }

      setEmployees(json.data as Employee[])
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast.error(t("failedToLoadEmployees"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedAndFilteredEmployees = employees
    .filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) return 0
      
      const aRaw = a[sortField]
      const bRaw = b[sortField]

      let aValue = aRaw === null || aRaw === undefined ? "" : aRaw
      let bValue = bRaw === null || bRaw === undefined ? "" : bRaw
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })

  // Pagination logic
  const totalItems = sortedAndFilteredEmployees.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedEmployees = sortedAndFilteredEmployees.slice(startIndex, endIndex)

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  const handleCreateEmployee = () => {
    router.push("/hrm/employees/create")
  }

  const handleEmployeeDetail = (employeeId: string) => {
    router.push(`/hrm/employees/${employeeId}`)
  }

  const handleEditEmployee = (employeeId: string) => {
    router.push(`/hrm/employees/${employeeId}/edit`)
  }

  const openDeleteConfirm = (employeeId: string) => {
    setDeleteEmployeeId(employeeId)
    setDeleteAlertOpen(true)
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      })
      const json = await res.json().catch(() => null)

      if (!json || !json.success) {
        toast.error(json?.message || t("failedToDeleteEmployee"))
        return
      }

      toast.success(json.message || t("employeeDeleted"))
      await fetchEmployees()
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast.error(t("failedToDeleteEmployee"))
    } finally {
      setDeleteEmployeeId(null)
      setDeleteAlertOpen(false)
    }
  }

  const handleExport = () => {
    if (!employees.length) {
      return
    }

    const headers = [
      "employeeId",
      "name",
      "email",
      "phone",
      "dateOfBirth",
      "gender",
      "address",
      "branch",
      "department",
      "designation",
      "dateOfJoining",
      "salaryType",
      "basicSalary",
      "accountHolderName",
      "accountNumber",
      "bankName",
      "bankIdentifierCode",
      "branchLocation",
      "taxPayerId",
      "isActive",
    ]

    const rows = employees.map((e) => [
      e.employeeId,
      e.name,
      e.email,
      e.phone ?? "",
      e.dateOfBirth ? e.dateOfBirth.split("T")[0] : "",
      e.gender ?? "",
      e.address ?? "",
      e.branch,
      e.department,
      e.designation,
      e.dateOfJoining ? e.dateOfJoining.split("T")[0] : "",
      e.salaryType ?? "",
      e.basicSalary != null ? String(e.basicSalary) : "",
      e.accountHolderName ?? "",
      e.accountNumber ?? "",
      e.bankName ?? "",
      e.bankIdentifierCode ?? "",
      e.branchLocation ?? "",
      e.taxPayerId ?? "",
      e.isActive ? "true" : "false",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute(
      "download",
      `employees_${new Date().toISOString().split("T")[0]}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleTemplateDownload = () => {
    const headers = [
      "employeeId",
      "name",
      "email",
      "phone",
      "dateOfBirth",
      "gender",
      "address",
      "branch",
      "department",
      "designation",
      "dateOfJoining",
      "salaryType",
      "basicSalary",
      "accountHolderName",
      "accountNumber",
      "bankName",
      "bankIdentifierCode",
      "branchLocation",
      "taxPayerId",
      "isActive",
    ]

    const exampleRow = [
      "EMP100",
      "John Doe",
      "john.doe@example.com",
      "+62 812-0000-0000",
      "1990-01-01",
      "Male",
      "Jakarta Selatan",
      "Pusat Jakarta",
      "IT Department",
      "Software Engineer",
      "2024-01-01",
      "Monthly Payslip",
      "15000000",
      "John Doe",
      "14202599",
      "Bank Demo",
      "0000000",
      "Jakarta",
      "99999",
      "true",
    ]

    const csvContent = [
      headers.join(","),
      exampleRow
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "employee_import_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.error("Pilih file CSV terlebih dahulu")
      return
    }

    const formData = new FormData()
    formData.append("file", importFile)

    setIsImporting(true)
    try {
      const res = await fetch("/api/employees/import", {
        method: "POST",
        body: formData,
      })
      const json = await res.json().catch(() => null)

      if (!json || !json.success) {
        toast.error(json?.message || "Gagal mengimport data employee")
        return
      }

      toast.success(
        json.message || "Berhasil mengimport data employee dari file CSV",
      )
      setImportDialogOpen(false)
      setImportFile(null)
      await fetchEmployees()
    } catch (error) {
      console.error("Error importing employees:", error)
      toast.error("Terjadi kesalahan saat mengimport data employee")
    } finally {
      setIsImporting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const SortableHeader = ({ field, children }: { field: keyof Employee, children: React.ReactNode }) => {
    const isActive = sortField === field
    return (
      <TableHead className="px-4 py-3 font-medium">
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium text-left justify-start hover:bg-transparent"
          onClick={() => handleSort(field)}
        >
          {children}
          {isActive && (
            sortDirection === 'asc' ? 
              <ChevronUp className="ml-1 h-4 w-4" /> : 
              <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </Button>
      </TableHead>
    )
  }

  return (
    <Card className="rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex flex-row items-center justify-between gap-4 w-full">
          <CardTitle className="text-base font-medium shrink-0">{t("title")}</CardTitle>
          <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
            <Dialog open={importDialogOpen} onOpenChange={(open) => { setImportDialogOpen(open); if (!open) setImportFile(null) }}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-4 shadow-none border-0 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  {t("import")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>{t("import")}</DialogTitle>
                  <DialogDescription>
                    Unggah file CSV karyawan sesuai format template.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee-import-file">File CSV</Label>
                    <Input
                      id="employee-import-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null
                        setImportFile(file)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="shadow-none"
                      onClick={handleTemplateDownload}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Template CSV
                    </Button>
                    {importFile && (
                      <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {importFile.name}
                      </span>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="shadow-none"
                    onClick={() => {
                      setImportDialogOpen(false)
                      setImportFile(null)
                    }}
                    disabled={isImporting}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="button"
                    className="shadow-none bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleImportSubmit}
                    disabled={!importFile || isImporting}
                  >
                    {isImporting ? "Mengimport..." : t("import")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-4 shadow-none border-0 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              onClick={handleExport}
            >
              <FileDown className="mr-2 h-4 w-4" />
              {t("export")}
            </Button>
            <Button size="sm" onClick={handleCreateEmployee} className="h-9 px-4 bg-blue-600 text-white hover:bg-blue-700 shadow-none">
              <Plus className="mr-2 h-4 w-4" />
              {t("create")}
            </Button>
            <div className="relative w-44 min-w-[140px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t("search")}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 pl-9 pr-3 border-0 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 shadow-none transition-colors w-full"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="employeeId">{t("employeeId")}</SortableHeader>
                <SortableHeader field="name">{t("name")}</SortableHeader>
                <SortableHeader field="email">{t("email")}</SortableHeader>
                <SortableHeader field="branch">{t("branch")}</SortableHeader>
                <SortableHeader field="department">{t("department")}</SortableHeader>
                <SortableHeader field="designation">{t("designation")}</SortableHeader>
                <SortableHeader field="dateOfJoining">{t("dateOfJoining")}</SortableHeader>
                <TableHead className="px-4 py-3 font-medium">{t("lastLogin")}</TableHead>
                <TableHead className="px-4 py-3 font-medium w-[120px]">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-4 py-8 text-center">
                    {t("loadingEmployees")}
                  </TableCell>
                </TableRow>
              ) : paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleEmployeeDetail(employee.employeeId)}
                      >
                        {employee.employeeId}
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium">{employee.name}</TableCell>
                    <TableCell className="px-4 py-3">{employee.email}</TableCell>
                    <TableCell className="px-4 py-3">{employee.branch}</TableCell>
                    <TableCell className="px-4 py-3">{employee.department}</TableCell>
                    <TableCell className="px-4 py-3">{employee.designation}</TableCell>
                    <TableCell className="px-4 py-3">{formatDate(employee.dateOfJoining)}</TableCell>
                    <TableCell className="px-4 py-3">
                      {employee.lastLogin ? formatDateTime(employee.lastLogin) : "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          title={t("view")}
                          className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                          asChild
                        >
                          <Link href={`/hrm/employees/${employee.employeeId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title={t("edit")}
                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                          onClick={() => handleEditEmployee(employee.employeeId)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title={t("delete")}
                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                          onClick={() => openDeleteConfirm(employee.employeeId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="px-4 py-8 text-center">
                    {t("noEmployees")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("showing")} {startIndex + 1} {t("to")} {Math.min(endIndex, totalItems)} {t("of")} {totalItems} {t("entries")}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("rowsPerPage")}</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20 px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-[60px]">
                  <SelectItem value="5" className="justify-center">
                    5
                  </SelectItem>
                  <SelectItem value="10" className="justify-center">
                    10
                  </SelectItem>
                  <SelectItem value="20" className="justify-center">
                    20
                  </SelectItem>
                  <SelectItem value="50" className="justify-center">
                    50
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {t("page")} {currentPage} {t("of")} {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { setDeleteAlertOpen(open); if (!open) setDeleteEmployeeId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel type="button">{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => deleteEmployeeId && handleDeleteEmployee(deleteEmployeeId)}
            >
              <span>{t("delete") || "Delete"}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

// Export as default for better module resolution
export default EmployeeTable
