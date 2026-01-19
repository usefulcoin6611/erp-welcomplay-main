'use client'

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
]

function getStatusBadge(status: string) {
  const classes =
    status === 'Active'
      ? 'bg-green-100 text-green-700 border-none'
      : 'bg-gray-100 text-gray-700 border-none'

  return <Badge className={classes}>{status}</Badge>
}

export function CustomerTab() {
  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7">
              <IconPlus className="h-3 w-3 mr-2" />
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
            </div>
            <DialogFooter>
              <Button variant="outline" className="shadow-none">
                Cancel
              </Button>
              <Button variant="blue" className="shadow-none">
                Create Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter customers by status and city.
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
                  placeholder="Search customers..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="mb-1 block text-sm font-medium">
                Status
              </label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="mb-1 block text-sm font-medium">
                City
              </label>
              <Select defaultValue="all-city">
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
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
          </form>
        </CardContent>
      </Card>

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
  )
}
