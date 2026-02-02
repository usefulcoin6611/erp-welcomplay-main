"use client"

import { useState } from "react"
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
  ArrowLeft,
} from "lucide-react"
import { CreateEmployeeForm } from "@/components/create-employee-form"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { getEmployeesList } from "@/lib/employee-data"

interface Employee {
  id: number
  employeeId: string
  name: string
  email: string
  branch: string
  department: string
  designation: string
  dateOfJoining: string
  lastLogin: string
  isActive: boolean
}

// Employee Table Component
export function EmployeeTable() {
  const t = useTranslations("hrm.employee")
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [sortField, setSortField] = useState<keyof Employee | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null)

  // Mock data - dari lib/employee-data agar sinkron dengan detail & edit
  const [employees, setEmployees] = useState<Employee[]>(getEmployeesList())

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
      
      let aValue = a[sortField]
      let bValue = b[sortField]
      
      // Handle different data types
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
    setShowCreateForm(true)
  }

  const handleBackToList = () => {
    setShowCreateForm(false)
    setSearchTerm("")
    setCurrentPage(1)
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

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((e) => e.employeeId !== employeeId))
    setDeleteEmployeeId(null)
    setDeleteAlertOpen(false)
  }

  const handleCreateFormClose = () => {
    setShowCreateForm(false)
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
        {showCreateForm ? (
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base font-medium">{t("createEmployee")}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToList}
              className="h-9 shadow-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToList")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <CardTitle className="text-base font-medium shrink-0">{t("title")}</CardTitle>
            <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
              <Button variant="ghost" size="sm" className="h-9 px-4 shadow-none border-0 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900">
                <FileUp className="mr-2 h-4 w-4" />
                {t("import")}
              </Button>
              <Button variant="ghost" size="sm" className="h-9 px-4 shadow-none border-0 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900">
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
        )}
      </CardHeader>
      <CardContent className="p-0">
        {showCreateForm ? (
          <div className="px-4 py-4">
            <CreateEmployeeForm onClose={handleCreateFormClose} />
          </div>
        ) : (
          <>
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
            {paginatedEmployees.length > 0 ? (
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
                    {employee.lastLogin ? formatDateTime(employee.lastLogin) : '-'}
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
                  <SelectItem value="5" className="justify-center">5</SelectItem>
                  <SelectItem value="10" className="justify-center">10</SelectItem>
                  <SelectItem value="20" className="justify-center">20</SelectItem>
                  <SelectItem value="50" className="justify-center">50</SelectItem>
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
          </>
        )}
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