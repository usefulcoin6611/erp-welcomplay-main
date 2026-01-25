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

type VendorDetailPageProps = {
  params: Promise<{ id: string }>
}

// Mock vendor detail based loosely on VenderController::show
const mockVendor = {
  code: 'VDR-001',
  name: 'PT Supply Berkah',
  email: 'vendor@supplyberkah.id',
  contact: '+62 21 5555 8888',
  taxNumber: '01.234.567.8-999.000',
  balance: 150000000,
  billing: {
    name: 'PT Supply Berkah',
    address: 'Jl. Industri No. 88, Jakarta Barat',
    city: 'Jakarta',
    state: 'DKI Jakarta',
    country: 'Indonesia',
    phone: '+62 21 5555 8888',
    zip: '11530',
  },
  shipping: {
    name: 'Gudang Cikarang',
    address: 'Kawasan Industri MM2100 Blok B2',
    city: 'Cikarang',
    state: 'Jawa Barat',
    country: 'Indonesia',
    phone: '+62 21 7777 9999',
    zip: '17530',
  },
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
  const { id } = await params
  const vendor = mockVendor

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
                <h1 className="text-3xl font-bold">Vendor Detail</h1>
                <p className="text-muted-foreground">
                  Profile information for vendor{' '}
                  <span className="font-semibold">{vendor.name}</span>{' '}
                  (mock data, id: {id})
                </p>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-none">
                Vendor
              </Badge>
            </div>

            {/* Top summary */}
            <Card>
              <CardHeader>
                <CardTitle>{vendor.name}</CardTitle>
                <CardDescription>{vendor.email}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Vendor Code</div>
                  <div className="font-medium">{vendor.code}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Contact</div>
                  <div>{vendor.contact}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Tax Number</div>
                  <div>{vendor.taxNumber}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Current Balance</div>
                  <div className="text-lg font-semibold text-blue-600">
                    Rp {vendor.balance.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing / Shipping */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="font-medium">{vendor.billing.name}</div>
                  <div>{vendor.billing.address}</div>
                  <div>
                    {vendor.billing.city}, {vendor.billing.state}
                  </div>
                  <div>{vendor.billing.country}</div>
                  <div className="text-muted-foreground">
                    {vendor.billing.phone} • {vendor.billing.zip}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="font-medium">{vendor.shipping.name}</div>
                  <div>{vendor.shipping.address}</div>
                  <div>
                    {vendor.shipping.city}, {vendor.shipping.state}
                  </div>
                  <div>{vendor.shipping.country}</div>
                  <div className="text-muted-foreground">
                    {vendor.shipping.phone} • {vendor.shipping.zip}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

