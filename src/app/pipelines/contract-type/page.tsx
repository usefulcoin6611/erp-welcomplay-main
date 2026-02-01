import { redirect } from 'next/navigation'

export default function ContractTypeRedirectPage() {
  redirect('/pipelines?tab=contract-type')
}
