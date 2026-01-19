'use client'

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  IconCalendar,
  IconDownload,
  IconEye,
  IconPlus,
  IconSearch,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"

// Mock proposal data
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
]

const statusMap: {
  [key: number]: { label: string }
} = {
  0: { label: "Draft" },
  1: { label: "Sent" },
  2: { label: "Accepted" },
  3: { label: "Declined" },
  4: { label: "Expired" },
}

function getProposalStatusClasses(status: number) {
  switch (status) {
    case 0: return "bg-blue-100 text-blue-700 border-none"
    case 1: return "bg-cyan-100 text-cyan-700 border-none"
    case 2: return "bg-green-100 text-green-700 border-none"
    case 3: return "bg-yellow-100 text-yellow-700 border-none"
    case 4: return "bg-red-100 text-red-700 border-none"
    default: return "bg-gray-100 text-gray-700 border-none"
  }
}

export function EstimateTab() {
  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" size="sm" className="shadow-none h-7">
          <IconDownload className="h-3 w-3" />
        </Button>
        <Button asChild variant="blue" size="sm" className="shadow-none h-7">
          <Link href="/accounting/proposal/create">
            <IconPlus className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter proposals by issue date and status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-sm font-medium">Search</label>
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input placeholder="Search proposals..." className="pl-10" />
              </div>
            </div>
            <div className="w-full md:w-44">
              <label className="mb-1 block text-sm font-medium">Issue Date</label>
              <Input type="date" name="issue_date" />
            </div>
            <div className="w-full md:w-40">
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusMap).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="blue" size="sm" className="shadow-none h-7">Apply</Button>
              <Button type="button" variant="outline" size="sm" className="shadow-none h-7">Reset</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Proposal list table */}
      <Card>
        <CardHeader>
          <CardTitle>Proposal List</CardTitle>
          <CardDescription>Overview of all proposals</CardDescription>
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
                    <Button asChild variant="outline" size="sm" className="shadow-none">
                      <Link href={`/accounting/proposal/${proposal.id}`}>{proposal.id}</Link>
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
                      <Button variant="secondary" size="sm" className="shadow-none h-7 bg-yellow-500 hover:bg-yellow-600 text-white" title="View" asChild>
                        <Link href={`/accounting/proposal/${proposal.id}`}>
                          <IconEye className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button variant="blue" size="sm" className="shadow-none h-7" title="Edit" asChild>
                        <Link href={`/accounting/proposal/${proposal.id}/edit`}>
                          <IconPencil className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm" className="shadow-none h-7" title="Delete">
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
  )
}
