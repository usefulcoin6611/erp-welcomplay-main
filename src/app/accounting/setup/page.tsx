import React from "react"
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

const settings = [
  {
    id: 'company',
    name: 'Company Profile',
    description: 'Nama perusahaan, alamat, dan informasi dasar.',
    status: 'Completed',
  },
  {
    id: 'fiscal',
    name: 'Fiscal Year',
    description: 'Periode pembukuan dan awal tahun fiskal.',
    status: 'In Progress',
  },
  {
    id: 'tax',
    name: 'Tax Settings',
    description: 'Pengaturan PPN, PPh, dan kode pajak.',
    status: 'Pending',
  },
] as const

function getStatusBadge(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-700 border-none'
    case 'In Progress':
      return 'bg-blue-100 text-blue-700 border-none'
    case 'Pending':
    default:
      return 'bg-gray-100 text-gray-700 border-none'
  }
}

export default function AccountingSetupPage() {
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Accounting Setup</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                Save Changes
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Required Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {settings.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Data dasar yang digunakan di invoice, bill, dan laporan.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Company Name
                  </label>
                  <Input defaultValue="PT Contoh Sejahtera" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Fiscal Year Start
                  </label>
                  <Input type="date" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Core Settings</CardTitle>
                <CardDescription>
                  Checklist pengaturan penting akuntansi.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {settings.map((item) => (
                  <Card key={item.id} className="border border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {item.name}
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <Badge className={getStatusBadge(item.status)}>
                        {item.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defaults</CardTitle>
                <CardDescription>
                  Pengaturan default seperti mata uang dan bahasa.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Base Currency
                  </label>
                  <Input defaultValue="IDR" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Enable Tax Inclusive Pricing
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border" />
                    <span className="text-sm text-muted-foreground">
                      Harga sudah termasuk pajak
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

