import { redirect } from 'next/navigation'

export default function AccountingSetupCategoryRedirectPage() {
  redirect('/accounting/setup/custom-field?tab=category')
}



