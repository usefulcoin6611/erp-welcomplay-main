'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getPayslipById } from '@/lib/payroll-data'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April', '05': 'Mei', '06': 'Juni',
  '07': 'Juli', '08': 'Agustus', '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
}

interface PayslipDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PayslipDetailPage({ params }: PayslipDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const payslip = getPayslipById(id)

  if (!payslip) {
    notFound()
  }

  const monthLabel = MONTH_NAMES[payslip.month] ?? payslip.month

  return (
    <>
      <SiteHeader />
      <MainContentWrapper>
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Detail Payslip - {payslip.employeeName}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                onClick={() => router.push(`/hrm/payroll/payslip/${id}/edit`)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={cardClass}>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Informasi Payslip</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Employee ID</span>
                    <p className="text-sm text-foreground">#{payslip.employeeId}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Nama</span>
                    <p className="text-sm text-foreground">{payslip.employeeName}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Periode</span>
                    <p className="text-sm text-foreground">{monthLabel} {payslip.year}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Payroll Type</span>
                    <p className="text-sm text-foreground">
                      <span className="bg-muted px-2 py-0.5 rounded text-sm">{payslip.payrollType}</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <p className="text-sm text-foreground">
                      <span className={payslip.status === 'Paid' ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded' : 'bg-red-100 text-red-700 px-2 py-0.5 rounded'}>
                        {payslip.status}
                      </span>
                    </p>
                  </div>
                  {payslip.paidAt ? (
                    <div className="space-y-1 col-span-2">
                      <span className="text-sm font-medium text-muted-foreground">Tanggal Dibayar</span>
                      <p className="text-sm text-foreground">{new Date(payslip.paidAt).toLocaleString('id-ID')}</p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Rincian Gaji</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Salary</span>
                    <span className="text-sm font-medium">{formatIdr(payslip.salary)}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm text-muted-foreground">Allowances</span>
                    <span className="text-sm font-medium">+ {formatIdr(payslip.allowances)}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm text-muted-foreground">Deductions</span>
                    <span className="text-sm font-medium">- {formatIdr(payslip.deductions)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center font-semibold">
                    <span className="text-sm">Net Salary</span>
                    <span className="text-base">{formatIdr(payslip.netSalary)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
