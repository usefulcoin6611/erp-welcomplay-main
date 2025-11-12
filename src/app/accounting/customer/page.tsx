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
  IconMail,
  IconPhone,
  IconMapPin,
  IconFileText
} from '@tabler/icons-react'

// Mock data
const customers = [
  {
    id: 1,
    customerCode: 'CUST-001',
    name: 'PT Teknologi Digital Indonesia',
    email: 'admin@teknologidigital.co.id',
    phone: '+62 21 1234 5678',
    contact: 'Budi Santoso',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    city: 'Jakarta',
    country: 'Indonesia',
    totalInvoices: 15,
    totalSales: 245000000,
    lastInvoice: '2025-10-25',
    status: 'Active',
    taxNumber: '01.234.567.8-901.000',
    creditLimit: 500000000,
    paymentTerms: 'Net 30'
  },
  {
    id: 2,
    customerCode: 'CUST-002',
    name: 'CV Mitra Sejahtera',
    email: 'info@mitrasejahtera.com',
    phone: '+62 31 8765 4321',
    contact: 'Sari Wijaya',
    address: 'Jl. Raya Darmo No. 456, Surabaya',
    city: 'Surabaya',
    country: 'Indonesia',
    totalInvoices: 8,
    totalSales: 156000000,
    lastInvoice: '2025-10-22',
    status: 'Active',
    taxNumber: '02.345.678.9-012.000',
    creditLimit: 300000000,
    paymentTerms: 'Net 21'
  },
  {
    id: 3,
    customerCode: 'CUST-003',
    name: 'PT Global Solution',
    email: 'contact@globalsolution.id',
    phone: '+62 22 5555 6666',
    contact: 'Ahmad Fauzi',
    address: 'Jl. Asia Afrika No. 789, Bandung',
    city: 'Bandung',
    country: 'Indonesia',
    totalInvoices: 12,
    totalSales: 198000000,
    lastInvoice: '2025-10-20',
    status: 'Active',
    taxNumber: '03.456.789.0-123.000',
    creditLimit: 400000000,
    paymentTerms: 'Net 14'
  },
  {
    id: 4,
    customerCode: 'CUST-004',
    name: 'UD Berkah Jaya',
    email: 'berkah@jaya.co.id',
    phone: '+62 274 7777 8888',
    contact: 'Ibu Sinta',
    address: 'Jl. Malioboro No. 321, Yogyakarta',
    city: 'Yogyakarta',
    country: 'Indonesia',
    totalInvoices: 6,
    totalSales: 89000000,
    lastInvoice: '2025-10-18',
    status: 'Inactive',
    taxNumber: '04.567.890.1-234.000',
    creditLimit: 200000000,
    paymentTerms: 'Net 30'
  },
  {
    id: 5,
    customerCode: 'CUST-005',
    name: 'PT Maju Bersama',
    email: 'info@majubersama.com',
    phone: '+62 61 9999 0000',
    contact: 'Pak Rahman',
    address: 'Jl. Gatot Subroto No. 654, Medan',
    city: 'Medan',
    country: 'Indonesia',
    totalInvoices: 20,
    totalSales: 378000000,
    lastInvoice: '2025-10-28',
    status: 'Active',
    taxNumber: '05.678.901.2-345.000',
    creditLimit: 750000000,
    paymentTerms: 'Net 30'
  }
]

function getStatusBadge(status: string) {
  return (
    <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
      {status}
    </Badge>
  )
}

export default function CustomerPage() {
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'Active').length
  const totalSales = customers.reduce((sum, customer) => sum + customer.totalSales, 0)
  const totalInvoices = customers.reduce((sum, customer) => sum + customer.totalInvoices, 0)

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
                <h1 className="text-3xl font-bold">Customers</h1>
                <p className="text-muted-foreground">
                  Manage your customer database and sales relationships
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                      Enter the details of your new customer.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="customerCode">Customer Code</Label>
                        <Input id="customerCode" placeholder="CUST-006" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select defaultValue="active">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Company Name</Label>
                      <Input id="name" placeholder="e.g. PT Teknologi Digital" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="contact">Contact Person</Label>
                        <Input id="contact" placeholder="e.g. Budi Santoso" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" placeholder="+62 21 1234 5678" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="admin@company.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" placeholder="Complete address" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Jakarta" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Select defaultValue="indonesia">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="indonesia">Indonesia</SelectItem>
                            <SelectItem value="singapore">Singapore</SelectItem>
                            <SelectItem value="malaysia">Malaysia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="taxNumber">Tax Number</Label>
                        <Input id="taxNumber" placeholder="01.234.567.8-901.000" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="creditLimit">Credit Limit</Label>
                        <Input id="creditLimit" type="number" placeholder="500000000" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="paymentTerms">Payment Terms</Label>
                      <Select defaultValue="net30">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="net7">Net 7 days</SelectItem>
                          <SelectItem value="net14">Net 14 days</SelectItem>
                          <SelectItem value="net21">Net 21 days</SelectItem>
                          <SelectItem value="net30">Net 30 days</SelectItem>
                          <SelectItem value="cod">Cash on Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Customer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeCustomers} active customers
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp {totalSales.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    All time revenue
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalInvoices}</div>
                  <p className="text-xs text-muted-foreground">
                    Generated invoices
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {Math.round(totalSales / totalInvoices).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per invoice
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search customers..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-city">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-city">All Cities</SelectItem>
                  <SelectItem value="jakarta">Jakarta</SelectItem>
                  <SelectItem value="surabaya">Surabaya</SelectItem>
                  <SelectItem value="bandung">Bandung</SelectItem>
                  <SelectItem value="medan">Medan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Customer List</CardTitle>
                <CardDescription>
                  Manage and view all your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Sales Data</TableHead>
                      <TableHead>Payment Terms</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.customerCode}</div>
                            <div className="text-sm text-muted-foreground">{customer.contact}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <IconMail className="h-3 w-3" />
                              <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <IconPhone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <IconMapPin className="h-3 w-3" />
                            <div className="text-sm">
                              <div>{customer.city}</div>
                              <div className="text-muted-foreground">{customer.country}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">Rp {customer.totalSales.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.totalInvoices} invoices
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last: {customer.lastInvoice}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{customer.paymentTerms}</div>
                            <div className="text-xs text-muted-foreground">
                              Credit: Rp {customer.creditLimit.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(customer.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconFileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <IconTrash className="h-4 w-4" />
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