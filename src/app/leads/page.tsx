'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
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
  IconCalendar,
  IconDownload,
  IconFileImport,
  IconPhone,
  IconPlus,
} from '@tabler/icons-react'
import { List, LayoutGrid, Search as SearchIcon, X, Eye, Pencil, MoreVertical, Trash2 } from 'lucide-react'

type Lead = {
  id: string
  name: string
  subject: string
  email: string
  phone: string
  pipeline: string
  stage: string
  owner: string
  createdAt: string
}

const leadsData: Lead[] = [
  {
    id: 'LEAD-001',
    name: 'PT Maju Jaya',
    subject: 'Implementasi ERP',
    email: 'contact@majujara.id',
    phone: '+62 21 555 1234',
    pipeline: 'Default Pipeline',
    stage: 'New',
    owner: 'Budi',
    createdAt: '2025-11-01',
  },
  {
    id: 'LEAD-002',
    name: 'CV Kreatif Digital',
    subject: 'Upgrade CRM',
    email: 'halo@kreatifdigital.co.id',
    phone: '+62 812 3456 7890',
    pipeline: 'Default Pipeline',
    stage: 'Qualified',
    owner: 'Sari',
    createdAt: '2025-11-03',
  },
  {
    id: 'LEAD-003',
    name: 'PT Sumber Makmur',
    subject: 'Integrasi POS',
    email: 'info@sumbermakmur.co.id',
    phone: '+62 31 567 8901',
    pipeline: 'Default Pipeline',
    stage: 'New',
    owner: 'Budi',
    createdAt: '2025-11-05',
  },
  {
    id: 'LEAD-004',
    name: 'UD Berkah Jaya',
    subject: 'Software Akuntansi',
    email: 'berkah@email.com',
    phone: '+62 812 9876 5432',
    pipeline: 'Default Pipeline',
    stage: 'Qualified',
    owner: 'Sari',
    createdAt: '2025-11-07',
  },
]

function getStageBadge(stage: string) {
  switch (stage) {
    case 'New':
      return 'bg-blue-100 text-blue-700 border-none'
    case 'Qualified':
      return 'bg-emerald-100 text-emerald-700 border-none'
    case 'Lost':
      return 'bg-red-100 text-red-700 border-none'
    default:
      return 'bg-gray-100 text-gray-700 border-none'
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function LeadsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    if (!search.trim()) return leadsData
    const q = search.trim().toLowerCase()
    return leadsData.filter(
      (lead) =>
        lead.name.toLowerCase().includes(q) ||
        lead.subject.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.owner.toLowerCase().includes(q) ||
        lead.id.toLowerCase().includes(q)
    )
  }, [search])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length
  const totalLeads = leadsData.length
  const stages = Array.from(new Set(leadsData.map((lead) => lead.stage)))
  const leadsByStage = stages.map((stage) => ({
    stage,
    leads: filteredData.filter((lead) => lead.stage === stage),
  }))

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
                  <CardTitle className="text-lg font-semibold">Leads</CardTitle>
                  <CardDescription>
                    Kelola dan pantau prospek Anda. Lihat status lead, pipeline, dan aktivitas terbaru.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="inline-flex rounded-md bg-muted p-0.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className={`h-7 w-7 shadow-none p-0 ${
                        viewMode === 'list'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setViewMode('list')}
                      title="List view"
                    >
                      <List className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className={`h-7 w-7 shadow-none p-0 border-l border-muted ${
                        viewMode === 'grid'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setViewMode('grid')}
                      title="Kanban view"
                    >
                      <LayoutGrid className="h-3 w-3" />
                    </Button>
                  </div>
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
                      <Button size="sm" variant="blue" className="shadow-none h-7 px-4">
                        <IconPlus className="mr-2 h-3 w-3" />
                        Create Lead
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                      <DialogTitle>Create Lead</DialogTitle>
                      <DialogDescription>
                        Masukkan informasi lead baru seperti di modul Leads ERP.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="Implementasi ERP" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Lead Name</Label>
                          <Input id="name" placeholder="PT Maju Jaya" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="contact@company.com" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" placeholder="+62 812 3456 7890" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="owner">Assigned User</Label>
                          <Input id="owner" placeholder="e.g. Budi" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" className="shadow-none">
                        Cancel
                      </Button>
                      <Button type="button" className="bg-blue-500 hover:bg-blue-600 shadow-none">
                        Save Lead
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">Total Leads</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{totalLeads}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                      <IconCalendar className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">This Month Total Leads</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{totalLeads}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <IconCalendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">This Week Total Leads</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{totalLeads}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                      <IconCalendar className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">Last 30 Days Total Leads</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{totalLeads}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                      <IconCalendar className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* List view */}
            {viewMode === 'list' ? (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                  <CardTitle>Lead List</CardTitle>
                  <div className="flex w-full max-w-md items-center gap-2">
                    <div className="relative flex-1">
                      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Search leads..."
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
                          <TableHead className="px-6">Lead</TableHead>
                          <TableHead className="px-6">Contact</TableHead>
                          <TableHead className="px-6">Pipeline / Stage</TableHead>
                          <TableHead className="px-6">Owner</TableHead>
                          <TableHead className="px-6">Created</TableHead>
                          <TableHead className="px-6">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.length > 0 ? (
                          paginatedData.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell className="px-6">
                                <div>
                                  <Link
                                    href={`/leads/${lead.id}`}
                                    className="font-normal text-sm hover:underline block"
                                  >
                                    {lead.name}
                                  </Link>
                                  <span className="text-xs text-muted-foreground">{lead.subject}</span>
                                  <span className="text-xs text-muted-foreground block">{lead.id}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex flex-col gap-1 text-sm">
                                  <span>{lead.email}</span>
                                  <div className="flex items-center gap-1">
                                    <IconPhone className="h-3 w-3" />
                                    <span>{lead.phone}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="space-y-1">
                                  <div className="text-sm text-muted-foreground">{lead.pipeline}</div>
                                  <Badge className={getStageBadge(lead.stage)}>{lead.stage}</Badge>
                                </div>
                              </TableCell>
                              <TableCell className="px-6">{lead.owner}</TableCell>
                              <TableCell className="px-6">
                                <div className="flex items-center gap-1 text-sm">
                                  <IconCalendar className="h-3 w-3" />
                                  <span>{formatDate(lead.createdAt)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex items-center gap-2 justify-start">
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                    title="View"
                                  >
                                    <Link href={`/leads/${lead.id}`}>
                                      <Eye className="h-3 w-3" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                    title="Edit"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="px-4 py-8 text-center text-muted-foreground"
                            >
                              No leads found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {totalRecords > 0 && (
                    <div className="px-6 py-3 border-t">
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
              /* Kanban view sesuai reference-erp */
              <>
                <div className="flex gap-4 overflow-x-auto pb-1">
                  {leadsByStage.map(({ stage, leads }) => (
                    <Card key={stage} className="min-w-[260px] max-w-sm flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <CardTitle className="text-sm font-medium">{stage}</CardTitle>
                            <CardDescription className="text-xs">
                              {leads.length} lead{leads.length !== 1 ? 's' : ''}
                            </CardDescription>
                          </div>
                          <Badge
                            variant="outline"
                            className={getStageBadge(stage) + ' text-[10px] px-2 py-0.5'}
                          >
                            {leads.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3 space-y-2 flex-1">
                        {leads.length > 0 ? (
                          leads.map((lead) => (
                            <div key={lead.id} className="rounded-md border bg-white p-3 space-y-3 shadow-xs">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <Link
                                    href={`/leads/${lead.id}`}
                                    className="text-sm font-medium leading-tight line-clamp-2 hover:underline"
                                  >
                                    {lead.name}
                                  </Link>
                                  <p className="text-[11px] text-muted-foreground">
                                    {lead.subject}
                                  </p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="shadow-none h-7 w-7 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/leads/${lead.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={getStageBadge(lead.stage)}>{lead.stage}</Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                  <IconPhone className="h-3 w-3" />
                                  {lead.phone}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                  {lead.email}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                  Owner {lead.owner}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                  <IconCalendar className="h-3 w-3" />
                                  {formatDate(lead.createdAt)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground py-3 text-center border border-dashed rounded-md">
                            No leads in this stage
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
