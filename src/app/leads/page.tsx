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
  IconPhone,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'

const leads = [
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
] as const

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

export default function LeadsPage() {
  const totalLeads = leads.length

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
                <h1 className="text-3xl font-bold">Leads</h1>
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
                      Create Lead
                    </Button>
                  </DialogTrigger>
                </div>
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
                      <Input
                        id="subject"
                        placeholder="Implementasi ERP"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Lead Name</Label>
                        <Input
                          id="name"
                          placeholder="PT Maju Jaya"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="contact@company.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          placeholder="+62 812 3456 7890"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="owner">Assigned User</Label>
                        <Input
                          id="owner"
                          placeholder="e.g. Budi"
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
                      Save Lead
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLeads}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Cari lead berdasarkan nama, subject, atau owner.
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
                        placeholder="Search leads..."
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
                <CardTitle>Lead List</CardTitle>
                <CardDescription>
                  Ringkasan lead dari pipeline default, mirip tampilan index ERP.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Pipeline / Stage</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="font-semibold">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="text-primary hover:underline"
                            >
                              {lead.name}
                            </Link>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lead.subject}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lead.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <span>{lead.email}</span>
                            <div className="flex items-center gap-1">
                              <IconPhone className="h-3 w-3" />
                              <span>{lead.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              {lead.pipeline}
                            </div>
                            <Badge className={getStageBadge(lead.stage)}>
                              {lead.stage}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{lead.owner}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{lead.createdAt}</span>
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
                              <Link href={`/leads/${lead.id}`}>View</Link>
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

