import { redirect } from 'next/navigation'

export default function LeadStagesRedirectPage() {
  redirect('/pipelines?tab=lead-stages')
}
