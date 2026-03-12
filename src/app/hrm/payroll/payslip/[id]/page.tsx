'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'
import { toast } from 'sonner'

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

interface PayslipApiDetail {
  id: string
  employeeId: string
  employeeName: string
  salaryMonth: string
  year?: string
  month?: string
  payrollType: string
  basicSalary: number
  totalAllowances: number
  totalDeductions: number
  netSalary: number
  status: 'Paid' | 'UnPaid'
  paidAt?: string | null
}

interface PayslipDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PayslipDetailPage({ params }: PayslipDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const [payslip, setPayslip] = useState<PayslipApiDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadDetail = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/hrm/payroll/payslip/${id}`)
        const json = await res.json().catch(() => null)

        if (!res.ok || !json?.success || !json.data) {
          if (!cancelled) {
            toast.error(json?.message ?? 'Payslip tidak ditemukan.')
            setPayslip(null)
          }
          return
        }

        if (!cancelled) {
          setPayslip(json.data as PayslipApiDetail)
        }
      } catch {
        if (!cancelled) {
          toast.error('Gagal memuat detail payslip.')
          setPayslip(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      cancelled = true
    }
  }, [id])

  const monthKey = payslip?.month ?? payslip?.salaryMonth?.split('-')[1] ?? ''
  const yearLabel = payslip?.year ?? payslip?.salaryMonth?.split('-')[0] ?? ''
  const monthLabel = MONTH_NAMES[monthKey] ?? monthKey

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
          <div className="@container/main flex flex-1 flex-col gap-5 p-6 bg-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">
                Detail Payslip{payslip ? ` - ${payslip.employeeName}` : ''}
              </h1>
              <div className="flex items-center gap-2">
                {payslip && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                    onClick={() => router.push(`/hrm/payroll/payslip/${id}/edit`)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
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

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-muted-foreground">Memuat detail payslip...</p>
            </div>
          ) : !payslip ? (
            <Card className={cardClass}>
              <CardContent className="px-6 py-12">
                <p className="text-sm text-muted-foreground text-center">Payslip tidak ditemukan.</p>
              </CardContent>
            </Card>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <Card className={cardClass}>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Informasi Payslip</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium text-muted-foreground">Employee ID</span>
                    <p className="text-sm text-foreground mt-0.5">#{payslip.employeeId}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium text-muted-foreground">Nama</span>
                    <p className="text-sm text-foreground mt-0.5">{payslip.employeeName}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium text-muted-foreground">Periode</span>
                    <p className="text-sm text-foreground mt-0.5">
                      {monthLabel} {yearLabel}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium text-muted-foreground">Payroll Type</span>
                    <p className="text-sm text-foreground mt-0.5">
                      <span className="inline-flex items-center rounded-full bg-sky-50 text-sky-700 px-3 py-0.5 text-xs font-medium">
                        {payslip.payrollType}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <p className="text-sm text-foreground mt-0.5">
                      <span
                        className={
                          payslip.status === 'Paid'
                            ? 'inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-0.5 text-xs font-semibold'
                            : 'inline-flex items-center rounded-full bg-rose-50 text-rose-700 px-3 py-0.5 text-xs font-semibold'
                        }
                      >
                        {payslip.status}
                      </span>
                    </p>
                  </div>
                  {payslip.paidAt ? (
                    <div className="space-y-1.5 col-span-2">
                      <span className="text-sm font-medium text-muted-foreground">Tanggal Dibayar</span>
                      <p className="text-sm text-foreground mt-0.5">
                        {new Date(payslip.paidAt).toLocaleString('id-ID')}
                      </p>
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
                    <span className="text-sm font-medium">{formatIdr(payslip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm text-muted-foreground">Allowances</span>
                    <span className="text-sm font-medium">+ {formatIdr(payslip.totalAllowances)}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm text-muted-foreground">Deductions</span>
                    <span className="text-sm font-medium">- {formatIdr(payslip.totalDeductions)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center font-semibold">
                    <span className="text-sm">Net Salary</span>
                    <span className="text-base">{formatIdr(payslip.netSalary)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
