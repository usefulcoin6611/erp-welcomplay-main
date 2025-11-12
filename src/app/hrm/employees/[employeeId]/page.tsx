'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function EmployeeDetailHeader({ employeeName }: { employeeName: string }) {
  const t = useTranslations('hrm.employee');
  const router = useRouter();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center justify-between w-full">
          <h1 className="text-base font-medium">{t('employeeDetail')} - {employeeName}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/hrm/employees')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToList')}
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}

import { use } from 'react'

interface EmployeeDetailPageProps {
  params: Promise<{
    employeeId: string
  }>
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const t = useTranslations('hrm.employee');
  const { employeeId } = use(params);
  
  // Mock data - in real app, fetch based on employeeId
  const employee = {
    id: 1,
    employeeId: employeeId,
    name: "Richard Atkinson",
    email: "keanu2006@gmail.com",
    phone: "04893258663",
    dateOfBirth: "1990-07-21",
    gender: "Male",
    address: "Roshita Apartment",
    branch: "India",
    department: "Telecommunications",
    designation: "Chartered",
    dateOfJoining: "2020-01-01",
    lastLogin: "2024-10-31 09:30:00",
    isActive: true,
    salaryType: "Hourly Payslip",
    basicSalary: "15000",
    documents: {
      certificate: "certificate.png",
      photo: "profile.png"
    },
    bankAccount: {
      accountHolderName: "Madaline Owen",
      accountNumber: "14202546",
      bankName: "Colby Bowen",
      bankIdentifierCode: "5879823",
      branchLocation: "Pariatur Voluptas v",
      taxPayerId: "95682"
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <EmployeeDetailHeader employeeName={employee.name} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-3 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Personal Detail */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-1 h-4 bg-green-500 rounded"></div>
                    {t("personalDetail")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium">EmployeeId :</span>
                      <p className="text-sm">#{employee.employeeId}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">{t("name")} :</span>
                      <p className="text-sm">{employee.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium">{t("email")} :</span>
                      <p className="text-sm">{employee.email}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">{t("dateOfBirth")} :</span>
                      <p className="text-sm">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium">{t("phone")} :</span>
                      <p className="text-sm">{employee.phone}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">{t("address")} :</span>
                      <p className="text-sm">{employee.address}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium bg-orange-100 px-2 py-1 rounded">Salary Type :</span>
                      <p className="text-sm">{employee.salaryType}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Basic <span className="bg-yellow-200 px-1 rounded">Salary</span> :</span>
                      <p className="text-sm">{employee.basicSalary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Detail */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-1 h-4 bg-green-500 rounded"></div>
                    {t("companyDetail")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium">{t("branch")} :</span>
                      <p className="text-sm">{employee.branch}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">{t("department")} :</span>
                      <p className="text-sm">{employee.department}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium">{t("designation")} :</span>
                      <p className="text-sm">{employee.designation}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">{t("dateOfJoining")} :</span>
                      <p className="text-sm">{new Date(employee.dateOfJoining).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Document Detail */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-1 h-4 bg-green-500 rounded"></div>
                    {t("document")} Detail
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium">Certificate :</span>
                      <p className="text-sm text-green-600">{employee.documents.certificate}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Photo :</span>
                      <p className="text-sm text-green-600">{employee.documents.photo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Account Detail */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-1 h-4 bg-green-500 rounded"></div>
                    {t("bankAccountDetail")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium">{t("accountHolderName")} :</span>
                      <p className="text-sm">{employee.bankAccount.accountHolderName}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">{t("accountNumber")} :</span>
                      <p className="text-sm">{employee.bankAccount.accountNumber}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium">{t("bankName")} :</span>
                      <p className="text-sm">{employee.bankAccount.bankName}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">{t("bankIdentifierCode")} :</span>
                      <p className="text-sm">{employee.bankAccount.bankIdentifierCode}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium">{t("branchLocation")} :</span>
                      <p className="text-sm">{employee.bankAccount.branchLocation}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">{t("taxPayerId")} :</span>
                      <p className="text-sm">{employee.bankAccount.taxPayerId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}