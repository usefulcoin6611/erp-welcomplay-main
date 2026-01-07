import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
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
    items: [
      { name: 'Website Development', qty: 1, price: 12000000 },
      { name: 'SEO Optimization', qty: 1, price: 3000000 }
    ]
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
    items: [
      { name: 'Software License', qty: 5, price: 1700000 }
    ]
  },
  {
    id: 'INV-2025-003',
    customer: 'PT Global Solution',
    issueDate: '2025-10-20',
    dueDate: '2025-11-20',
    amount: 12300000,
    tax: 1230000,
    total: 13530000,
    status: 'Overdue',
    paymentDate: null,
    description: 'Mobile App Development',
    items: [
      { name: 'Mobile App Development', qty: 1, price: 10000000 },
      { name: 'Testing & QA', qty: 1, price: 2300000 }
    ]
  },
  {
    id: 'INV-2025-004',
    customer: 'UD Berkah Jaya',
    issueDate: '2025-10-18',
    dueDate: '2025-11-18',
    amount: 6700000,
    tax: 670000,
    total: 7370000,
    status: 'Paid',
    paymentDate: '2025-10-25',
    description: 'POS System Implementation',
    items: [
      { name: 'POS Software', qty: 1, price: 5000000 },
      { name: 'Training', qty: 1, price: 1700000 }
    ]
  },
  {
    id: 'INV-2025-005',
    customer: 'PT Maju Bersama',
    issueDate: '2025-10-15',
    dueDate: '2025-11-15',
    amount: 9800000,
    tax: 980000,
    total: 10780000,
    status: 'Draft',
    paymentDate: null,
    description: 'ERP System Consultation',
    items: [
      { name: 'System Analysis', qty: 1, price: 4000000 },
      { name: 'Implementation Plan', qty: 1, price: 5800000 }
    ]
  }
]

const customers = [
  'PT Teknologi Digital Indonesia',
  'CV Mitra Sejahtera', 
  'PT Global Solution',
  'UD Berkah Jaya',
  'PT Maju Bersama'
]

function getStatusClasses(status: string) {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-700 border-none'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Overdue':
      return 'bg-red-100 text-red-700 border-none'
    case 'Draft':
      return 'bg-gray-100 text-gray-700 border-none'
    case 'Cancelled':
      return 'bg-slate-100 text-slate-700 border-none'
    default:
      return 'bg-slate-100 text-slate-700 border-none'
  }
}

export default function InvoicePage() {
  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter(i => i.status === 'Paid')
  const pendingInvoices = invoices.filter(i => i.status === 'Pending')
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue')
  
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const paidAmount = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + invoice.total, 0)

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Invoices</h1>
                <p className="text-muted-foreground">
                  Create, manage and track your invoices
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                    <IconPlus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Generate a new invoice for your customer.
                    </DialogDescription>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input id="dueDate" type="date" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select defaultValue="draft">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Invoice description or notes" />
                    </div>
                    
                    {/* Invoice Items */}
                    <div className="border rounded-lg p-4">
                      <Label className="text-base font-medium">Invoice Items</Label>
                      <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-12 gap-2 text-sm font-medium">
                          <div className="col-span-5">Item/Service</div>
                          <div className="col-span-2">Quantity</div>
                          <div className="col-span-3">Unit Price</div>
                          <div className="col-span-2">Total</div>
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                          <Input className="col-span-5" placeholder="Item description" />
                          <Input className="col-span-2" type="number" placeholder="1" defaultValue="1" />
                          <Input className="col-span-3" type="number" placeholder="0" />
                          <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                            Rp 0
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <IconPlus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                    
                    {/* Totals */}
                    <div className="border rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>Rp 0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (10%):</span>
                          <span>Rp 0</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>Rp 0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" className="shadow-none">
                      Save as Draft
                    </Button>
                    <Button className="bg-blue-500 hover:bg-blue-600 shadow-none">
                      Create & Send
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalInvoices}</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp {totalAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total invoiced
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Rp {paidAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {paidInvoices.length} paid invoices
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">Rp {pendingAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingInvoices.length + overdueInvoices.length} pending/overdue
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Search and filter invoices by status and customer.
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
                        placeholder="Search invoices..."
                        className="pl-10"
                      />
                    </div>
              </div>
                  <div className="w-full md:w-40">
                    <label className="mb-1 block text-sm font-medium">
                      Status
                    </label>
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
                    <label className="mb-1 block text-sm font-medium">
                      Customer
                    </label>
              <Select defaultValue="all-customer">
                      <SelectTrigger>
                        <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-customer">All Customers</SelectItem>
                  {customers.map((customer) => (
                          <SelectItem
                            key={customer}
                            value={customer.toLowerCase().replace(/\s+/g, '-')}
                          >
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
                <CardDescription>
                  Manage and track all your invoices
                </CardDescription>
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
                            <div className="text-xs text-muted-foreground">
                              Tax: Rp {invoice.tax.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusClasses(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconDownload className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconSend className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconPrinter className="h-4 w-4" />
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