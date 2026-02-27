'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { LanguageSwitcher } from '@/components/language-switcher'
import { CreateEmployeeForm, type CreateEmployeeFormInitialData } from '@/components/create-employee-form'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export default function EmployeeEditPage() {
  const t = useTranslations('hrm.employee')
  const router = useRouter()
  const params = useParams<{ employeeId: string }>()
  const employeeId = params.employeeId

  const [employee, setEmployee] = useState<any | null>(null)

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/employees/${employeeId}`)
        const json = await res.json().catch(() => null)

        if (!json?.success || !json.data) {
          router.push('/hrm/employees')
          return
        }

        setEmployee(json.data as any)
      } catch (error) {
        console.error('Error fetching employee for edit:', error)
        router.push('/hrm/employees')
      }
    }

    if (employeeId) {
      fetchEmployee()
    }
  }, [employeeId, router])

  if (!employee) {
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
          <div className="flex flex-1 items-center justify-center bg-gray-100">
            <p className="text-sm text-muted-foreground">{t('loadingEmployees')}</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const initialData: CreateEmployeeFormInitialData = {
    name: employee.name,
    phone: employee.phone,
    dob: employee.dateOfBirth,
    gender: employee.gender as 'Male' | 'Female',
    email: employee.email,
    address: employee.address,
    employeeId: employee.employeeId,
    branchId: '',
    departmentId: '',
    designationId: '',
    branch: employee.branch,
    department: employee.department,
    designation: employee.designation,
    companyDoj: employee.dateOfJoining,
    accountHolderName: employee.accountHolderName ?? '',
    accountNumber: employee.accountNumber ?? '',
    bankName: employee.bankName ?? '',
    bankIdentifierCode: employee.bankIdentifierCode ?? '',
    branchLocation: employee.branchLocation ?? '',
    taxPayerId: employee.taxPayerId ?? '',
    needsUserAccess: Boolean(employee.userId),
    documents: Array.isArray(employee.documents)
      ? employee.documents.map((d: any) => ({
          documentTypeId: d.documentTypeId,
          filePath: d.filePath,
          fileName: d.fileName,
        }))
      : [],
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
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-center justify-between w-full">
              <h1 className="text-base font-medium">
                {t('editEmployee')} - {employee.name}
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/hrm/employees')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToList')}
                </Button>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-5 p-5">
            <CreateEmployeeForm
              onClose={() => router.push('/hrm/employees')}
              initialData={initialData}
              isEditMode
              employeeIdForEdit={employeeId}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
