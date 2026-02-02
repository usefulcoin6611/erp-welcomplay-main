'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
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
import { getEmployeeById } from '@/lib/employee-data'
import { notFound } from 'next/navigation'

interface EmployeeEditPageProps {
  params: Promise<{ employeeId: string }>
}

function mapEmployeeToInitialData(employee: NonNullable<ReturnType<typeof getEmployeeById>>): CreateEmployeeFormInitialData {
  return {
    name: employee.name,
    phone: employee.phone,
    dob: employee.dateOfBirth,
    gender: employee.gender as 'Male' | 'Female',
    email: employee.email,
    password: '',
    address: employee.address,
    employeeId: employee.employeeId,
    branchId: '1',
    departmentId: '1',
    designationId: '1',
    companyDoj: employee.dateOfJoining,
    accountHolderName: employee.bankAccount.accountHolderName,
    accountNumber: employee.bankAccount.accountNumber,
    bankName: employee.bankAccount.bankName,
    bankIdentifierCode: employee.bankAccount.bankIdentifierCode,
    branchLocation: employee.bankAccount.branchLocation,
    taxPayerId: employee.bankAccount.taxPayerId,
  }
}

export default function EmployeeEditPage({ params }: EmployeeEditPageProps) {
  const t = useTranslations('hrm.employee')
  const router = useRouter()
  const { employeeId } = use(params)
  const employee = getEmployeeById(employeeId)
  if (!employee) {
    notFound()
  }
  const initialData = mapEmployeeToInitialData(employee)

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
                  onClick={() => router.push(`/hrm/employees/${employeeId}`)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToDetail')}
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
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
