import { redirect } from 'next/navigation'

export default function AppraisalRedirect() {
  redirect('/hrm/performance?tab=appraisal')
}
