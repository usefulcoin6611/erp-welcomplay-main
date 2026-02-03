'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { getPayslipById, updatePayslip } from '@/lib/payroll-data'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

interface PayslipEditPageProps {
  params: Promise<{ id: string }>
}

export default function PayslipEditPage({ params }: PayslipEditPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const payslip = getPayslipById(id)

  const [salary, setSalary] = useState(payslip ? String(payslip.salary) : '')
  const [allowances, setAllowances] = useState(payslip ? String(payslip.allowances) : '')
  const [deductions, setDeductions] = useState(payslip ? String(payslip.deductions) : '')
  const [status, setStatus] = useState<'Paid' | 'UnPaid'>(payslip?.status ?? 'UnPaid')

  if (!payslip) {
    notFound()
  }

  const base = parseInt(salary, 10) || 0
  const allow = parseInt(allowances, 10) || 0
  const deduct = parseInt(deductions, 10) || 0
  const netSalary = base + allow - deduct

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePayslip(id, {
      salary: base,
      allowances: allow,
      deductions: deduct,
      netSalary,
      status,
    })
    router.push(`/hrm/payroll/payslip/${id}`)
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Edit Payslip - {payslip.employeeName}</h1>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => router.push('/hrm/payroll?tab=payslip')}
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Payslip
              </Button>
            </div>

            <Card className={cardClass}>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Form Edit Payslip</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input value={payslip.employeeId} disabled className="h-9 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama</Label>
                      <Input value={payslip.employeeName} disabled className="h-9 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Periode</Label>
                      <Input value={`${payslip.month}/${payslip.year}`} disabled className="h-9 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={status} onValueChange={(v) => setStatus(v as 'Paid' | 'UnPaid')}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UnPaid">UnPaid</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Salary (IDR)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Allowances (IDR)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={allowances}
                        onChange={(e) => setAllowances(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deductions (IDR)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={deductions}
                        onChange={(e) => setDeductions(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Net Salary: <span className="font-semibold text-foreground">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(netSalary)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 shadow-none">
                      Simpan
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9"
                      onClick={() => router.push('/hrm/payroll?tab=payslip')}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
