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
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  IconCalendar,
  IconDownload,
  IconFileImport,
  IconPhone,
  IconPlus,
} from '@tabler/icons-react'
import { List, LayoutGrid, Search as SearchIcon, X, Eye, Pencil } from 'lucide-react'

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
            {/* Header - sama seperti support: view toggle, Filter, Create */}
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
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
                    title="Grid view"
                  >
                    <LayoutGrid className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-none h-7"
                    title="Import"
                  >
                    <IconFileImport className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-none h-7"
                    title="Export"
                  >
                    <IconDownload className="h-3 w-3" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="blue" className="shadow-none h-7">
                        <IconPlus className="mr-2 h-4 w-4" />
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
              </div>
            </div>

            {/* List view */}
            {viewMode === 'list' ? (
              <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-0">
                  <div className="px-4 py-3 border-b flex items-center justify-between gap-4">
                    <CardTitle className="text-base font-medium">Lead List</CardTitle>
                    <div className="relative w-full max-w-sm">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search leads..."
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
                          <TableHead className="px-4 py-3 font-normal">Lead</TableHead>
                          <TableHead className="px-4 py-3 font-normal">Contact</TableHead>
                          <TableHead className="px-4 py-3 font-normal">Pipeline / Stage</TableHead>
                          <TableHead className="px-4 py-3 font-normal">Owner</TableHead>
                          <TableHead className="px-4 py-3 font-normal">Created</TableHead>
                          <TableHead className="px-4 py-3 font-normal">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.length > 0 ? (
                          paginatedData.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell className="px-4 py-3">
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
                              <TableCell className="px-4 py-3">
                                <div className="flex flex-col gap-1 text-sm">
                                  <span>{lead.email}</span>
                                  <div className="flex items-center gap-1">
                                    <IconPhone className="h-3 w-3" />
                                    <span>{lead.phone}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <div className="space-y-1">
                                  <div className="text-sm text-muted-foreground">{lead.pipeline}</div>
                                  <Badge className={getStageBadge(lead.stage)}>{lead.stage}</Badge>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3">{lead.owner}</TableCell>
                              <TableCell className="px-4 py-3">
                                <div className="flex items-center gap-1 text-sm">
                                  <IconCalendar className="h-3 w-3" />
                                  <span>{formatDate(lead.createdAt)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <div className="flex gap-1">
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="h-8 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                  >
                                    <Link href={`/leads/${lead.id}`}>
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                  >
                                    <Pencil className="h-3 w-3 mr-1" />
                                    Edit
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
            ) : (
              /* Grid view - card per lead seperti support */
              <>
                <div className="rounded-lg border bg-card px-4 py-3 flex items-center justify-between mb-4 border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                  <CardTitle className="text-base font-medium mb-0">Lead List</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((lead) => (
                      <Card
                        key={lead.id}
                        className="flex flex-col rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"
                      >
                        <CardContent className="p-4 flex flex-col flex-1">
                          <div className="flex flex-1 items-start gap-3 border-b pb-3 mb-3">
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/leads/${lead.id}`}
                                className="font-medium text-sm hover:underline block truncate"
                              >
                                {lead.name}
                              </Link>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {lead.subject}
                              </p>
                              <span className="text-xs text-muted-foreground">{lead.id}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 border-b pb-3 mb-3 text-sm">
                            <div className="flex items-center gap-1.5">
                              <IconPhone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{lead.phone}</span>
                            </div>
                            <span className="text-muted-foreground truncate block">{lead.email}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 border-b pb-3 mb-3 text-sm">
                            <span className="text-muted-foreground">Stage:</span>
                            <Badge className={getStageBadge(lead.stage)}>{lead.stage}</Badge>
                            <span className="text-muted-foreground">Owner:</span>
                            <span className="font-medium truncate max-w-[80px]">{lead.owner}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-auto">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <IconCalendar className="h-4 w-4" />
                              {formatDate(lead.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 w-7 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                title="View"
                                asChild
                              >
                                <Link href={`/leads/${lead.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 w-7 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground rounded-lg border border-dashed">
                      No leads found
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
                      onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
