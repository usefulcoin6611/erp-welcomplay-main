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
  },
] as const

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
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 shadow-none"
                  >
                    <IconFilter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <DialogTrigger asChild>
                    <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                      <IconPlus className="mr-2 h-4 w-4" />
                      Create Deal
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

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Deals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDeals}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalValue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter deals berdasarkan tanggal dan status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1 min-w-0">
                    <label className="mb-1 block text-sm font-medium">
                      Search
                    </label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Search deals..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-40">
                    <label className="mb-1 block text-sm font-medium">
                      Created Date
                    </label>
                    <Input type="date" />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal List</CardTitle>
                <CardDescription>
                  Ringkasan deals per pipeline seperti di modul Deal ERP.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Pipeline / Stage</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <div className="font-semibold">
                            <Link
                              href={`/deals/${deal.id}`}
                              className="text-primary hover:underline"
                            >
                              {deal.name}
                            </Link>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {deal.id}
                          </div>
                        </TableCell>
                        <TableCell>{deal.client}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              {deal.pipeline}
                            </div>
                            <Badge className={getStageBadge(deal.stage)}>
                              {deal.stage}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {deal.price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{deal.createdAt}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 shadow-none"
                            >
                              <Link href={`/deals/${deal.id}`}>View</Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 shadow-none"
                            >
                              Edit
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

