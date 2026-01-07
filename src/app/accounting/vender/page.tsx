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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  IconMail,
  IconPhone,
  IconSearch,
} from '@tabler/icons-react'

// Mock suppliers (vendors) similar to VenderController index/show
const vendors = [
  {
    id: 'VDR-001',
    name: 'PT Supply Berkah',
    email: 'vendor@supplyberkah.id',
    phone: '+62 21 5555 8888',
    city: 'Jakarta',
    country: 'Indonesia',
    balance: 150000000,
    taxNumber: '01.234.567.8-999.000',
  },
  {
    id: 'VDR-002',
    name: 'CV Logistik Nusantara',
    email: 'info@logistiknusantara.co.id',
    phone: '+62 31 7777 8888',
    city: 'Surabaya',
    country: 'Indonesia',
    balance: 85000000,
    taxNumber: '02.111.222.3-444.000',
  },
] as const

export default function VendorPage() {
  const totalVendors = vendors.length
  const totalBalance = vendors.reduce((sum, v) => sum + v.balance, 0)

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
                <h1 className="text-3xl font-bold">Suppliers</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                Add Supplier
              </Button>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Suppliers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVendors}</div>
                  <p className="text-xs text-muted-foreground">
                    Active purchase vendors
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Outstanding Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalBalance.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Combined vendor balances
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Search and filter suppliers.
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
                        placeholder="Search suppliers..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Suppliers table */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier List</CardTitle>
                <CardDescription>
                  Overview of all purchase vendors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>NPWP</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <div className="space-y-0.5">
                            <Link
                              href={`/accounting/vender/${vendor.id}`}
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              {vendor.name}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {vendor.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <IconMail className="h-3 w-3" />
                              <span>{vendor.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IconPhone className="h-3 w-3" />
                              <span>{vendor.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{vendor.city}</div>
                            <div className="text-muted-foreground">
                              {vendor.country}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            Rp {vendor.balance.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {vendor.taxNumber}
                          </span>
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

