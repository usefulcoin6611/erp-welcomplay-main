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
import { ArrowLeft, ChevronDown, Download, Eye, Pencil, User, UserPlus, Building2, CreditCard, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

type EmployeeDetailHeaderProps = {
  employeeName: string
  employeeId: string
  userId?: string | null
  onRefetch: () => Promise<void>
}

function EmployeeDetailHeader({ employeeName, employeeId, userId, onRefetch }: EmployeeDetailHeaderProps) {
  const t = useTranslations('hrm.employee');
  const router = useRouter();
  const [creatingUser, setCreatingUser] = useState(false);

  const joiningLetterPdf = () => {};
  const joiningLetterDoc = () => {};
  const expCertPdf = () => {};
  const expCertDoc = () => {};
  const nocPdf = () => {};
  const nocDoc = () => {};

  const handleCreateSystemUser = async () => {
    setCreatingUser(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/create-user`, { method: 'POST' });
      const json = await res.json().catch(() => null);
      if (!json?.success) {
        toast.error(json?.message ?? 'Failed to create system user');
        return;
      }
      toast.success(json.message ?? 'System user created');
      await onRefetch();
    } catch (error) {
      console.error('Error creating system user:', error);
      toast.error('Failed to create system user');
    } finally {
      setCreatingUser(false);
    }
  };

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
            {!userId && (
              <Button
                variant="outline"
                size="sm"
                className="shadow-none h-7 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                onClick={handleCreateSystemUser}
                disabled={creatingUser}
                title="Create system user"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {creatingUser ? 'Creating...' : 'Create system user'}
              </Button>
            )}
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

interface EmployeeDetail {
  employeeId: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  branch: string
  department: string
  designation: string
  dateOfJoining: string
  lastLogin: string | null
  isActive: boolean
  salaryType: string | null
  basicSalary: number | null
  accountHolderName: string | null
  accountNumber: string | null
  bankName: string | null
  bankIdentifierCode: string | null
  branchLocation: string | null
  taxPayerId: string | null
  userId?: string | null
  documents: {
    documentTypeId: string
    name: string
    requiredField: boolean
    filePath: string | null
    fileName?: string | null
  }[]
}

export default function EmployeeDetailPage() {
  const t = useTranslations('hrm.employee');
  const router = useRouter();
  const params = useParams<{ employeeId: string }>();
  const employeeId = params.employeeId;

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [documentTypes, setDocumentTypes] = useState<{ id: string; name: string; requiredField: boolean }[]>([]);

  const fetchEmployee = useCallback(async () => {
    if (!employeeId) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}`);
      const json = await res.json().catch(() => null);
      if (!json?.success || !json.data) {
        router.push('/hrm/employees');
        return;
      }
      setEmployee(json.data as EmployeeDetail);
    } catch (error) {
      console.error("Error fetching employee detail:", error);
      router.push('/hrm/employees');
    }
  }, [employeeId, router]);

  useEffect(() => {
    if (employeeId) fetchEmployee();
  }, [employeeId, fetchEmployee]);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const res = await fetch('/api/document-types');
        const json = await res.json().catch(() => null);
        if (json?.success && Array.isArray(json.data)) {
          setDocumentTypes(
            json.data.map((dt: { id: string; name: string; requiredField: boolean }) => ({
              id: String(dt.id),
              name: String(dt.name ?? ''),
              requiredField: Boolean(dt.requiredField),
            }))
          );
        }
      } catch {
        // ignore
      }
    };
    fetchDocumentTypes();
  }, []);

  if (!employee) {
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
          <div className="flex flex-1 items-center justify-center bg-gray-100">
            <p className="text-sm text-muted-foreground">{t("loadingEmployees")}</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
        <EmployeeDetailHeader
          employeeName={employee.name}
          employeeId={employeeId}
          userId={employee.userId}
          onRefetch={fetchEmployee}
        />
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-5 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Personal Detail */}
              <Card className="rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                <CardHeader className="px-6 pt-6 pb-4">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("personalDetail")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">EmployeeId</span>
                      <p className="text-sm text-foreground">#{employee.employeeId}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("name")}</span>
                      <p className="text-sm text-foreground">{employee.name}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("email")}</span>
                      <p className="text-sm text-foreground">{employee.email}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("dateOfBirth")}</span>
                      <p className="text-sm text-foreground">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("phone")}</span>
                      <p className="text-sm text-foreground">{employee.phone}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("address")}</span>
                      <p className="text-sm text-foreground">{employee.address}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("gender")}</span>
                      <p className="text-sm text-foreground">{employee.gender}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Salary Type</span>
                      <p className="text-sm text-foreground"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">{employee.salaryType}</span></p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Basic Salary</span>
                      <p className="text-sm text-foreground"><span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">{employee.basicSalary}</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Detail */}
              <Card className="rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                <CardHeader className="px-6 pt-6 pb-4">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {t("companyDetail")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("branch")}</span>
                      <p className="text-sm text-foreground">{employee.branch}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("department")}</span>
                      <p className="text-sm text-foreground">{employee.department}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("designation")}</span>
                      <p className="text-sm text-foreground">{employee.designation}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("dateOfJoining")}</span>
                      <p className="text-sm text-foreground">{new Date(employee.dateOfJoining).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("lastLogin")}</span>
                      <p className="text-sm text-foreground">
                        {employee.lastLogin
                          ? new Date(employee.lastLogin).toLocaleString()
                          : '-'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("status")}</span>
                      <p className="text-sm text-foreground">
                        <span className={employee.isActive ? 'bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium' : 'bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium'}>
                          {employee.isActive ? t('active') : t('inactive')}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Document Detail - layout sama persis dengan Edit Employee */}
              <Card className="rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t("document")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 px-5 pb-5 pt-0">
                  {documentTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Tidak ada document type yang terdaftar. Tambahkan terlebih dahulu di menu Setup &gt; Document Type.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {documentTypes.map((dt) => {
                        const doc = (employee.documents || []).find(
                          (d) => String(d.documentTypeId) === dt.id
                        )
                        const filePath = doc?.filePath ?? null
                        const fileName =
                          (doc as { fileName?: string | null })?.fileName ??
                          filePath?.split('/').pop() ??
                          null

                        return (
                          <div
                            key={dt.id}
                            className="flex flex-col sm:flex-row sm:items-start gap-3"
                          >
                            <div className="shrink-0 sm:w-1/3 sm:pt-1.5">
                              <span className="text-sm font-medium text-muted-foreground">
                                {dt.name}
                                {dt.requiredField && (
                                  <span className="ml-0.5 text-red-500">*</span>
                                )}
                              </span>
                            </div>
                            <div className="flex-1 space-y-2 min-w-0">
                              {filePath ? (
                                /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filePath) ? (
                                  <div className="flex items-center gap-3">
                                    <div className="relative inline-block">
                                      <img
                                        src={filePath}
                                        alt={dt.name}
                                        className="rounded border border-gray-200 object-contain max-h-32 w-auto bg-muted"
                                      />
                                      <div className="absolute right-1 top-1 flex items-center gap-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-muted-foreground bg-background/70"
                                          onClick={() => {
                                            window.open(filePath, '_blank', 'noopener,noreferrer')
                                          }}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs truncate max-w-[200px] font-medium">
                                        {fileName ?? 'Buka file'}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">
                                        Existing File
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between rounded-md border border-dashed px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <div className="flex flex-col">
                                        <span className="text-xs truncate max-w-[200px] font-medium">
                                          {fileName ?? filePath}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                          Existing File
                                        </span>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground"
                                      onClick={() => {
                                        window.open(filePath, '_blank', 'noopener,noreferrer')
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )
                              ) : (
                                <p className="text-sm text-muted-foreground">-</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bank Account Detail */}
              <Card className="rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
                <CardHeader className="px-6 pt-6 pb-4">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {t("bankAccountDetail")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("accountHolderName")}</span>
                      <p className="text-sm text-foreground">{employee.accountHolderName ?? "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("accountNumber")}</span>
                      <p className="text-sm text-foreground">{employee.accountNumber ?? "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("bankName")}</span>
                      <p className="text-sm text-foreground">{employee.bankName ?? "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("bankIdentifierCode")}</span>
                      <p className="text-sm text-foreground">{employee.bankIdentifierCode ?? "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("branchLocation")}</span>
                      <p className="text-sm text-foreground">{employee.branchLocation ?? "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("taxPayerId")}</span>
                      <p className="text-sm text-foreground">{employee.taxPayerId ?? "-"}</p>
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
