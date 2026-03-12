
import React from "react"
import Link from "next/link"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainContentWrapper } from "@/components/main-content-wrapper"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  IconCalendar,
  IconDownload,
  IconEye,
  IconPlus,
  IconSearch,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"

// Mock proposal data, modeled after the reference ERP but adapted to this UI
const proposals = [
  {
    id: "PR-2025-001",
    customer: "PT Teknologi Digital Indonesia",
    category: "Income",
    issueDate: "2025-12-01",
    status: 0, // Draft
    total: 12500000,
  },
  {
    id: "PR-2025-002",
    customer: "CV Mitra Sejahtera",
    category: "Income",
    issueDate: "2025-12-03",
    status: 2, // Accepted
    total: 9800000,
  },
  {
    id: "PR-2025-003",
    customer: "PT Global Solution",
    category: "Income",
    issueDate: "2025-12-05",
    status: 1, // Sent
    total: 15750000,
  },
] as const

// Simplified mirror of Laravel's Proposal::$statues
const statusMap: {
  [key: number]: {
    label: string
  }
} = {
  0: { label: "Draft" },
  1: { label: "Sent" },
  2: { label: "Accepted" },
  3: { label: "Declined" },
  4: { label: "Expired" },
}

function getProposalStatusClasses(status: number) {
  switch (status) {
    case 0: // Draft
      return "bg-blue-100 text-blue-700 border-none"
    case 1: // Sent
      return "bg-cyan-100 text-cyan-700 border-none"
    case 2: // Accepted
      return "bg-green-100 text-green-700 border-none"
    case 3: // Declined
      return "bg-yellow-100 text-yellow-700 border-none"
    case 4: // Expired
      return "bg-red-100 text-red-700 border-none"
    default:
      return "bg-gray-100 text-gray-700 border-none"
  }
}

export default function ProposalPage() {
  const totalProposals = proposals.length
  const acceptedProposals = proposals.filter((p) => p.status === 2)
  const draftProposals = proposals.filter((p) => p.status === 0)

  const totalValue = proposals.reduce((sum, p) => sum + p.total, 0)
  const acceptedValue = acceptedProposals.reduce((sum, p) => sum + p.total, 0)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-end">
              <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="shadow-none h-7"
          >
            <IconDownload className="h-3 w-3" />
          </Button>
          <Button
            asChild
            variant="blue"
            size="sm"
            className="shadow-none h-7"
          >
            <Link href="/accounting/proposal/create">
              <IconPlus className="mr-2 h-4 w-4" /> Create
            </Link>
          </Button>
        </div>
      </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Proposals
                  </CardTitle>
                  <CardDescription>All proposal documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProposals}</div>
                  <p className="text-xs text-muted-foreground">
                    Overall count of proposals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Accepted Value
                  </CardTitle>
                  <CardDescription>Converted / ready to invoice</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {acceptedValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {acceptedProposals.length} accepted proposals
                  </p>
                </CardContent>
              </Card>

      <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Draft Proposals
                  </CardTitle>
                  <CardDescription>Not yet sent to customer</CardDescription>
        </CardHeader>
        <CardContent>
                  <div className="text-2xl font-bold">
                    {draftProposals.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {draftProposals.length} in draft status
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters (search + issue date + status) */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Search and filter proposals by issue date and status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1 min-w-0">
                    <label className="mb-1 block text-sm font-medium">
                      Search
                    </label>
                    <div className="relative">
                      <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input placeholder="Search proposals..." className="pl-10 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors" />
                    </div>
                  </div>
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      Issue Date
                    </label>
                    <Input type="date" name="issue_date" />
                  </div>
                  <div className="w-full md:w-40">
                    <label className="mb-1 block text-sm font-medium">
                      Status
                    </label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(statusMap).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="blue"
                      size="sm"
                      className="shadow-none h-7"
                    >
                      Apply
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shadow-none h-7"
                    >
                      Reset
                    </Button>
                  </div>
          </form>
        </CardContent>
      </Card>

            {/* Proposal list table */}
      <Card>
        <CardHeader>
          <CardTitle>Proposal List</CardTitle>
                <CardDescription>
                  Overview of all proposals, similar to the ERP list page.
                </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposal</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="shadow-none"
                    >
                      <Link href={`/accounting/proposal/${proposal.id}`}>
                        {proposal.id}
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell>{proposal.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <IconCalendar className="h-3 w-3" />
                      <span>{proposal.issueDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getProposalStatusClasses(proposal.status)}>
                      {statusMap[proposal.status].label}
                    </Badge>
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
                        <Link href={`/accounting/proposal/${proposal.id}`}>
                          <IconEye className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        variant="blue"
                        size="sm"
                        className="shadow-none h-7"
                        title="Edit"
                        asChild
                      >
                        <Link href={`/accounting/proposal/${proposal.id}/edit`}>
                          <IconPencil className="h-3 w-3" />
                        </Link>
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
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
