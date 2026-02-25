"use client"

import { useEffect, useMemo, useState } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconCalendar,
  IconPlus,
  IconEye,
  IconLayoutGrid,
  IconList,
  IconCopy,
  IconPencil,
  IconTrash,
  IconFileImport,
  IconDownload,
} from '@tabler/icons-react'
import { Search, X } from 'lucide-react'
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
import { type Contract } from '@/lib/contract-data'
import { toast } from "sonner"

type ContractItem = Contract

type ContractTypeOption = {
  id: string
  name: string
}

type CustomerOption = {
  id: string
  name: string
}

type ProjectOption = {
  id: string
  name: string
}

export default function ContractPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [contracts, setContracts] = useState<ContractItem[]>([])
  const [loading, setLoading] = useState(false)
  const [contractTypes, setContractTypes] = useState<ContractTypeOption[]>([])
  const [loadingContractTypes, setLoadingContractTypes] = useState(false)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editContract, setEditContract] = useState<ContractItem | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteContractId, setDeleteContractId] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createSubject, setCreateSubject] = useState("")
  const [createClientName, setCreateClientName] = useState("")
  const [createCustomerId, setCreateCustomerId] = useState("")
  const [createValue, setCreateValue] = useState("")
  const [createStartDate, setCreateStartDate] = useState("")
  const [createEndDate, setCreateEndDate] = useState("")
  const [createType, setCreateType] = useState("")
  const [createDescription, setCreateDescription] = useState("")
  const [createProjectId, setCreateProjectId] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/contracts")
        if (!res.ok) {
          toast.error("Gagal memuat data kontrak")
          return
        }
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setContracts(json.data)
        } else {
          toast.error(json.message || "Gagal memuat data kontrak")
        }
      } catch {
        toast.error("Terjadi kesalahan saat memuat data kontrak")
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [])

  useEffect(() => {
    const fetchContractTypes = async () => {
      try {
        setLoadingContractTypes(true)
        const res = await fetch("/api/contract-types", { cache: "no-store" })
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success || !Array.isArray(json.data)) {
          return
        }
        setContractTypes(json.data as ContractTypeOption[])
      } catch {
      } finally {
        setLoadingContractTypes(false)
      }
    }

    fetchContractTypes()
  }, [])

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true)
        const res = await fetch("/api/customers", { cache: "no-store" })
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success || !Array.isArray(json.data)) {
          return
        }
        const items = (json.data as any[]).map((c) => ({
          id: c.id as string,
          name: c.name as string,
        }))
        setCustomers(items)
      } catch {
      } finally {
        setLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true)
        const res = await fetch("/api/projects", { cache: "no-store" })
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success || !Array.isArray(json.data)) {
          return
        }
        const items = (json.data as any[]).map((p) => ({
          id: p.id as string,
          name: p.name as string,
        }))
        setProjects(items)
      } catch {
      } finally {
        setLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

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
  }, [search, contracts])

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

  const openEditDialog = (contract: Contract) => {
    setEditContract(contract)
    setEditDialogOpen(true)
  }

  const openDeleteConfirm = (id: string) => {
    setDeleteContractId(id)
    setDeleteAlertOpen(true)
  }

  const handleDelete = () => {
    // Mock: in real app would call API
    setDeleteContractId(null)
    setDeleteAlertOpen(false)
  }

  const handleCreateContract = async () => {
    if (
      !createSubject.trim() ||
      !createClientName.trim() ||
      !createValue.trim() ||
      !createStartDate ||
      !createEndDate ||
      !createType.trim() ||
      creating
    ) {
      return
    }

    try {
      setCreating(true)
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: createSubject.trim(),
          clientName: createClientName.trim(),
          value: Number(createValue),
          type: createType.trim(),
          startDate: createStartDate,
          endDate: createEndDate,
          description: createDescription.trim() || undefined,
          projectId: createProjectId.trim() || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal membuat kontrak")
        return
      }

      const created: ContractItem = json.data
      setContracts((prev) => [created, ...prev])
      setCreateSubject("")
      setCreateClientName("")
      setCreateCustomerId("")
      setCreateValue("")
      setCreateStartDate("")
      setCreateEndDate("")
      setCreateType("")
      setCreateDescription("")
      setCreateProjectId("")
      setCreateDialogOpen(false)
      toast.success("Kontrak berhasil dibuat")
    } catch {
      toast.error("Terjadi kesalahan saat membuat kontrak")
    } finally {
      setCreating(false)
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
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">Kontrak</CardTitle>
                  <CardDescription>
                    Kelola dan pantau kontrak Anda. Lihat detail kontrak, nilai kontrak, dan periode kontrak yang sedang berjalan.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View mode toggle (List / Grid) */}
                  <div className="inline-flex rounded-md bg-muted p-0.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      className={`h-7 w-7 shadow-none p-0 ${
                        viewMode === 'list'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setViewMode('list')}
                      title="List view"
                    >
                      <IconList className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      className={`h-7 w-7 shadow-none p-0 border-l border-muted ${
                        viewMode === 'grid'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setViewMode('grid')}
                      title="Grid view"
                    >
                      <IconLayoutGrid className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Action buttons - Import, Export, Add Contract */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                    title="Import"
                  >
                    <IconFileImport className="mr-2 h-3 w-3" />
                    Import
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                    title="Export"
                  >
                    <IconDownload className="mr-2 h-3 w-3" />
                    Export
                  </Button>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="blue" size="sm" className="shadow-none h-7 px-4">
                        <IconPlus className="mr-2 h-3 w-3" />
                        Add Contract
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
                            value={createSubject}
                            onChange={(e) => setCreateSubject(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="client">Client</Label>
                            <Select
                              value={createCustomerId}
                              onValueChange={(value) => {
                                setCreateCustomerId(value)
                                const selected = customers.find((c) => c.id === value)
                                setCreateClientName(selected?.name ?? "")
                              }}
                              disabled={loadingCustomers}
                            >
                              <SelectTrigger id="client" className="h-9">
                                <SelectValue placeholder={loadingCustomers ? "Loading..." : "Select client"} />
                              </SelectTrigger>
                              <SelectContent>
                                {customers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="value">Value</Label>
                            <Input
                              id="value"
                              type="number"
                              placeholder="350000000"
                              value={createValue}
                              onChange={(e) => setCreateValue(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="project">Project</Label>
                            <Select
                              value={createProjectId}
                              onValueChange={setCreateProjectId}
                              disabled={loadingProjects}
                            >
                              <SelectTrigger id="project" className="h-9">
                                <SelectValue placeholder={loadingProjects ? "Loading..." : "Select project"} />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={createStartDate}
                              onChange={(e) => setCreateStartDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={createEndDate}
                              onChange={(e) => setCreateEndDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="type">Contract Type</Label>
                          <Select
                            value={createType}
                            onValueChange={setCreateType}
                          >
                            <SelectTrigger id="type" className="h-9">
                              <SelectValue placeholder={loadingContractTypes ? "Loading..." : "Select contract type"} />
                            </SelectTrigger>
                            <SelectContent>
                              {contractTypes.map((type) => (
                                <SelectItem key={type.id} value={type.name}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            placeholder="Deskripsi singkat kontrak"
                            value={createDescription}
                            onChange={(e) => setCreateDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7"
                          onClick={() => setCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="blue"
                          size="sm"
                          className="shadow-none h-7"
                          disabled={
                            !createSubject.trim() ||
                            !createClientName.trim() ||
                            !createValue.trim() ||
                            !createStartDate ||
                            !createEndDate ||
                            !createType.trim() ||
                            creating
                          }
                          onClick={handleCreateContract}
                        >
                          {creating ? "Saving..." : "Save Contract"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Contract List / Grid */}
            {viewMode === 'list' ? (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                  <CardTitle>Contract List</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search contracts..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 h-9 w-[250px] bg-gray-50 border-gray-200 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6 w-[120px]">Contract ID</TableHead>
                          <TableHead className="px-6">Subject</TableHead>
                          <TableHead className="px-6">Client</TableHead>
                          <TableHead className="px-6">Project</TableHead>
                          <TableHead className="px-6">Type</TableHead>
                          <TableHead className="px-6 text-right">Value</TableHead>
                          <TableHead className="px-6">Start Date</TableHead>
                          <TableHead className="px-6">End Date</TableHead>
                          <TableHead className="px-6">Status</TableHead>
                          <TableHead className="px-6 w-[100px] text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={10} className="h-24 text-center">
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : paginatedData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="h-24 text-center">
                              No contracts found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedData.map((contract) => (
                            <TableRow key={contract.id}>
                              <TableCell className="px-6 font-medium">
                                <Link href={`/contract/${contract.id}`} className="text-blue-600 hover:underline">
                                  {contract.contractNumber}
                                </Link>
                              </TableCell>
                              <TableCell className="px-6">{contract.subject}</TableCell>
                              <TableCell className="px-6">{contract.client}</TableCell>
                              <TableCell className="px-6">{contract.project}</TableCell>
                              <TableCell className="px-6">
                                <Badge variant="outline" className="bg-gray-50">
                                  {contract.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6 text-right">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                }).format(contract.value)}
                              </TableCell>
                              <TableCell className="px-6">{contract.startDate}</TableCell>
                              <TableCell className="px-6">{contract.endDate}</TableCell>
                              <TableCell className="px-6">
                                <Badge
                                  variant="secondary"
                                  className={contract.status === 'accept' ? 'bg-green-100 text-green-700 hover:bg-green-100/80 border-0' : ''}
                                >
                                  {contract.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                    title="Edit"
                                    onClick={() => openEditDialog(contract)}
                                  >
                                    <IconPencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                    title="Delete"
                                    onClick={() => openDeleteConfirm(contract.id)}
                                  >
                                    <IconTrash className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="px-6 pb-6 pt-4 border-t">
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
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedData.map((contract) => (
                  <Card key={contract.id} className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold">
                          <Link href={`/contract/${contract.id}`} className="hover:underline">
                            {contract.subject}
                          </Link>
                        </CardTitle>
                        <CardDescription className="font-mono text-xs">
                          {contract.contractNumber}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className={contract.status === 'accept' ? 'bg-green-100 text-green-700 hover:bg-green-100/80 border-0' : ''}
                      >
                        {contract.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IconCalendar className="h-4 w-4" />
                          <span>{contract.startDate} - {contract.endDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client:</span>
                          <span className="font-medium">{contract.client}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Value:</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(contract.value)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                          onClick={() => openEditDialog(contract)}
                        >
                          <IconPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                          onClick={() => openDeleteConfirm(contract.id)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contract.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteContractId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
