'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { LanguageSwitcher } from '@/components/language-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowLeft, ChevronDown, Download, Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function EmployeeDetailHeader({ employeeName, employeeId }: { employeeName: string; employeeId: string }) {
  const t = useTranslations('hrm.employee');
  const router = useRouter();

  // Placeholder routes – ganti dengan API/route sebenarnya saat backend siap
  const joiningLetterPdf = () => { /* TODO: joiningletter.download.pdf */ };
  const joiningLetterDoc = () => { /* TODO: joiningletter.download.doc */ };
  const expCertPdf = () => { /* TODO: exp.download.pdf */ };
  const expCertDoc = () => { /* TODO: exp.download.doc */ };
  const nocPdf = () => { /* TODO: noc.download.pdf */ };
  const nocDoc = () => { /* TODO: noc.download.doc */ };

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
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="border-0 shadow-none h-7 bg-gray-100 hover:bg-gray-200 text-foreground hover:text-foreground font-normal">
                  {t('joiningLetter')}
                  <ChevronDown className="h-4 w-4 ml-1 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={joiningLetterPdf} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('pdf')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={joiningLetterDoc} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('doc')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="border-0 shadow-none h-7 bg-gray-100 hover:bg-gray-200 text-foreground hover:text-foreground font-normal">
                  {t('experienceCertificate')}
                  <ChevronDown className="h-4 w-4 ml-1 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={expCertPdf} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('pdf')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={expCertDoc} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('doc')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="border-0 shadow-none h-7 bg-gray-100 hover:bg-gray-200 text-foreground hover:text-foreground font-normal">
                  {t('noc')}
                  <ChevronDown className="h-4 w-4 ml-1 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={nocPdf} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('pdf')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={nocDoc} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('doc')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
              onClick={() => router.push(`/hrm/employees/${employeeId}/edit`)}
              title={t('edit')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
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
  )
}

import { use } from 'react'
import { notFound } from 'next/navigation'
import { getEmployeeById } from '@/lib/employee-data'

interface EmployeeDetailPageProps {
  params: Promise<{
    employeeId: string
  }>
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const t = useTranslations('hrm.employee');
  const { employeeId } = use(params);
  const employee = getEmployeeById(employeeId);

  if (!employee) {
    notFound();
  }

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
        <EmployeeDetailHeader employeeName={employee.name} employeeId={employeeId} />
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-5 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Personal Detail */}
              <Card className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {t("personalDetail")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0 space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">EmployeeId</span>
                      <p className="text-sm text-foreground">#{employee.employeeId}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("name")}</span>
                      <p className="text-sm text-foreground">{employee.name}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("email")}</span>
                      <p className="text-sm text-foreground">{employee.email}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("dateOfBirth")}</span>
                      <p className="text-sm text-foreground">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("phone")}</span>
                      <p className="text-sm text-foreground">{employee.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("address")}</span>
                      <p className="text-sm text-foreground">{employee.address}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("gender")}</span>
                      <p className="text-sm text-foreground">{employee.gender}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Salary Type</span>
                      <p className="text-sm text-foreground"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">{employee.salaryType}</span></p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Basic Salary</span>
                      <p className="text-sm text-foreground"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{employee.basicSalary}</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Detail */}
              <Card className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {t("companyDetail")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0 space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("branch")}</span>
                      <p className="text-sm text-foreground">{employee.branch}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("department")}</span>
                      <p className="text-sm text-foreground">{employee.department}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("designation")}</span>
                      <p className="text-sm text-foreground">{employee.designation}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("dateOfJoining")}</span>
                      <p className="text-sm text-foreground">{new Date(employee.dateOfJoining).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("lastLogin")}</span>
                      <p className="text-sm text-foreground">
                        {employee.lastLogin
                          ? new Date(employee.lastLogin).toLocaleString()
                          : '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("status")}</span>
                      <p className="text-sm text-foreground">
                        <span className={employee.isActive ? 'bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded' : 'bg-gray-100 text-gray-800 px-2 py-0.5 rounded'}>
                          {employee.isActive ? t('active') : t('inactive')}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Document Detail */}
              <Card className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {t("document")} Detail
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0 space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Certificate</span>
                      <p className="text-sm text-emerald-600 font-medium">{employee.documents.certificate}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Photo</span>
                      <p className="text-sm text-emerald-600 font-medium">{employee.documents.photo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Account Detail */}
              <Card className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {t("bankAccountDetail")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0 space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("accountHolderName")}</span>
                      <p className="text-sm text-foreground">{employee.bankAccount.accountHolderName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("accountNumber")}</span>
                      <p className="text-sm text-foreground">{employee.bankAccount.accountNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("bankName")}</span>
                      <p className="text-sm text-foreground">{employee.bankAccount.bankName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("bankIdentifierCode")}</span>
                      <p className="text-sm text-foreground">{employee.bankAccount.bankIdentifierCode}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("branchLocation")}</span>
                      <p className="text-sm text-foreground">{employee.bankAccount.branchLocation}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{t("taxPayerId")}</span>
                      <p className="text-sm text-foreground">{employee.bankAccount.taxPayerId}</p>
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