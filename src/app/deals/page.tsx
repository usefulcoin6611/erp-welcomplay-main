"use client"

import React, { useMemo, useState } from "react"
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
  IconFilter,
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
import { useAuth } from '@/contexts/auth-context'

const deals = [
  {
    id: 'DEAL-001',
    name: 'Implementasi ERP PT Maju Jaya',
    client: 'PT Maju Jaya',
    pipeline: 'Default Pipeline',
    stage: 'Proposal Sent',
    price: 350_000_000,
    status: 'Open',
    createdAt: '2025-11-02',
    tasks: { total: 5, completed: 3 },
    users: [
      { id: '1', name: 'John Doe', avatar: '' },
      { id: '2', name: 'Jane Smith', avatar: '' },
    ],
  },
  {
    id: 'DEAL-002',
    name: 'CRM Upgrade CV Kreatif Digital',
    client: 'CV Kreatif Digital',
    pipeline: 'Default Pipeline',
    stage: 'Negotiation',
    price: 180_000_000,
    status: 'Open',
    createdAt: '2025-11-05',
    tasks: { total: 8, completed: 2 },
    users: [
      { id: '3', name: 'Bob Johnson', avatar: '' },
    ],
  },
] as const

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

export default function DealsPage() {
  const { user } = useAuth()

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [search, setSearch] = useState('')
  const [selectedPipeline, setSelectedPipeline] = useState('default-pipeline')
  
  // Mock pipelines data - replace with actual data from API
  const pipelines = [
    { id: 'default-pipeline', name: 'Default Pipeline' },
    { id: 'sales-pipeline', name: 'Sales Pipeline' },
    { id: 'marketing-pipeline', name: 'Marketing Pipeline' },
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
  }, [search])

  const stageOrder = ['Proposal Sent', 'Negotiation', 'Won', 'Lost']

  const dealsByStage = useMemo(() => {
    const map: Record<string, typeof deals> = {}
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
            <div className="flex items-center justify-between gap-3">
              {/* Left side: Pipeline selector */}
              <div className="flex items-center gap-3">
                <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
                  <SelectTrigger className="h-7 w-[180px] shadow-none">
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
              </div>

              {/* Right side: View toggle and Actions */}
              <div className="flex items-center gap-3">
                {/* View mode toggle (Kanban / List) */}
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

                {/* Actions (Import / Download / Add) */}
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
                      <Button variant="blue" size="sm" className="shadow-none h-7">
                        <IconPlus className="h-3 w-3 mr-2" />
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
                            <Label htmlFor="price">Price</Label>
                            <Input
                              id="price"
                              type="number"
                              placeholder="350000000"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          className="shadow-none"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 shadow-none"
                        >
                          Save Deal
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Summary Cards - 4 cards like reference */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-lg">
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
              <Card className="rounded-lg">
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
              <Card className="rounded-lg">
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
              <Card className="rounded-lg">
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
                              className="rounded-md border bg-white p-3 space-y-2 shadow-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium leading-tight line-clamp-2">
                                    {deal.name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {deal.client}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-100"
                                >
                                  Rp {deal.price.toLocaleString()}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                <span>
                                  Tasks {deal.tasks.completed}/{deal.tasks.total}
                                </span>
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
                              <div className="flex items-center justify-end gap-1 pt-1">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-yellow-500 hover:bg-yellow-600 text-white"
                                  title="View"
                                  asChild
                                >
                                  <Link href={`/deals/${deal.id}`}>
                                    <IconEye className="h-3 w-3" />
                                  </Link>
                                </Button>
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
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4 py-3">Name</TableHead>
                        <TableHead className="px-4 py-3">Price</TableHead>
                        <TableHead className="px-4 py-3">Stage</TableHead>
                        <TableHead className="px-4 py-3">Tasks</TableHead>
                        <TableHead className="px-4 py-3">Users</TableHead>
                        <TableHead className="px-4 py-3">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeals.map((deal) => (
                        <TableRow key={deal.id}>
                          <TableCell className="px-4 py-3 font-medium">
                            {deal.name}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            Rp {deal.price.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge className={getStageBadge(deal.stage)}>
                              {deal.stage}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {deal.tasks.completed}/{deal.tasks.total}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex -space-x-2">
                              {deal.users.map((user) => (
                                <Avatar
                                  key={user.id}
                                  className="h-6 w-6 border-2 border-background"
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
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2 justify-start">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="shadow-none h-7 bg-yellow-500 hover:bg-yellow-600 text-white"
                                title="View"
                                asChild
                              >
                                <Link href={`/deals/${deal.id}`}>
                                  <IconEye className="h-3 w-3" />
                                </Link>
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                                title="Edit"
                              >
                                <IconPencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="shadow-none h-7"
                                title="Delete"
                              >
                                <IconTrash className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

