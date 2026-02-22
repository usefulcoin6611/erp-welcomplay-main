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
  pipeline: string
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
  const [selectedPipeline, setSelectedPipeline] = useState('sales-pipeline')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newDealName, setNewDealName] = useState("")
  const [newClient, setNewClient] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock pipelines data - replace with actual data from API
  // Only show Sales and Marketing (without "Pipeline" text)
  const pipelines = [
    { id: 'sales-pipeline', name: 'Sales' },
    { id: 'marketing-pipeline', name: 'Marketing' },
  ]

  const filteredDeals = useMemo(() => {
    if (!search.trim()) return deals
    const q = search.trim().toLowerCase()
    return deals.filter((deal) =>
      deal.name.toLowerCase().includes(q) ||
      deal.client.toLowerCase().includes(q) ||
      deal.stage.toLowerCase().includes(q) ||
      deal.id.toLowerCase().includes(q),
    )
  }, [search, deals])

  const stageOrder = ['Proposal Sent', 'Negotiation', 'Won', 'Lost']

  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {}
    for (const stage of stageOrder) {
      map[stage] = []
    }
    filteredDeals.forEach((deal) => {
      const key = stageOrder.includes(deal.stage) ? deal.stage : 'Proposal Sent'
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
          price: newPrice || null,
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
      toast.success("Deal berhasil dibuat")
    } catch {
      toast.error("Terjadi kesalahan sistem")
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
                  <CardTitle className="text-lg font-semibold">Penawaran</CardTitle>
                  <CardDescription>
                    Kelola dan pantau penawaran (deals) Anda. Lihat status penawaran, negosiasi, dan progress dari setiap deal yang sedang berjalan.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {viewMode === 'kanban' && (
                    <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
                      <SelectTrigger className="h-7 w-[120px] shadow-none">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {pipelines.map((pipeline) => (
                          <SelectItem key={pipeline.id} value={pipeline.id}>
                            {pipeline.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
                  {user?.type !== 'client' && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="blue" size="sm" className="shadow-none h-7 px-4" title="Add Deal">
                          <IconPlus className="mr-2 h-3 w-3" />
                          Add Deal
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
                            <Label htmlFor="dealName">Deal Name</Label>
                            <Input
                              id="dealName"
                              placeholder="Implementasi ERP PT Maju Jaya"
                              value={newDealName}
                              onChange={(e) => setNewDealName(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="client">Client</Label>
                              <Input
                                id="client"
                                placeholder="PT Maju Jaya"
                                value={newClient}
                                onChange={(e) => setNewClient(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="price">Price</Label>
                              <Input
                                id="price"
                                type="number"
                                placeholder="350000000"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            className="shadow-none"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-600 shadow-none"
                            onClick={handleSaveDeal}
                          >
                            Save Deal
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Summary Cards - 4 cards like reference */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">Total Deals</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{totalDeals}</h3>
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
                      <p className="text-sm text-gray-600 font-medium">This Month Total Deals</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{totalDeals}</h3>
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
                      <p className="text-sm text-gray-600 font-medium">This Week Total Deals</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{totalDeals}</h3>
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
                      <p className="text-sm text-gray-600 font-medium">Last 30 Days Total Deals</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{totalDeals}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                      <IconCalendar className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deals content: Kanban or List view */}
            {viewMode === 'kanban' ? (
              <div className="flex gap-4 overflow-x-auto pb-1">
                {stageOrder.map((stage) => {
                  const stageDeals = dealsByStage[stage] ?? []
                  return (
                    <Card key={stage} className="min-w-[260px] max-w-sm flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <CardTitle className="text-sm font-medium">{stage}</CardTitle>
                            <CardDescription className="text-xs">
                              {stageDeals.length} deal
                              {stageDeals.length !== 1 ? 's' : ''}
                            </CardDescription>
                          </div>
                          <Badge
                            variant="outline"
                            className={getStageBadge(stage) + ' text-[10px] px-2 py-0.5'}
                          >
                            {stageDeals.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3 space-y-2 flex-1">
                        {stageDeals.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-3 text-center border border-dashed rounded-md">
                            No deals in this stage
                          </p>
                        ) : (
                          stageDeals.map((deal) => (
                            <div
                              key={deal.id}
                              className="rounded-md border bg-white p-3 space-y-3 shadow-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <Link
                                    href={`/deals/${deal.id}`}
                                    className="text-sm font-medium leading-tight line-clamp-2 hover:underline"
                                  >
                                    {deal.name}
                                  </Link>
                                  <p className="text-[11px] text-muted-foreground">
                                    {deal.client}
                                  </p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="shadow-none h-7 w-7 p-0"
                                      title="More options"
                                    >
                                      <IconDotsVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <IconBookmark className="mr-2 h-4 w-4" />
                                      Labels
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <IconPencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <IconTrash className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {deal.labels.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                  {deal.labels.map((label) => (
                                    <span
                                      key={label.id}
                                      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getLabelBadge(
                                        label.color,
                                      )}`}
                                    >
                                      {label.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                  Tasks {deal.tasks.completed}/{deal.tasks.total}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                  Rp {deal.price.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                  <span className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                    Product {deal.productsCount}
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                    Source {deal.sourcesCount}
                                  </span>
                                </div>
                                <div className="flex -space-x-1.5">
                                  {deal.users.map((user) => (
                                    <Avatar
                                      key={user.id}
                                      className="h-6 w-6 border-2 border-background"
                                      title={user.name}
                                    >
                                      <AvatarImage src={user.avatar} />
                                      <AvatarFallback className="text-[10px]">
                                        {getInitials(user.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                  <CardTitle>Deals List</CardTitle>
                  <div className="flex w-full max-w-md items-center gap-2">
                    <div className="relative flex-1">
                      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Search deals..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
                      />
                      {search.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                          onClick={() => setSearch('')}
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
                          <TableHead className="px-6">Name</TableHead>
                          <TableHead className="px-6">Price</TableHead>
                          <TableHead className="px-6">Stage</TableHead>
                          <TableHead className="px-6">Tasks</TableHead>
                          <TableHead className="px-6">Users</TableHead>
                          <TableHead className="px-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDeals.length > 0 ? (
                          filteredDeals.map((deal) => (
                            <TableRow key={deal.id}>
                              <TableCell className="px-6 font-medium">
                                {deal.name}
                              </TableCell>
                              <TableCell className="px-6">
                                Rp {deal.price.toLocaleString()}
                              </TableCell>
                              <TableCell className="px-6">
                                <Badge className={getStageBadge(deal.stage)}>
                                  {deal.stage}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6">
                                {deal.tasks.completed}/{deal.tasks.total}
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex -space-x-2">
                                  {deal.users.map((user) => (
                                    <Avatar
                                      key={user.id}
                                      className="h-9 w-9 border-2 border-white"
                                      title={user.name}
                                    >
                                      <AvatarImage src={user.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {getInitials(user.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex items-center gap-2 justify-start">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                    title="View"
                                    asChild
                                  >
                                    <Link href={`/deals/${deal.id}`}>
                                      <IconEye className="h-3 w-3" />
                                    </Link>
                                  </Button>
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
                                    className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                    title="Delete"
                                  >
                                    <IconTrash className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="px-6 text-center py-8 text-muted-foreground">
                              No deals found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

