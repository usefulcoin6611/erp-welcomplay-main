import { redirect } from 'next/navigation'

export default function ExpenseIndexRedirectPage() {
  redirect('/accounting/purchases?tab=expense')
}

