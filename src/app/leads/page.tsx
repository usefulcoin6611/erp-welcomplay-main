'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
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
  IconLayoutKanban,
  IconList,
  IconPhone,
  IconPlus,
} from '@tabler/icons-react'
import { Search as SearchIcon, X, Eye, Pencil, MoreVertical, Trash2 } from 'lucide-react'
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
  stageId: string
  owner: string
  ownerId: string
  sources: string
  products: string
  notes: string
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
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [leads, setLeads] = useState<Lead[]>(emptyLeads)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  // Form fields
  const [formSubject, setFormSubject] = useState('')
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formPipelineId, setFormPipelineId] = useState('')
  const [formStageId, setFormStageId] = useState('')
  const [formOwnerId, setFormOwnerId] = useState('')
  const [formSources, setFormSources] = useState<string[]>([])
  const [formProducts, setFormProducts] = useState<string[]>([])
  const [formNotes, setFormNotes] = useState('')

  // Reference data
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([])
  const [stages, setStages] = useState<{ id: string; name: string; pipelineId: string }[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [selectedPipeline, setSelectedPipeline] = useState<string>('')

  // Source options (static)
  const SOURCE_OPTIONS = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Cold Call', 'Event', 'Partner', 'Other']

  const loadReferenceData = async () => {
    try {
      const [pipelineRes, userRes, productRes] = await Promise.all([
        fetch('/api/pipelines', { cache: 'no-store' }),
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/products', { cache: 'no-store' }),
      ])

      const [pipelineJson, userJson, productJson] = await Promise.all([
        pipelineRes.json().catch(() => null),
        userRes.json().catch(() => null),
        productRes.json().catch(() => null),
      ])

      if (pipelineJson?.success && Array.isArray(pipelineJson.data)) {
        setPipelines(pipelineJson.data)
        if (pipelineJson.data.length > 0 && !selectedPipeline) {
          const firstPipeline = pipelineJson.data[0]
          setSelectedPipeline(firstPipeline.id)
          setFormPipelineId(firstPipeline.id)
          // Load stages for first pipeline
          loadStages(firstPipeline.id)
        }
      }

      if (userJson?.success && Array.isArray(userJson.data)) {
        setUsers(userJson.data.map((u: any) => ({ id: u.id, name: u.name || u.email })))
      }

      if (productJson?.success && Array.isArray(productJson.data)) {
        setProducts(productJson.data.map((p: any) => ({ id: p.id, name: p.name })))
      }
    } catch {}
  }

  const loadStages = async (pipelineId: string) => {
    try {
      const res = await fetch(`/api/lead-stages?pipelineId=${pipelineId}`, { cache: 'no-store' })
      const json = await res.json().catch(() => null)
      if (json?.success && Array.isArray(json.data)) {
        // Add pipelineId to each stage for filtering in the select
        const stagesWithPipeline = json.data.map((s: any) => ({ ...s, pipelineId }))
        setStages(stagesWithPipeline)
        if (stagesWithPipeline.length > 0) {
          setFormStageId(stagesWithPipeline[0].id)
        }
      }
    } catch {}
  }

  const loadLeads = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/leads', { cache: 'no-store' })
      if (!res.ok) { setIsLoading(false); return }
      const json = await res.json().catch(() => null)
      if (!json?.success || !Array.isArray(json.data)) { setIsLoading(false); return }
      setLeads(json.data as Lead[])
    } catch {
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReferenceData()
    loadLeads()
  }, [])

  // When pipeline changes in form, reload stages
  const handleFormPipelineChange = (pipelineId: string) => {
    setFormPipelineId(pipelineId)
    setFormStageId('')
    loadStages(pipelineId)
  }

  const handleSaveLead = async () => {
    if (!formName.trim()) {
      toast.error('Name is required')
      return
    }
    try {
      const url = editingLead ? `/api/leads/${editingLead.id}` : '/api/leads'
      const method = editingLead ? 'PUT' : 'POST'
      
      const body: any = {
        name: formName,
        subject: formSubject || null,
        email: formEmail || null,
        phone: formPhone || null,
        pipelineId: formPipelineId || null,
        stageId: formStageId || null,
        ownerId: formOwnerId || null,
        sources: formSources.length > 0 ? formSources.join(',') : null,
        products: formProducts.length > 0 ? formProducts.join(',') : null,
        notes: formNotes || null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok || !json?.success) {
        toast.error(json?.message || 'Failed to save lead')
        return
      }

      const saved = json.data as Lead
      
      if (editingLead) {
        setLeads((prev) => prev.map((l) => (l.id === saved.id ? saved : l)))
        toast.success('Lead updated successfully')
      } else {
        setLeads((prev) => [saved, ...prev])
        toast.success('Lead created successfully')
      }
      
      setIsDialogOpen(false)
      resetForm()
    } catch {
      toast.error('System error occurred')
    }
  }

  const resetForm = () => {
    setEditingLead(null)
    setFormSubject('')
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormPipelineId(pipelines[0]?.id || '')
    setFormStageId('')
    setFormOwnerId('')
    setFormSources([])
    setFormProducts([])
    setFormNotes('')
  }

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead)
    setFormName(lead.name)
    setFormSubject(lead.subject)
    setFormEmail(lead.email)
    setFormPhone(lead.phone)
    setFormPipelineId(lead.pipelineId)
    setFormStageId(lead.stageId)
    setFormOwnerId(lead.ownerId)
    setFormSources(lead.sources ? lead.sources.split(',').filter(Boolean) : [])
    setFormProducts(lead.products ? lead.products.split(',').filter(Boolean) : [])
    setFormNotes(lead.notes)
    // Load stages for this pipeline
    if (lead.pipelineId) loadStages(lead.pipelineId)
    setIsDialogOpen(true)
  }

  const toggleSource = (source: string) => {
    setFormSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    )
  }

  const toggleProduct = (productName: string) => {
    setFormProducts(prev =>
      prev.includes(productName) ? prev.filter(p => p !== productName) : [...prev, productName]
    )
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
                      variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                      className={`h-7 w-7 shadow-none p-0 ${
                        viewMode === 'kanban'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setViewMode('kanban')}
                      title="Kanban view"
                    >
                      <IconLayoutKanban className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      className={`h-7 w-7 shadow-none p-0 border-l border-muted ${
                        viewMode === 'list'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setViewMode('list')}
                      title="List view"
                    >
                      <IconList className="h-3 w-3" />
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
                    <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingLead ? 'Edit Lead' : 'Create Lead'}</DialogTitle>
                        <DialogDescription>
                          {editingLead ? 'Update lead information.' : 'Fill in the lead details below.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {/* Row 1: Subject */}
                        <div className="grid gap-1.5">
                          <Label htmlFor="form-subject">Subject <span className="text-red-500">*</span></Label>
                          <Input
                            id="form-subject"
                            placeholder="e.g. ERP Implementation"
                            value={formSubject}
                            onChange={(e) => setFormSubject(e.target.value)}
                          />
                        </div>

                        {/* Row 2: User (Owner) */}
                        <div className="grid gap-1.5">
                          <Label htmlFor="form-owner">User <span className="text-red-500">*</span></Label>
                          <Select value={formOwnerId} onValueChange={setFormOwnerId}>
                            <SelectTrigger id="form-owner" className="shadow-none">
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((u) => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Row 3: Name */}
                        <div className="grid gap-1.5">
                          <Label htmlFor="form-name">Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="form-name"
                            placeholder="e.g. PT Maju Jaya"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                          />
                        </div>

                        {/* Row 4: Email */}
                        <div className="grid gap-1.5">
                          <Label htmlFor="form-email">Email <span className="text-red-500">*</span></Label>
                          <Input
                            id="form-email"
                            type="email"
                            placeholder="email@example.com"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                          />
                        </div>

                        {/* Row 5: Phone */}
                        <div className="grid gap-1.5">
                          <Label htmlFor="form-phone">Phone <span className="text-red-500">*</span></Label>
                          <Input
                            id="form-phone"
                            type="tel"
                            placeholder="+62 812 3456 7890"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                          />
                        </div>

                        {/* Row 6: Pipeline + Stage */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-1.5">
                            <Label htmlFor="form-pipeline">Pipeline <span className="text-red-500">*</span></Label>
                            <Select value={formPipelineId} onValueChange={handleFormPipelineChange}>
                              <SelectTrigger id="form-pipeline" className="shadow-none">
                                <SelectValue placeholder="Select pipeline" />
                              </SelectTrigger>
                              <SelectContent>
                                {pipelines.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-1.5">
                            <Label htmlFor="form-stage">Stage <span className="text-red-500">*</span></Label>
                            <Select value={formStageId} onValueChange={setFormStageId}>
                              <SelectTrigger id="form-stage" className="shadow-none">
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                              <SelectContent>
                                {stages.filter(s => !formPipelineId || s.pipelineId === formPipelineId).map((s) => (
                                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Row 7: Sources (multi-select chips) */}
                        <div className="grid gap-1.5">
                          <Label>Sources <span className="text-red-500">*</span></Label>
                          <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                            {SOURCE_OPTIONS.map((source) => (
                              <button
                                key={source}
                                type="button"
                                onClick={() => toggleSource(source)}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                                  formSources.includes(source)
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {source}
                              </button>
                            ))}
                          </div>
                          {formSources.length > 0 && (
                            <p className="text-xs text-muted-foreground">Selected: {formSources.join(', ')}</p>
                          )}
                        </div>

                        {/* Row 8: Products (multi-select chips) */}
                        <div className="grid gap-1.5">
                          <Label>Products <span className="text-red-500">*</span></Label>
                          <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] max-h-[100px] overflow-y-auto">
                            {products.length === 0 ? (
                              <span className="text-xs text-muted-foreground">No products available</span>
                            ) : (
                              products.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => toggleProduct(product.name)}
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                                    formProducts.includes(product.name)
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {product.name}
                                </button>
                              ))
                            )}
                          </div>
                          {formProducts.length > 0 && (
                            <p className="text-xs text-muted-foreground">Selected: {formProducts.join(', ')}</p>
                          )}
                        </div>

                        {/* Row 9: Notes (textarea) */}
                        <div className="grid gap-1.5">
                          <Label htmlFor="form-notes">Notes</Label>
                          <textarea
                            id="form-notes"
                            placeholder="Add notes about this lead..."
                            value={formNotes}
                            onChange={(e) => setFormNotes(e.target.value)}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
                                    className="shadow-none h-7 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                                    title="Edit"
                                    onClick={() => handleEditClick(lead)}
                                  >
                                    <Pencil className="h-3 w-3" />
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
