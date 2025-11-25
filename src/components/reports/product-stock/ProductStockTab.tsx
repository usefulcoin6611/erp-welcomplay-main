'use client'

import { memo } from 'react'
import { useTranslations } from 'next-intl'
import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

function ProductStockTabComponent() {
  const t = useTranslations('reports.productStock')

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('title', { default: 'Product Stock Report' })}
          </h3>
          <p className="text-muted-foreground">
            {t('description', { default: 'This tab will contain the Product Stock report content.' })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export const ProductStockTab = memo(ProductStockTabComponent)
