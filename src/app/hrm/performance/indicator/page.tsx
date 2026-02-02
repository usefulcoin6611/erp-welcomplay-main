import { redirect } from 'next/navigation'

export default function IndicatorRedirect() {
  redirect('/hrm/performance?tab=indicator')
}
