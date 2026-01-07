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
  IconDownload,
  IconPlus,
} from '@tabler/icons-react'

const contracts = [
  {
    id: 'CTR-2025-001',
    subject: 'Implementasi ERP PT Maju Jaya',
    client: 'PT Maju Jaya',
    type: 'Implementation',
    value: 350_000_000,
    startDate: '2025-11-01',
    endDate: '2026-01-31',
    status: 'Active',
  },
  {
    id: 'CTR-2025-002',
    subject: 'Maintenance CRM CV Kreatif Digital',
    client: 'CV Kreatif Digital',
    type: 'Support',
    value: 120_000_000,
    startDate: '2025-11-10',
    endDate: '2026-11-09',
    status: 'Pending',
  },
] as const

function getStatusBadge(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700 border-none'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Expired':
      return 'bg-gray-100 text-gray-700 border-none'
    default:
      return 'bg-slate-100 text-slate-700 border-none'
  }
}

export default function ContractPage() {
  const totalContracts = contracts.length
  const totalValue = contracts.reduce((sum, c) => sum + c.value, 0)

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
                <h1 className="text-3xl font-bold">Contracts</h1>
              </div>
              <Dialog>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 shadow-none"
                  >
                    <IconDownload className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <DialogTrigger asChild>
                    <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                      <IconPlus className="mr-2 h-4 w-4" />
                      Create Contract
                    </Button>
                  </DialogTrigger>
                </div>
                <DialogContent className="sm:max-w-[560px]">
                  <DialogHeader>
                    <DialogTitle>Create Contract</DialogTitle>
                    <DialogDescription>
                      Masukkan informasi kontrak baru seperti di modul Contract ERP.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
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
                        <Label htmlFor="value">Value</Label>
                        <Input
                          id="value"
                          type="number"
                          placeholder="350000000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="date" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" type="date" />
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
                      Save Contract
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalContracts}
                  </div>
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
                  Filter contracts berdasarkan periode mulai.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      Start Date
                    </label>
                    <Input type="date" />
                  </div>
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      End Date
                    </label>
                    <Input type="date" />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract List</CardTitle>
                <CardDescription>
                  Ringkasan contracts mirip modul Contract ERP.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <div className="font-semibold">
                            <Link
                              href={`/contract/${contract.id}`}
                              className="text-primary hover:underline"
                            >
                              {contract.subject}
                            </Link>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {contract.id}
                          </div>
                        </TableCell>
                        <TableCell>{contract.client}</TableCell>
                        <TableCell>{contract.type}</TableCell>
                        <TableCell className="text-right">
                          Rp {contract.value.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <div className="flex items-center gap-1">
                              <IconCalendar className="h-3 w-3" />
                              <span>{contract.startDate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <IconCalendar className="h-3 w-3" />
                              <span>{contract.endDate}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusBadge(contract.status)}
                          >
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 shadow-none"
                            >
                              <Link href={`/contract/${contract.id}`}>
                                View
                              </Link>
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

