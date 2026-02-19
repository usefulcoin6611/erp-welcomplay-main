'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AccountingSetupRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const allowed = new Set(['taxes', 'category', 'unit', 'custom-field'])
    const targetTab = tabParam && allowed.has(tabParam) ? tabParam : 'taxes'
    router.replace(`/accounting/setup/custom-field?tab=${targetTab}`)
  }, [router, searchParams])

  return null
}


