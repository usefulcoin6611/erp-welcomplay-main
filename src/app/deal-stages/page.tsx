import { redirect } from 'next/navigation'

export default function DealStagesPage() {
  redirect('/pipelines?tab=deal-stages')
}
