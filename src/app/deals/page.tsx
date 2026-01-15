import React from "react"
import Link from "next/link"
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
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
} from '@tabler/icons-react'

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Deals</h1>
              </div>
              <Dialog>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-none h-7"
                  >
                    <IconDownload className="h-3 w-3" />
                  </Button>
                  <DialogTrigger asChild>
                    <Button variant="blue" size="sm" className="shadow-none h-7">
                      <IconPlus className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                </div>
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

            {/* Summary Cards - 4 cards like reference */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Deals</p>
                      <h3 className="text-2xl font-bold">{totalDeals}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <IconCalendar className="h-5 w-5 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">This Month Total Deals</p>
                      <h3 className="text-2xl font-bold">{totalDeals}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <IconCalendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">This Week Total Deals</p>
                      <h3 className="text-2xl font-bold">{totalDeals}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <IconCalendar className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Last 30 Days Total Deals</p>
                      <h3 className="text-2xl font-bold">{totalDeals}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <IconCalendar className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deal List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">
                          {deal.name}
                        </TableCell>
                        <TableCell>
                          Rp {deal.price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStageBadge(deal.stage)}>
                            {deal.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {deal.tasks.completed}/{deal.tasks.total}
                        </TableCell>
                        <TableCell>
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
                        <TableCell>
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

