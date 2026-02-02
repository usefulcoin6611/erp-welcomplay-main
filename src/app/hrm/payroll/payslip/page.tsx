import { redirect } from 'next/navigation'

export default function PayslipRedirect() {
  redirect('/hrm/payroll?tab=payslip')
}
