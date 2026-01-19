'use client'

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  IconPlus, 
  IconEdit, 
  IconTrash,
  IconEye,
  IconSearch,
  IconDownload,
  IconSend,
  IconCalendar,
  IconFileText,
  IconPrinter
} from '@tabler/icons-react'

// Mock data
const invoices = [
  {
    id: 'INV-2025-001',
    customer: 'PT Teknologi Digital Indonesia',
    issueDate: '2025-10-25',
    dueDate: '2025-11-25',
    amount: 15000000,
    tax: 1500000,
    total: 16500000,
    status: 'Paid',
    paymentDate: '2025-10-28',
    description: 'Website Development Services',
  },
  {
    id: 'INV-2025-002',
    customer: 'CV Mitra Sejahtera',
    issueDate: '2025-10-22',
    dueDate: '2025-11-22',
    amount: 8500000,
    tax: 850000,
    total: 9350000,
    status: 'Pending',
    paymentDate: null,
    description: 'Software Licensing',
  },
]

const customers = [
  'PT Teknologi Digital Indonesia',
  'CV Mitra Sejahtera', 
  'PT Global Solution',
]

function getStatusClasses(status: string) {
  switch (status) {
    case 'Paid': return 'bg-green-100 text-green-700 border-none'
    case 'Pending': return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Overdue': return 'bg-red-100 text-red-700 border-none'
    case 'Draft': return 'bg-gray-100 text-gray-700 border-none'
    default: return 'bg-slate-100 text-slate-700 border-none'
  }
}

export function InvoiceTab() {
  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7">
              <IconPlus className="h-3 w-3 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>Generate a new invoice for your customer.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer} value={customer.toLowerCase().replace(/\s+/g, '-')}>
                          {customer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input id="invoiceDate" type="date" defaultValue="2025-10-30" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="shadow-none">Save as Draft</Button>
              <Button variant="blue" className="shadow-none">Create & Send</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter invoices by status and customer.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-sm font-medium">Search</label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-10" />
              </div>
            </div>
            <div className="w-full md:w-40">
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select defaultValue="all-status">
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="mb-1 block text-sm font-medium">Customer</label>
              <Select defaultValue="all-customer">
                <SelectTrigger>
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-customer">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer} value={customer.toLowerCase().replace(/\s+/g, '-')}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>Manage and track all your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.id}</div>
                      <div className="text-sm text-muted-foreground">{invoice.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{invoice.customer}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      <span className="text-sm">{invoice.issueDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      <span className="text-sm">{invoice.dueDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">Rp {invoice.total.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Tax: Rp {invoice.tax.toLocaleString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusClasses(invoice.status)}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm"><IconEye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><IconEdit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><IconDownload className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><IconSend className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><IconPrinter className="h-4 w-4" /></Button>
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
