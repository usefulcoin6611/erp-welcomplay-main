import Link from 'next/link'

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
  IconSearch,
} from '@tabler/icons-react'

// Mock debit notes similar to how debit/credit notes are handled in BillController
const debitNotes = [
  {
    id: 'DN-2025-001',
    date: '2025-11-09',
    vendor: 'PT Supply Berkah',
    billRef: 'BILL-2025-005',
    reason: 'Price adjustment for overbilled items',
    amount: 1500000,
    status: 'Applied',
  },
  {
    id: 'DN-2025-002',
    date: '2025-11-10',
    vendor: 'CV Logistik Nusantara',
    billRef: 'BILL-2025-006',
    reason: 'Return of damaged goods',
    amount: 950000,
    status: 'Pending',
  },
] as const

function getDebitListStatusClasses(status: string) {
  switch (status) {
    case 'Applied':
      return 'bg-green-100 text-green-700 border-none'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Draft':
      return 'bg-gray-100 text-gray-700 border-none'
    default:
      return 'bg-slate-100 text-slate-700 border-none'
  }
}

export default function DebitNotePage() {
  const totalNotes = debitNotes.length
  const totalAmount = debitNotes.reduce((sum, dn) => sum + dn.amount, 0)

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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Debit Notes</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                Create Debit Note
              </Button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Debit Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalNotes}</div>
                  <p className="text-xs text-muted-foreground">
                    All vendor debit notes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Debit Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Value of purchase adjustments
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Search and filter debit notes by status and vendor.
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
                      <Input placeholder="Search debit notes..." className="pl-10" />
                    </div>
                  </div>
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      Date
                    </label>
                    <Input type="date" />
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
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Debit notes table */}
            <Card>
              <CardHeader>
                <CardTitle>Debit Note List</CardTitle>
                <CardDescription>
                  Overview of all debit notes and adjustments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Debit Note</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Bill Ref</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debitNotes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell>
                          <Button
                            asChild
                            variant="link"
                            className="h-auto p-0 text-sm font-semibold"
                          >
                            <Link href={`/accounting/debit-note/${note.id}`}>
                              {note.id}
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{note.date}</span>
                          </div>
                        </TableCell>
                        <TableCell>{note.vendor}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-50 text-blue-700 border-none">
                            {note.billRef}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm" title={note.reason}>
                            {note.reason}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            Rp {note.amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDebitListStatusClasses(note.status)}>
                            {note.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-50 text-blue-700 border-none">
                            Detail
                          </Badge>
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

