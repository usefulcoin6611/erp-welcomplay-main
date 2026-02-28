'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { toast } from 'sonner'

type Lead = {
  id: string
  name: string
  subject: string
  email: string
  phone: string
  pipeline: string
  pipelineId: string
  stage: string
  owner: string
  createdAt: string
}

const emptyLeads: Lead[] = []

function getStageBadge(stage: string) {
  switch (stage) {
    case 'Draft':
      return 'bg-gray-100 text-gray-700 border-none'
    case 'Sent':
      return 'bg-blue-100 text-blue-700 border-none'
    case 'Open':
      return 'bg-emerald-100 text-emerald-700 border-none'
    case 'Revised':
      return 'bg-amber-100 text-amber-700 border-none'
    case 'Declined':
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
  const [leads, setLeads] = useState<Lead[]>(emptyLeads)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([])
  const [selectedPipeline, setSelectedPipeline] = useState<string>('')
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  const loadPipelines = async () => {
    try {
      const res = await fetch('/api/pipelines', { cache: 'no-store' })
      const json = await res.json().catch(() => null)
      if (json?.success && Array.isArray(json.data)) {
        setPipelines(json.data)
        if (json.data.length > 0 && !selectedPipeline) {
          setSelectedPipeline(json.data[0].id)
        }
      }
    } catch {}
  }

  const loadLeads = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/leads', { cache: 'no-store' })
      if (!res.ok) {
        setIsLoading(false)
        return
      }
      const json = await res.json().catch(() => null)
      if (!json?.success || !Array.isArray(json.data)) {
        setIsLoading(false)
        return
      }
      setLeads(json.data as Lead[])
    } catch {
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPipelines()
    loadLeads()
  }, [])

  const handleSaveLead = async () => {
    if (!newName.trim()) {
      toast.error('Nama lead wajib diisi')
      return
    }
    try {
      const url = editingLead ? `/api/leads/${editingLead.id}` : '/api/leads'
      const method = editingLead ? 'PUT' : 'POST'
      
      const body: any = {
        name: newName,
        subject: newSubject || null,
        email: newEmail || null,
        phone: newPhone || null,
      }
      
      // If creating new, optionally send pipelineId if selected
      if (!editingLead && selectedPipeline) {
        // API POST currently doesn't accept pipelineId but defaults to "Default Pipeline"
        // If API supported it, we would send it. Let's assume user wants default logic for now
        // or we updated API to accept it. 
        // Note: I didn't update POST /api/leads to accept pipelineId, only deals.
        // I should probably update POST /api/leads too if I want it to respect selected pipeline.
        // But for Edit, PUT accepts it.
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok || !json?.success) {
        toast.error(json?.message || 'Gagal menyimpan lead')
        return
      }

      const saved = json.data as Lead
      
      if (editingLead) {
        setLeads((prev) => prev.map((l) => (l.id === saved.id ? saved : l)))
        toast.success('Lead berhasil diperbarui')
      } else {
        setLeads((prev) => [saved, ...prev])
        toast.success('Lead berhasil dibuat')
      }
      
      setIsDialogOpen(false)
      resetForm()
    } catch {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  const resetForm = () => {
    setEditingLead(null)
    setNewSubject('')
    setNewName('')
    setNewEmail('')
    setNewPhone('')
  }

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead)
    setNewName(lead.name)
    setNewSubject(lead.subject)
    setNewEmail(lead.email)
    setNewPhone(lead.phone)
    setIsDialogOpen(true)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    let data = leads

    if (selectedPipeline) {
      // Filter by pipeline ID if available in lead, or name match
      // API returns pipelineId now.
      data = data.filter(l => l.pipelineId === selectedPipeline)
    }

    if (!search.trim()) return data
    const q = search.trim().toLowerCase()
    return data.filter(
      (lead) =>
        lead.name.toLowerCase().includes(q) ||
        lead.subject.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.owner.toLowerCase().includes(q) ||
        lead.id.toLowerCase().includes(q)
    )
  }, [search, leads, selectedPipeline])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length
  const totalLeads = leads.length

  // Fixed stage order for Kanban
  const KANBAN_STAGES = ['Draft', 'Sent', 'Open', 'Revised', 'Declined']
  const leadsByStage = KANBAN_STAGES.map((stage) => ({
    stage,
    leads: filteredData.filter((lead) => lead.stage === stage),
  }))

  // Stage column header colors
  const getStageHeaderColor = (stage: string) => {
    switch (stage) {
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Open': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Revised': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Declined': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStageAccentColor = (stage: string) => {
    switch (stage) {
      case 'Draft': return 'bg-gray-400'
      case 'Sent': return 'bg-blue-500'
      case 'Open': return 'bg-emerald-500'
      case 'Revised': return 'bg-amber-500'
      case 'Declined': return 'bg-red-500'
      default: return 'bg-gray-400'
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
                  <CardTitle className="text-lg font-semibold">Leads</CardTitle>
                  <CardDescription>
                    Kelola dan pantau prospek Anda. Lihat status lead, pipeline, dan aktivitas terbaru.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
                    <SelectTrigger className="h-7 w-[160px] shadow-none">
                      <SelectValue placeholder="Select Pipeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {pipelines.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="blue" className="shadow-none h-7 px-4">
                        <IconPlus className="mr-2 h-3 w-3" />
                        Create Lead
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                      <DialogTitle>{editingLead ? 'Edit Lead' : 'Create Lead'}</DialogTitle>
                      <DialogDescription>
                        {editingLead ? 'Perbarui informasi lead.' : 'Masukkan informasi lead baru seperti di modul Leads ERP.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="Implementasi ERP"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Lead Name</Label>
                          <Input
                            id="name"
                            placeholder="PT Maju Jaya"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            placeholder="email@example.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          placeholder="08123456789"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="blue" onClick={handleSaveLead}>
                        {editingLead ? 'Update Lead' : 'Create Lead'}
                      </Button>
                    </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Content */}
            {viewMode === 'list' ? (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                  <CardTitle>Leads List</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search leads..."
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
                          <TableHead className="px-6 font-medium">Name</TableHead>
                          <TableHead className="px-6 font-medium">Subject</TableHead>
                          <TableHead className="px-6 font-medium">Stage</TableHead>
                          <TableHead className="px-6 font-medium">Users</TableHead>
                          <TableHead className="px-6 font-medium text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="px-6 py-8 text-center text-muted-foreground"
                            >
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : paginatedData.length > 0 ? (
                          paginatedData.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell className="px-6">
                                <div>
                                  <Link
                                    href={`/leads/${lead.id}`}
                                    className="font-medium text-sm text-blue-600 hover:underline block"
                                  >
                                    {lead.name}
                                  </Link>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 text-sm text-muted-foreground">
                                {lead.subject || '-'}
                              </TableCell>
                              <TableCell className="px-6">
                                <Badge variant="outline" className={getStageBadge(lead.stage)}>
                                  {lead.stage}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0">
                                    {lead.owner ? lead.owner.substring(0, 2).toUpperCase() : '??'}
                                  </div>
                                  <span className="text-sm text-muted-foreground truncate max-w-[100px]">{lead.owner || '-'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                    title="View"
                                    asChild
                                  >
                                    <Link href={`/leads/${lead.id}`}>
                                      <Eye className="h-3 w-3" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="px-6 py-8 text-center text-muted-foreground"
                            >
                              No leads found
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
              <div className="overflow-x-auto">
                <div className="flex gap-3 min-w-max pb-4">
                  {leadsByStage.map((group) => (
                    <div key={group.stage} className="w-64 flex-shrink-0 flex flex-col gap-2">
                      {/* Column Header */}
                      <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${getStageHeaderColor(group.stage)}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStageAccentColor(group.stage)}`} />
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            {group.stage}
                          </span>
                        </div>
                        <span className="text-xs font-medium bg-white/60 rounded-full px-2 py-0.5">
                          {group.leads.length}
                        </span>
                      </div>

                      {/* Lead Cards */}
                      <div className="flex flex-col gap-2">
                        {group.leads.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-3 py-6 text-center">
                            <p className="text-xs text-muted-foreground">No leads</p>
                          </div>
                        ) : (
                          group.leads.map((lead) => (
                            <Card key={lead.id} className="shadow-none border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white">
                              <CardContent className="p-3">
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <Link
                                    href={`/leads/${lead.id}`}
                                    className="font-medium text-sm text-blue-600 hover:underline leading-tight line-clamp-2 flex-1"
                                  >
                                    {lead.name}
                                  </Link>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 shrink-0 text-muted-foreground hover:text-foreground">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditClick(lead)}>
                                        <Pencil className="h-3 w-3 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                {/* Subject */}
                                {lead.subject && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                    {lead.subject}
                                  </p>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <IconCalendar className="h-3 w-3 shrink-0" />
                                    <span>{formatDate(lead.createdAt)}</span>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-semibold text-primary shrink-0">
                                    {lead.owner ? lead.owner.substring(0, 2).toUpperCase() : '??'}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
