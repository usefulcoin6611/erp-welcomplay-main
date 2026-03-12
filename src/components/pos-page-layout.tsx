'use client'

import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'

type POSPageLayoutProps = {
  title: string
  breadcrumbLabel: string
  actionButton?: React.ReactNode
  children: React.ReactNode
}

/**
 * Layout halaman POS sesuai reference-erp:
 * - Card 1: title (h4) + breadcrumb (Dashboard > Page) + action button
 * - Content (biasanya Card dengan table)
 */
export function POSPageLayout({
  title,
  breadcrumbLabel,
  actionButton,
  children,
}: POSPageLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title & breadcrumb wrapped by card */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardContent className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="mb-2 text-xl font-semibold">{title}</h4>
              <Breadcrumb>
                <BreadcrumbList className="text-muted-foreground">
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumbLabel}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {actionButton && (
              <div className="flex items-center gap-2">{actionButton}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content: card dengan table/form */}
      {children}
    </div>
  )
}
