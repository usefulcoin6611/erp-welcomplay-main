import { redirect } from 'next/navigation'

export default function LabelsRedirectPage() {
  redirect('/pipelines?tab=labels')
}
