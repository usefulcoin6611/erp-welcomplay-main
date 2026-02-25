'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import EditSalaryTabs from '@/components/hrm-payroll/salary/EditSalaryTabs'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

interface SetSalaryEditPageProps {
  params: Promise<{ id: string }>
}

export default function SetSalaryEditPage({ params }: SetSalaryEditPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<any | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/hrm/payroll/set-salary/${id}`)
        const json = await res.json()

        if (json.success && json.data) {
          setEmployee(json.data)
        } else {
          setEmployee(null)
        }
      } catch {
        setEmployee(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

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
              <h1 className="text-lg font-semibold">Edit Set Salary{employee ? ` - ${employee.name}` : ''}</h1>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => router.push('/hrm/payroll?tab=set-salary')}
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Set Salary
              </Button>
            </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : employee ? (
            <EditSalaryTabs employee={employee} />
          ) : (
            <Card className={cardClass}>
              <CardContent className="px-5 py-10">
                <p className="text-sm text-muted-foreground">Employee tidak ditemukan.</p>
              </CardContent>
            </Card>
          )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
