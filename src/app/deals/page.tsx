"use client"

import React, { useEffect, useMemo, useState } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  IconPlus,
  IconSearch,
  IconEye,
  IconPencil,
  IconTrash,
  IconDownload,
  IconLayoutKanban,
  IconList,
  IconFileImport,
  IconBookmark,
  IconDotsVertical,
  IconPhone,
} from '@tabler/icons-react'
import { X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from "sonner"

type DealLabel = {
  id: string
  name: string
  color: string
}

type DealUser = {
  id: string
  name: string
  avatar: string
}

type Deal = {
  id: string
  name: string
  client: string
  phone: string
  pipeline: string
  pipelineId: string
  stage: string
  price: number
  status: string
  createdAt: string
  tasks: {
    total: number
    completed: number
  }
  productsCount: number
  sourcesCount: number
  labels: DealLabel[]
  users: DealUser[]
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function getStageBadge(stage: string) {
  switch (stage) {
    case 'Proposal Sent':
      return 'bg-blue-100 text-blue-700 border-none'
    case 'Negotiation':
      return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Won':
      return 'bg-green-100 text-green-700 border-none'
    case 'Lost':
      return 'bg-red-100 text-red-700 border-none'
    default:
      return 'bg-gray-100 text-gray-700 border-none'
  }
}

function getLabelBadge(color: string) {
  switch (color) {
    case 'blue':
      return 'bg-blue-50 text-blue-700 border-blue-100'
    case 'purple':
      return 'bg-purple-50 text-purple-700 border-purple-100'
    case 'amber':
      return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'green':
      return 'bg-green-50 text-green-700 border-green-100'
    case 'red':
      return 'bg-red-50 text-red-700 border-red-100'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100'
  }
}

export default function DealsPage() {
  const { user } = useAuth()

  const [deals, setDeals] = useState<Deal[]>([])
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([])
  const [selectedPipeline, setSelectedPipeline] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newDealName, setNewDealName] = useState("")
  const [newClient, setNewClient] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
  
  const filteredDeals = useMemo(() => {
    let data = deals
    
    if (selectedPipeline) {
        data = data.filter(d => d.pipelineId === selectedPipeline)
    }

    if (!search.trim()) return data
    const q = search.trim().toLowerCase()
    return data.filter((deal) =>
      deal.name.toLowerCase().includes(q) ||
      deal.client.toLowerCase().includes(q) ||
      deal.stage.toLowerCase().includes(q) ||
      deal.id.toLowerCase().includes(q),
    )
  }, [search, deals, selectedPipeline])

  const paginatedDeals = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredDeals.slice(startIndex, startIndex + pageSize)
  }, [filteredDeals, currentPage, pageSize])

  const totalRecords = filteredDeals.length

  // Dynamic stages based on filtered deals to avoid hardcoded mismatch
  const stageOrder = useMemo(() => {
      return Array.from(new Set(filteredDeals.map(d => d.stage)))
  }, [filteredDeals])

  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {}
    for (const stage of stageOrder) {
      map[stage] = []
    }
    filteredDeals.forEach((deal) => {
      const key = stageOrder.includes(deal.stage) ? deal.stage : stageOrder[0] || 'Unassigned'
      ;(map[key] ?? (map[key] = [])).push(deal)
    })
    return map
  }, [filteredDeals, stageOrder])

  const totalDeals = deals.length
  const totalValue = deals.reduce((sum, d) => sum + d.price, 0)

  const loadDeals = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/deals", { cache: "no-store" })
      if (!res.ok) {
        return
      }
      const json = await res.json().catch(() => null)
      if (!json?.success || !Array.isArray(json.data)) {
        return
      }
      setDeals(json.data as Deal[])
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPipelines()
    loadDeals()
  }, [])

  const handleSaveDeal = async () => {
    if (!newDealName.trim()) {
      toast.error("Nama deal wajib diisi")
      return
    }
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDealName,
          client: newClient || null,
          phone: newPhone || null,
          price: newPrice || null,
          pipelineId: selectedPipeline || null,
        }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal menyimpan deal")
        return
      }

      const created = json.data as Deal
      setDeals((prev) => [created, ...prev])
      setIsDialogOpen(false)
      setNewDealName("")
      setNewClient("")
      setNewPrice("")
      setNewPhone("")
      toast.success("Deal berhasil dibuat")
    } catch {
      toast.error("Terjadi kesalahan sistem")
    }
  }

  const resetForm = () => {
      setNewDealName("")
      setNewClient("")
      setNewPrice("")
      setNewPhone("")
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
                  <CardTitle className="text-lg font-semibold">Penawaran</CardTitle>
                  <CardDescription>
                    Kelola dan pantau penawaran (deals) Anda. Lihat status penawaran, negosiasi, dan progress dari setiap deal yang sedang berjalan.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
                      <SelectTrigger className="h-7 w-[160px] shadow-none">
                        <SelectValue placeholder="Select Pipeline" />
                      </SelectTrigger>
                      <SelectContent>
                        {pipelines.map((pipeline) => (
                          <SelectItem key={pipeline.id} value={pipeline.id}>
                            {pipeline.name}
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
                        Create Deal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                      <DialogTitle>Create Deal</DialogTitle>
                      <DialogDescription>
                        Masukkan informasi deal baru seperti di modul Deals ERP.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Deal Name</Label>
                        <Input
                          id="name"
                          placeholder="Penawaran Proyek Website"
                          value={newDealName}
                          onChange={(e) => setNewDealName(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="client">Client Name</Label>
                          <Input
                            id="client"
                            placeholder="PT Maju Jaya"
                            value={newClient}
                            onChange={(e) => setNewClient(e.target.value)}
                          />
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
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="0"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                          <Label>Pipeline</Label>
                          <Input 
                            value={pipelines.find(p => p.id === selectedPipeline)?.name || "Default"}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Deal akan dibuat pada pipeline yang sedang aktif.
                          </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="blue" onClick={handleSaveDeal}>
                        Create Deal
                      </Button>
                    </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Content */}
            {viewMode === 'kanban' ? (
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-4 min-w-max pb-4">
                  {stageOrder.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground w-full">
                          Belum ada deal atau stage pada pipeline ini.
                      </div>
                  ) : (
                  dealsByStage && Object.entries(dealsByStage).map(([stage, items]) => (
                    <div key={stage} className="w-72 flex-shrink-0 flex flex-col gap-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                          {stage}
                        </h3>
                        <Badge variant="secondary" className="rounded-full px-2">
                          {items.length}
                        </Badge>
                      </div>
                      {items.map((deal) => (
                        <Card key={deal.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-3 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <Link href={`/deals/${deal.id}`} className="font-medium hover:underline block truncate">
                                  {deal.name}
                                </Link>
                                <p className="text-xs text-muted-foreground truncate">{deal.client}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 -mr-2">
                                    <IconDotsVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="space-y-2 pt-2 border-t">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium">Rp {deal.price.toLocaleString('id-ID')}</span>
                                <span className="text-muted-foreground">{formatDate(deal.createdAt)}</span>
                              </div>
                              {deal.phone && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <IconPhone className="h-3 w-3" />
                                  <span>{deal.phone}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex gap-1">
                                    {deal.labels.map(l => (
                                        <Badge key={l.id} variant="outline" className={`text-[10px] px-1 h-4 ${getLabelBadge(l.color)}`}>
                                            {l.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ))
                  )}
                </div>
              </div>
            ) : (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] flex-1">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                  <CardTitle>Deals List</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search deals..."
                        className="pl-9 h-9 w-[250px] bg-gray-50 border-gray-200 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6 w-[200px]">Deal Name</TableHead>
                          <TableHead className="px-6">Client</TableHead>
                          <TableHead className="px-6">Price</TableHead>
                          <TableHead className="px-6">Stage</TableHead>
                          <TableHead className="px-6">Phone</TableHead>
                          <TableHead className="px-6 w-[100px] text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : paginatedDeals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                              No deals found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedDeals.map((deal) => (
                            <TableRow key={deal.id}>
                              <TableCell className="px-6 font-medium">
                                <Link href={`/deals/${deal.id}`} className="hover:underline text-blue-600">
                                  {deal.name}
                                </Link>
                              </TableCell>
                              <TableCell className="px-6">{deal.client}</TableCell>
                              <TableCell className="px-6">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                }).format(deal.price)}
                              </TableCell>
                              <TableCell className="px-6">
                                <Badge variant="outline" className={getStageBadge(deal.stage)}>
                                  {deal.stage}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6">
                                {deal.phone ? (
                                  <div className="flex items-center gap-1.5">
                                    <IconPhone className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">{deal.phone}</span>
                                  </div>
                                ) : '-'}
                              </TableCell>
                              <TableCell className="px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                    title="Edit"
                                  >
                                    <IconPencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100"
                                    title="Delete"
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
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
