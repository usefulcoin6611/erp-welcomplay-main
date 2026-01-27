"use client"

import { useState, useMemo } from 'react'
import Link from "next/link"
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  IconCalendar,
  IconPlus,
  IconEye,
  IconLayoutGrid,
} from '@tabler/icons-react'
import { Search, X } from 'lucide-react'
import { SimplePagination } from '@/components/ui/simple-pagination'

interface Contract {
  id: string
  contractNumber: string
  subject: string
  client: string
  project: string
  type: string
  value: number
  startDate: string
  endDate: string
  status: string
}

const contracts: Contract[] = [
  {
    id: 'CTR-2025-001',
    contractNumber: 'CTR-001',
    subject: 'Implementasi ERP PT Maju Jaya',
    client: 'PT Maju Jaya',
    project: 'ERP Implementation Project',
    type: 'Implementation',
    value: 350_000_000,
    startDate: '2025-11-01',
    endDate: '2026-01-31',
    status: 'accept',
  },
  {
    id: 'CTR-2025-002',
    contractNumber: 'CTR-002',
    subject: 'Maintenance CRM CV Kreatif Digital',
    client: 'CV Kreatif Digital',
    project: '-',
    type: 'Support',
    value: 120_000_000,
    startDate: '2025-11-10',
    endDate: '2026-11-09',
    status: 'accept',
  },
  {
    id: 'CTR-2025-003',
    contractNumber: 'CTR-003',
    subject: 'Development Mobile App PT Teknologi',
    client: 'PT Teknologi',
    project: 'Mobile App Development',
    type: 'Development',
    value: 500_000_000,
    startDate: '2025-12-01',
    endDate: '2026-06-30',
    status: 'accept',
  },
  {
    id: 'CTR-2025-004',
    contractNumber: 'CTR-004',
    subject: 'Cloud Migration Services',
    client: 'PT Digital Solutions',
    project: 'Cloud Migration',
    type: 'Migration',
    value: 250_000_000,
    startDate: '2025-10-15',
    endDate: '2026-04-14',
    status: 'pending',
  },
  {
    id: 'CTR-2025-005',
    contractNumber: 'CTR-005',
    subject: 'Security Audit & Compliance',
    client: 'PT Keamanan Data',
    project: 'Security Audit',
    type: 'Audit',
    value: 180_000_000,
    startDate: '2025-09-01',
    endDate: '2025-12-31',
    status: 'accept',
  },
  {
    id: 'CTR-2025-006',
    contractNumber: 'CTR-006',
    subject: 'Database Optimization',
    client: 'CV Optimasi Sistem',
    project: '-',
    type: 'Optimization',
    value: 95_000_000,
    startDate: '2025-11-20',
    endDate: '2026-02-19',
    status: 'accept',
  },
  {
    id: 'CTR-2025-007',
    contractNumber: 'CTR-007',
    subject: 'E-Commerce Platform Development',
    client: 'PT Retail Online',
    project: 'E-Commerce Platform',
    type: 'Development',
    value: 750_000_000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'pending',
  },
  {
    id: 'CTR-2025-008',
    contractNumber: 'CTR-008',
    subject: 'IT Infrastructure Setup',
    client: 'PT Infrastruktur',
    project: 'Infrastructure Setup',
    type: 'Infrastructure',
    value: 420_000_000,
    startDate: '2025-10-01',
    endDate: '2026-03-31',
    status: 'accept',
  },
  {
    id: 'CTR-2025-009',
    contractNumber: 'CTR-009',
    subject: 'Training & Consultation',
    client: 'PT Pelatihan',
    project: '-',
    type: 'Training',
    value: 75_000_000,
    startDate: '2025-11-15',
    endDate: '2026-01-14',
    status: 'accept',
  },
  {
    id: 'CTR-2025-010',
    contractNumber: 'CTR-010',
    subject: 'System Integration Services',
    client: 'PT Integrasi Sistem',
    project: 'System Integration',
    type: 'Integration',
    value: 320_000_000,
    startDate: '2026-02-01',
    endDate: '2026-08-31',
    status: 'pending',
  },
]

export default function ContractPage() {
  // Search and pagination states
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return contracts
    
    const q = search.trim().toLowerCase()
    return contracts.filter(
      (contract) =>
        contract.contractNumber.toLowerCase().includes(q) ||
        contract.subject.toLowerCase().includes(q) ||
        contract.client.toLowerCase().includes(q) ||
        contract.project.toLowerCase().includes(q) ||
        contract.type.toLowerCase().includes(q)
    )
  }, [search])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Pagination calculations
  const totalRecords = filteredData.length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">
            <div className="flex items-center justify-end">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="shadow-none h-7"
                  title="Grid View"
                >
                  <IconLayoutGrid className="h-3 w-3" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="blue" size="sm" className="shadow-none h-7">
                      <IconPlus className="mr-2 h-3 w-3" /> Add Contract
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                      <DialogTitle>Create Contract</DialogTitle>
                      <DialogDescription>
                        Masukkan informasi kontrak baru seperti di modul Contract ERP.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="Implementasi ERP PT Maju Jaya"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="client">Client</Label>
                          <Input
                            id="client"
                            placeholder="PT Maju Jaya"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="value">Value</Label>
                          <Input
                            id="value"
                            type="number"
                            placeholder="350000000"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input id="startDate" type="date" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input id="endDate" type="date" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shadow-none h-7"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="blue"
                        size="sm"
                        className="shadow-none h-7"
                      >
                        Save Contract
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Contract List */}
            <Card>
              <CardContent className="p-0">
                {/* Title and Search - Top */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Contract List</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contracts..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                    />
                    {search.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => handleSearchChange('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-3 font-medium">#</TableHead>
                      <TableHead className="px-4 py-3 font-medium">Subject</TableHead>
                      <TableHead className="px-4 py-3 font-medium">Client</TableHead>
                      <TableHead className="px-4 py-3 font-medium">Project</TableHead>
                      <TableHead className="px-4 py-3 font-medium">Contract Type</TableHead>
                      <TableHead className="px-4 py-3 font-medium">Contract Value</TableHead>
                      <TableHead className="px-4 py-3 font-medium">Start Date</TableHead>
                      <TableHead className="px-4 py-3 font-medium">End Date</TableHead>
                      <TableHead className="px-4 py-3 font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="px-4 py-3">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="shadow-none"
                            >
                              <Link href={`/contract/${contract.id}`}>
                                {contract.contractNumber}
                              </Link>
                            </Button>
                          </TableCell>
                          <TableCell className="px-4 py-3 font-normal">
                            {contract.subject}
                          </TableCell>
                          <TableCell className="px-4 py-3 font-normal">{contract.client}</TableCell>
                          <TableCell className="px-4 py-3 font-normal">{contract.project}</TableCell>
                          <TableCell className="px-4 py-3 font-normal">{contract.type}</TableCell>
                          <TableCell className="px-4 py-3 font-normal">
                            Rp {contract.value.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm font-normal">
                              <IconCalendar className="h-3 w-3" />
                              <span>{contract.startDate}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm font-normal">
                              <IconCalendar className="h-3 w-3" />
                              <span>{contract.endDate}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="shadow-none h-7 bg-yellow-500 hover:bg-yellow-600 text-white"
                              title="View"
                              asChild
                            >
                              <Link href={`/contract/${contract.id}`}>
                                <IconEye className="h-3 w-3" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No contracts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
                {totalRecords > 0 && (
                  <div className="px-4 py-3 border-t">
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
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

