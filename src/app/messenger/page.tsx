'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'

export default function MessengerPage() {
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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Messenger</h1>
              </div>
            </div>

            <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Messenger module is under development.
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


