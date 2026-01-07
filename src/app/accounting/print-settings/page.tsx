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

const templates = [
  {
    id: 'invoice',
    name: 'Invoice',
    description: 'Template cetak invoice untuk pelanggan.',
    status: 'Active',
  },
  {
    id: 'bill',
    name: 'Bill',
    description: 'Template cetak bill untuk vendor / supplier.',
    status: 'Active',
  },
  {
    id: 'payment',
    name: 'Payment Receipt',
    description: 'Template tanda terima pembayaran.',
    status: 'Draft',
  },
] as const

function getTemplateStatus(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700 border-none'
    case 'Draft':
    default:
      return 'bg-gray-100 text-gray-700 border-none'
  }
}

export default function PrintSettingsPage() {
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
                <h1 className="text-3xl font-bold">Print Settings</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                Save Settings
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Global Options</CardTitle>
                <CardDescription>
                  Pengaturan umum untuk semua dokumen cetak.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Company Logo URL
                  </label>
                  <Input placeholder="https://example.com/logo.png" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Show Company Address
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border" />
                    <span className="text-sm text-muted-foreground">
                      Tampilkan alamat di header dokumen
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Show Signature Block
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border" />
                    <span className="text-sm text-muted-foreground">
                      Area tanda tangan di bagian bawah
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Templates</CardTitle>
                <CardDescription>
                  Template cetak untuk setiap jenis dokumen.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {templates.map((tpl) => (
                  <Card key={tpl.id} className="border border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {tpl.name}
                      </CardTitle>
                      <CardDescription>{tpl.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <Badge className={getTemplateStatus(tpl.status)}>
                        {tpl.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 shadow-none"
                      >
                        Preview
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

