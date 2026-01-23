import { redirect } from 'next/navigation'

export default function AccountingSetupRedirectPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const tab = typeof searchParams?.tab === 'string' ? searchParams.tab : undefined
  const allowed = new Set(['taxes', 'category', 'unit', 'custom-field'])
  const targetTab = tab && allowed.has(tab) ? tab : 'taxes'
  redirect(`/accounting/setup/custom-field?tab=${targetTab}`)
}


