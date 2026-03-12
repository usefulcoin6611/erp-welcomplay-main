import { redirect } from 'next/navigation'

export default function DealStagesRedirectPage() {
  redirect('/pipelines?tab=deal-stages')
}
