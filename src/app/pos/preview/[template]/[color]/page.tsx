'use client'

import Link from 'next/link'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { REPORT_CARD_CLASS } from '@/components/pos-reports/shared-styles'

/**
 * Preview POS print (reference-erp pos/preview/{template}/{color}).
 * Placeholder: tampilkan template & color yang dipilih.
 */
export default function POSPreviewPage({
  params,
}: {
  params: { template: string; color: string }
}) {
  const template = decodeURIComponent(params.template)
  const color = decodeURIComponent(params.color)

  return (
    <POSPageLayout title="POS Print Preview" breadcrumbLabel="Preview">
      <Card className={REPORT_CARD_CLASS}>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Template: <span className="font-medium text-foreground">{template}</span> · Color:{' '}
            <span className="font-medium text-foreground">{color}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Preview cetak POS akan ditampilkan di sini setelah integrasi dengan backend.
          </p>
          <Button variant="outline" size="sm" className="shadow-none" asChild>
            <Link href="/pos/print-settings">Back to Print Settings</Link>
          </Button>
        </CardContent>
      </Card>
    </POSPageLayout>
  )
}
