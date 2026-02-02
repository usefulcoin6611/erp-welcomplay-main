import { redirect } from 'next/navigation'

export default function SetSalaryRouteRedirect() {
  redirect('/hrm/payroll?tab=set-salary')
}
