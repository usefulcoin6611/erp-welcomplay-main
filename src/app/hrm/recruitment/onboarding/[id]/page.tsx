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
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pencil, Trash, UserPlus, User, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'
import { getOnboardingById, removeOnboardingById } from '@/lib/recruitment-data'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-800'
    case 'In Progress': return 'bg-blue-100 text-blue-800'
    case 'Pending': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

interface OnboardingDetailPageProps {
  params: Promise<{ id: string }>
}

export default function OnboardingDetailPage({ params }: OnboardingDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const item = getOnboardingById(id)

  if (!item) notFound()

  const handleConvertToEmployee = () => {
    toast.success('Convert to Employee')
    router.push('/hrm/employees')
  }

  const handleViewEmployee = () => {
    if (item.convertToEmployeeId) {
      router.push(`/hrm/employees/${item.convertToEmployeeId}`)
    } else {
      toast.info('Belum dikonversi ke karyawan')
    }
  }

  const handleDelete = () => {
    removeOnboardingById(id)
    setDeleteDialogOpen(false)
    toast.success('Onboarding dihapus')
    router.push('/hrm/recruitment?tab=onboarding')
  }

  const handleOfferLetter = (format: 'pdf' | 'doc') => {
    toast.success(`Offer Letter ${format.toUpperCase()} downloaded`)
  }

  return (
    <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <Card className={cardClass}>
              <CardHeader className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base font-semibold text-foreground">Detail Onboarding</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap ml-auto">
                    <Button variant="outline" size="sm" className="shadow-none h-7" onClick={handleConvertToEmployee}>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Convert to Employee
                    </Button>
                    <Button variant="outline" size="sm" className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={handleViewEmployee}>
                      <User className="h-4 w-4 mr-1" />
                      View Employee
                    </Button>
                    <Button variant="outline" size="sm" className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={() => { router.push('/hrm/recruitment?tab=onboarding'); toast.info('Edit dari daftar Job On-boarding'); }}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="shadow-none h-7 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200" onClick={() => setDeleteDialogOpen(true)}>
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button variant="outline" size="sm" className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={() => handleOfferLetter('pdf')} title="Offer Letter PDF">
                      <FileText className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={() => handleOfferLetter('doc')} title="Offer Letter DOC">
                      <Download className="h-4 w-4 mr-1" />
                      DOC
                    </Button>
                    <Button variant="outline" size="sm" className="h-7" onClick={() => router.push('/hrm/recruitment?tab=onboarding')}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Kembali
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Employee Name</span>
                    <p className="text-sm text-foreground">{item.employeeName}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Position</span>
                    <p className="text-sm text-foreground">{item.position}</p>
                  </div>
                  {item.branch && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Branch</span>
                      <p className="text-sm text-foreground">{item.branch}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Department</span>
                    <p className="text-sm text-foreground">{item.department}</p>
                  </div>
                  {item.appliedAt && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Applied at</span>
                      <p className="text-sm text-foreground">{item.appliedAt}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Join Date</span>
                    <p className="text-sm text-foreground">{item.joinDate}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <p className="text-sm text-foreground"><Badge className={getStatusBadgeColor(item.status)}>{item.status}</Badge></p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Progress</span>
                    <p className="text-sm text-foreground">{item.progress}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus onboarding?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
