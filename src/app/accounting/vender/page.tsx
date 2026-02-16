"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

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

type VendorRow = {
  id: string
  vendorCode: string
  name: string
  email: string
  phone: string
  city: string
  country: string
  balance: number
  taxNumber?: string
}

export default function VendorPage() {
  const [vendors, setVendors] = useState<VendorRow[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/vendors', { cache: 'no-store' })
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success || !Array.isArray(json.data)) {
          return
        }
        const mapped: VendorRow[] = json.data.map((v: any) => ({
          id: v.id as string,
          vendorCode: (v.vendorCode as string) ?? '',
          name: (v.name as string) ?? '',
          email: (v.email as string) ?? '',
          phone: (v.billingPhone as string) ?? (v.shippingPhone as string) ?? '',
          city: (v.billingCity as string) ?? '',
          country: (v.billingCountry as string) ?? '',
          balance: Number(v.balance) || 0,
          taxNumber: v.taxNumber ?? '',
        }))
        setVendors(mapped)
      } catch (error) {
        console.error('Error fetching vendors:', error)
      }
    }
    load()
  }, [])

  const filteredVendors = useMemo(() => {
    if (!search.trim()) return vendors
    const q = search.trim().toLowerCase()
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.vendorCode.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q)
    )
  }, [vendors, search])

  const totalVendors = filteredVendors.length
  const totalBalance = filteredVendors.reduce((sum, v) => sum + v.balance, 0)

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
                <h1 className="text-3xl font-bold">Vendors</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                Add Vendor
              </Button>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Vendors
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
                  Search and filter vendors.
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
                        placeholder="Search vendors..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Vendors table */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor List</CardTitle>
                <CardDescription>
                  Overview of all purchase vendors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>NPWP</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
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
                              {vendor.vendorCode || vendor.id}
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

