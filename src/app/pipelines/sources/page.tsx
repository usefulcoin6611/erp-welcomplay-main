import { redirect } from 'next/navigation'

export default function SourcesRedirectPage() {
  redirect('/pipelines?tab=sources')
}
