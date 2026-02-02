import { redirect } from 'next/navigation'

export default function SetSalaryRedirect() {
  redirect('/hrm/payroll?tab=set-salary')
}
