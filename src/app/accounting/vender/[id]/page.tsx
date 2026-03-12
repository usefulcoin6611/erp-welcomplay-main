'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'

type VendorDetailPageProps = {
  params: Promise<{ id: string }>
}

type VendorDetail = {
  code: string
  name: string
  email: string
  contact: string
  taxNumber: string
  balance: number
  createdAt?: string | null
  billing: {
    name: string
    address: string
    city: string
    state: string
    country: string
    phone: string
    zip: string
  }
  shipping: {
    name: string
    address: string
    city: string
    state: string
    country: string
    phone: string
    zip: string
  }
}

export default function VendorDetailPage({ params }: VendorDetailPageProps) {
  const router = useRouter()
  const [vendor, setVendor] = useState<VendorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { id } = await params
        const res = await fetch(`/api/vendors/${id}`)
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success || !json.data) {
          setError(json?.message || 'Gagal memuat data supplier')
          return
        }
        const v = json.data as any
        const billingName = v.billingName || v.name || ''
        const shippingName = v.shippingName || billingName
        setVendor({
          code: (v.vendorCode as string) ?? '',
          name: (v.name as string) ?? '',
          email: (v.email as string) ?? '',
          contact:
            (v.contact as string) ??
            (v.billingPhone as string) ??
            (v.shippingPhone as string) ??
            '',
          taxNumber: (v.taxNumber as string) ?? '',
          balance: Number(v.balance) || 0,
          createdAt: (v.createdAt as string) ?? null,
          billing: {
            name: billingName,
            address: (v.billingAddress as string) ?? '',
            city: (v.billingCity as string) ?? '',
            state: (v.billingState as string) ?? '',
            country: (v.billingCountry as string) ?? '',
            phone: (v.billingPhone as string) ?? '',
            zip: (v.billingZip as string) ?? '',
          },
          shipping: {
            name: shippingName,
            address: (v.shippingAddress as string) ?? (v.billingAddress as string) ?? '',
            city: (v.shippingCity as string) ?? (v.billingCity as string) ?? '',
            state: (v.shippingState as string) ?? (v.billingState as string) ?? '',
            country: (v.shippingCountry as string) ?? (v.billingCountry as string) ?? '',
            phone: (v.shippingPhone as string) ?? (v.billingPhone as string) ?? '',
            zip: (v.shippingZip as string) ?? (v.billingZip as string) ?? '',
          },
        })
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat data supplier')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
              <CardHeader className="px-6">
                <div className="flex items-center gap-4 w-full">
                  <div className="min-w-0 space-y-1 flex-1">
                    <CardTitle className="text-lg font-semibold truncate">
                      {vendor?.name || 'Vendor'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      Vendor Details for {vendor?.code || '-'}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-none h-8 px-3 bg-green-50 text-green-700 hover:bg-green-100 border-green-100"
                    >
                      Create Bill
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/accounting/purchases?tab=supplier')}
                      className="shadow-none h-8 w-8 p-0"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : error || !vendor ? (
              <div className="text-sm text-red-600">
                Error: {error || 'Vendor tidak ditemukan'}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-none border-gray-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Vendor Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="text-sm">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">{vendor.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.contact || '-'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none border-gray-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Billing Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p className="text-sm">{vendor.billing.name || vendor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.billing.address || '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.billing.city ? `${vendor.billing.city}, ` : ''}
                        {vendor.billing.state ? `${vendor.billing.state}, ` : ''}
                        {vendor.billing.zip || ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.billing.country || '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.billing.phone || '-'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none border-gray-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Shipping Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p className="text-sm">{vendor.shipping.name || vendor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.shipping.address || '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.shipping.city ? `${vendor.shipping.city}, ` : ''}
                        {vendor.shipping.state ? `${vendor.shipping.state}, ` : ''}
                        {vendor.shipping.zip || ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.shipping.country || '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.shipping.phone || '-'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-none border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Company Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Vendor Id
                        </p>
                        <p className="text-base font-normal">{vendor.code}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Date of Creation
                        </p>
                        <p className="text-base font-normal">
                          {vendor.createdAt
                            ? new Date(vendor.createdAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })
                            : '-'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Balance
                        </p>
                        <p className="text-base font-normal">
                          Rp {(vendor.balance || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Tax Number
                        </p>
                        <p className="text-base font-normal">
                          {vendor.taxNumber || '-'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Total Sum of Bills
                        </p>
                        <p className="text-base font-normal">
                          Rp {(0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Quantity of Bills
                        </p>
                        <p className="text-base font-normal">0</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Average Purchase
                        </p>
                        <p className="text-base font-normal">
                          Rp {(0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Overdue
                        </p>
                        <p className="text-base font-normal text-red-600">
                          Rp {(0).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Bills</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-gray-600">Bill</TableHead>
                          <TableHead className="text-gray-600">Bill Date</TableHead>
                          <TableHead className="text-gray-600">Due Date</TableHead>
                          <TableHead className="text-gray-600">Due Amount</TableHead>
                          <TableHead className="text-gray-600">Status</TableHead>
                          <TableHead className="text-right text-gray-600">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="hover:bg-gray-50 transition-colors">
                          <TableCell colSpan={6} className="text-center py-12">
                            <p className="text-sm text-muted-foreground">No bills found</p>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
