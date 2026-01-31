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

interface EmployeeEditPageProps {
  params: Promise<{ employeeId: string }>
}

function getMockEmployee(employeeId: string) {
  return {
    id: 1,
    employeeId,
    name: 'Richard Atkinson',
    email: 'keanu2006@gmail.com',
    phone: '04893258663',
    dateOfBirth: '1990-07-21',
    gender: 'Male' as const,
    address: 'Roshita Apartment',
    branch: 'India',
    department: 'Telecommunications',
    designation: 'Chartered',
    dateOfJoining: '2020-01-01',
    bankAccount: {
      accountHolderName: 'Madaline Owen',
      accountNumber: '14202546',
      bankName: 'Colby Bowen',
      bankIdentifierCode: '5879823',
      branchLocation: 'Pariatur Voluptas v',
      taxPayerId: '95682',
    },
  }
}

function mapEmployeeToInitialData(employee: ReturnType<typeof getMockEmployee>): CreateEmployeeFormInitialData {
  return {
    name: employee.name,
    phone: employee.phone,
    dob: employee.dateOfBirth,
    gender: employee.gender,
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
  const employee = getMockEmployee(employeeId)
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
        <div className="flex flex-1 flex-col bg-gray-50">
          <div className="@container/main flex flex-1 flex-col gap-5 p-5">
            <CreateEmployeeForm
              onClose={() => router.push(`/hrm/employees/${employeeId}`)}
              initialData={initialData}
              isEditMode
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
