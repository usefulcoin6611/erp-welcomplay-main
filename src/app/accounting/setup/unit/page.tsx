import { redirect } from 'next/navigation'

export default function AccountingSetupUnitRedirectPage() {
  redirect('/accounting/setup/custom-field?tab=unit')
}


