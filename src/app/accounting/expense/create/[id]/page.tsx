'use client'

import Link from 'next/link'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ExpenseCreatePageProps = {
  params: { id: string }
}

export default function ExpenseCreatePage({ params }: ExpenseCreatePageProps) {
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
                <h1 className="text-2xl font-semibold">Expense Create</h1>
                <p className="text-sm text-muted-foreground">(create id: {params.id})</p>
              </div>
              <Button asChild variant="outline" size="sm" className="shadow-none h-7">
                <Link href="/accounting/purchases?tab=expense">Back</Link>
              </Button>
            </div>

            <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Expense create form placeholder (route matches reference: <span className="font-medium">/expense/create/0</span>).
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


