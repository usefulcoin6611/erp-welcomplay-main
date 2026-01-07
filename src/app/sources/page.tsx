import { redirect } from 'next/navigation'

export default function SourcesPage() {
  redirect('/pipelines?tab=sources')
}
