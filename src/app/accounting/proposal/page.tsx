
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const proposals = [
  {
    id: "PR-001",
    category: "General",
    issueDate: "2025-12-01",
    status: 0,
  },
  {
    id: "PR-002",
    category: "IT",
    issueDate: "2025-12-03",
    status: 2,
  },
  {
    id: "PR-003",
    category: "Marketing",
    issueDate: "2025-12-05",
    status: 1,
  },
];

const statusMap = [
  { label: "Draft", color: "primary" },
  { label: "Sent", color: "info" },
  { label: "Accepted", color: "success" },
  { label: "Declined", color: "warning" },
  { label: "Expired", color: "destructive" },
];

export default function ProposalPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Proposal</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="#">Export</Link>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href="/accounting/proposal/create">Create</Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col md:flex-row gap-4 md:items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input type="date" name="issue_date" className="w-48" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select name="status" defaultValue="">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  {statusMap.map((s, i) => (
                    <SelectItem key={i} value={String(i)}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="mt-2 md:mt-0">Apply</Button>
            <Button type="button" variant="destructive" className="mt-2 md:mt-0">Reset</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Proposal List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposal</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal, idx) => (
                <TableRow key={proposal.id}>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/accounting/proposal/${proposal.id}`}>{proposal.id}</Link>
                    </Button>
                  </TableCell>
                  <TableCell>{proposal.category}</TableCell>
                  <TableCell>{proposal.issueDate}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-${statusMap[proposal.status].color}/10 text-${statusMap[proposal.status].color}-700`}>
                      {statusMap[proposal.status].label}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="secondary" size="icon" title="Convert to Invoice">
                      <span className="sr-only">Convert</span>
                      <i className="ti ti-exchange" />
                    </Button>
                    <Button variant="secondary" size="icon" title="Duplicate">
                      <span className="sr-only">Duplicate</span>
                      <i className="ti ti-copy" />
                    </Button>
                    <Button variant="warning" size="icon" title="Show">
                      <span className="sr-only">Show</span>
                      <i className="ti ti-eye" />
                    </Button>
                    <Button variant="info" size="icon" title="Edit">
                      <span className="sr-only">Edit</span>
                      <i className="ti ti-pencil" />
                    </Button>
                    <Button variant="destructive" size="icon" title="Delete">
                      <span className="sr-only">Delete</span>
                      <i className="ti ti-trash" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
