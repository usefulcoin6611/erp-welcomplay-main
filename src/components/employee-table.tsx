"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  MoreHorizontal,
  Plus,
  FileText,
  FileDown,
  FileUp,
  Search,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeft
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateEmployeeForm } from "@/components/create-employee-form"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

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

  // Mock data
  const employees: Employee[] = [
    {
      id: 1,
      employeeId: "EMP001",
      name: "John Doe",
      email: "john.doe@company.com",
      branch: "Main Branch",
      department: "IT Department",
      designation: "Software Engineer",
      dateOfJoining: "2024-01-15",
      lastLogin: "2024-10-31 09:30:00",
      isActive: true
    },
    {
      id: 2,
      employeeId: "EMP002",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      branch: "Main Branch",
      department: "HR Department",
      designation: "HR Manager",
      dateOfJoining: "2023-12-01",
      lastLogin: "2024-10-31 08:15:00",
      isActive: true
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Bob Johnson",
      email: "bob.johnson@company.com",
      branch: "Branch Office",
      department: "Sales Department",
      designation: "Sales Executive",
      dateOfJoining: "2024-02-20",
      lastLogin: "2024-10-30 17:45:00",
      isActive: true
    },
    {
      id: 4,
      employeeId: "EMP004",
      name: "Alice Brown",
      email: "alice.brown@company.com",
      branch: "Main Branch",
      department: "Finance Department",
      designation: "Accountant",
      dateOfJoining: "2024-03-10",
      lastLogin: "2024-10-31 10:20:00",
      isActive: false
    },
    {
      id: 5,
      employeeId: "EMP005",
      name: "Charlie Wilson",
      email: "charlie.wilson@company.com",
      branch: "Branch Office",
      department: "Marketing Department",
      designation: "Marketing Specialist",
      dateOfJoining: "2024-01-25",
      lastLogin: "2024-10-29 16:30:00",
      isActive: true
    }
  ]

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
      <TableHead>
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
    <Card>
      <CardHeader>
        {showCreateForm ? (
          // Header untuk Create Form
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">{t("createEmployee")}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToList")}
            </Button>
          </div>
        ) : (
          // Header untuk Table
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 border-0 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 focus-visible:border-0 shadow-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 shadow-none"
              >
                <FileUp className="mr-2 h-4 w-4" />
                {t("import")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 shadow-none"
              >
                <FileDown className="mr-2 h-4 w-4" />
                {t("export")}
              </Button>
              <Button
                size="sm"
                onClick={handleCreateEmployee}
                className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("create")}
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {showCreateForm ? (
          // Tampilkan Create Form
          <CreateEmployeeForm onClose={handleCreateFormClose} />
        ) : (
          // Tampilkan Table dan Pagination
          <>
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
              <TableHead>{t("lastLogin")}</TableHead>
              <TableHead>{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleEmployeeDetail(employee.employeeId)}
                    >
                      {employee.employeeId}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.branch}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{formatDate(employee.dateOfJoining)}</TableCell>
                  <TableCell>
                    {employee.lastLogin ? formatDateTime(employee.lastLogin) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {employee.isActive && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  {t("noEmployees")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4">
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
    </Card>
  )
}

// Export as default for better module resolution
export default EmployeeTable