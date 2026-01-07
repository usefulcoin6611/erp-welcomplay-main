import { redirect } from 'next/navigation'

export default function LeadStagesPage() {
  redirect('/pipelines?tab=lead-stages')
}
