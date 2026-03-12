'use client'

import { POSInterface } from '@/components/pos-interface'

/**
 * POS Sales – full-screen focus mode: no header, no sidebar.
 * Layout is handled by pos/layout when pathname is /pos/sales.
 */
export default function POSSalesPage() {
  return (
    <div className="flex flex-1 flex-col min-h-screen w-full">
      <POSInterface />
    </div>
  )
}
