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
import { contracts, type Contract } from '@/lib/contract-data'

export default function ContractPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editContract, setEditContract] = useState<Contract | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteContractId, setDeleteContractId] = useState<string | null>(null)

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
                  <Dialog>
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
                          <div className="space-y-3">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" type="date" />
                          </div>
                          <div className="space-y-3">
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
              </CardHeader>
            </Card>

            {/* Contract List / Grid */}
            {viewMode === 'list' ? (
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                <CardTitle>Contract List</CardTitle>
                <div className="flex w-full max-w-md items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search contracts..."
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
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">#</TableHead>
                        <TableHead className="px-6">Subject</TableHead>
                        <TableHead className="px-6">Client</TableHead>
                        <TableHead className="px-6">Project</TableHead>
                        <TableHead className="px-6">Contract Type</TableHead>
                        <TableHead className="px-6">Contract Value</TableHead>
                        <TableHead className="px-6">Start Date</TableHead>
                        <TableHead className="px-6">End Date</TableHead>
                        <TableHead className="px-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((contract) => (
                          <TableRow key={contract.id}>
                            <TableCell className="px-6 font-medium">
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
                            <TableCell className="px-6">{contract.subject}</TableCell>
                            <TableCell className="px-6">{contract.client}</TableCell>
                            <TableCell className="px-6">{contract.project}</TableCell>
                            <TableCell className="px-6">{contract.type}</TableCell>
                            <TableCell className="px-6">
                              Rp {contract.value.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-6">
                              <div className="flex items-center gap-1 text-sm font-normal">
                                <IconCalendar className="h-3 w-3" />
                                <span>{contract.startDate}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6">
                              <div className="flex items-center gap-1 text-sm font-normal">
                                <IconCalendar className="h-3 w-3" />
                                <span>{contract.endDate}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6">
                              <div className="flex items-center gap-2 justify-start">
                                {contract.status === 'accept' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 w-7 p-0 bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                                    title="Duplicate"
                                  >
                                    <IconCopy className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                                  title="View"
                                  asChild
                                >
                                  <Link href={`/contract/${contract.id}`}>
                                    <IconEye className="h-3 w-3" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                  title="Edit"
                                  onClick={() => openEditDialog(contract)}
                                >
                                  <IconPencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  title="Delete"
                                  onClick={() => openDeleteConfirm(contract.id)}
                                >
                                  <IconTrash className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="px-6 text-center py-8 text-muted-foreground">
                            No contracts found
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
            ) : (
                /* Grid view: card ringkas & modern */
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((contract) => (
                        <Card key={contract.id} className="overflow-hidden rounded-xl border-0 p-0 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] transition-shadow">
                          <div className="bg-blue-50 px-4 py-3">
                            <Link href={`/contract/${contract.id}`} className="text-base font-normal leading-snug line-clamp-2 hover:text-primary block text-foreground">
                              {contract.subject}
                            </Link>
                          </div>
                          <div className="px-4 py-3">
                            <dl className="grid grid-cols-1 gap-2.5 text-xs">
                              <div className="flex justify-between gap-2">
                                <dt className="shrink-0 font-normal text-muted-foreground">Client</dt>
                                <dd className="truncate text-right font-normal text-foreground" title={contract.client}>{contract.client}</dd>
                              </div>
                              <div className="flex justify-between gap-2">
                                <dt className="shrink-0 font-normal text-muted-foreground">Project</dt>
                                <dd className="truncate text-right font-normal text-foreground/90" title={contract.project}>{contract.project === '-' ? '–' : contract.project}</dd>
                              </div>
                              <div className="flex justify-between gap-2">
                                <dt className="shrink-0 font-normal text-muted-foreground">Value</dt>
                                <dd className="text-right font-normal text-foreground">Rp {contract.value.toLocaleString()}</dd>
                              </div>
                              <div className="flex justify-between gap-2 pt-2 border-t border-border/50">
                                <dt className="shrink-0 font-normal text-muted-foreground">Period</dt>
                                <dd className="text-right font-normal text-foreground/85">{contract.startDate} → {contract.endDate}</dd>
                              </div>
                            </dl>
                            <div className="flex items-center justify-between mt-3 gap-1 flex-wrap">
                              <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0 rounded bg-muted/80 text-muted-foreground font-medium">
                                {contract.type}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {contract.status === 'accept' && (
                                  <Button variant="outline" size="sm" className="h-6 w-6 p-0 shadow-none bg-blue-500 text-white hover:bg-blue-600 border-blue-500" title="Duplicate">
                                    <IconCopy className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" className="h-6 w-6 p-0 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100" asChild title="View">
                                  <Link href={`/contract/${contract.id}`}>
                                    <IconEye className="h-3 w-3" />
                                  </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="h-6 w-6 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Edit" onClick={() => openEditDialog(contract)}>
                                  <IconPencil className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-6 w-6 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100" title="Delete" onClick={() => openDeleteConfirm(contract.id)}>
                                  <IconTrash className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center text-muted-foreground rounded-lg border border-dashed">
                        No contracts found
                      </div>
                    )}
                  </div>
                  {totalRecords > 0 && (
                    <div className="mt-4">
                      <SimplePagination
                        totalCount={totalRecords}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                      />
                    </div>
                  )}
                </>
            )}

            {/* Edit Contract dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditContract(null) }}>
              <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle>Edit Contract</DialogTitle>
                  <DialogDescription>
                    {editContract ? `Edit kontrak ${editContract.contractNumber}` : ''}
                  </DialogDescription>
                </DialogHeader>
                {editContract && (
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-subject">Subject</Label>
                      <Input id="edit-subject" defaultValue={editContract.subject} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-client">Client</Label>
                        <Input id="edit-client" defaultValue={editContract.client} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-value">Value</Label>
                        <Input id="edit-value" type="number" defaultValue={editContract.value} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="edit-startDate">Start Date</Label>
                        <Input id="edit-startDate" type="date" defaultValue={editContract.startDate} />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="edit-endDate">End Date</Label>
                        <Input id="edit-endDate" type="date" defaultValue={editContract.endDate} />
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" size="sm" className="shadow-none h-7" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="blue" size="sm" className="shadow-none h-7">
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { setDeleteAlertOpen(open); if (!open) setDeleteContractId(null) }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus kontrak?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Kontrak akan dihapus secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="shadow-none">Batal</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700 shadow-none" onClick={() => deleteContractId && handleDelete()}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

