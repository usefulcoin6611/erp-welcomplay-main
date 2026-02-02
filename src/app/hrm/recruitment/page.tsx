'use client'

import { useMemo, lazy, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

const preloadTab = {
  jobs: () => import('@/components/hrm-recruitment').then((mod) => mod.JobsTab),
  jobCreate: () => import('@/components/hrm-recruitment').then((mod) => mod.JobCreateTab),
  applications: () => import('@/components/hrm-recruitment').then((mod) => mod.ApplicationsTab),
  candidates: () => import('@/components/hrm-recruitment').then((mod) => mod.CandidatesTab),
  onboarding: () => import('@/components/hrm-recruitment').then((mod) => mod.OnboardingTab),
  questions: () => import('@/components/hrm-recruitment').then((mod) => mod.CustomQuestionsTab),
  interviews: () => import('@/components/hrm-recruitment').then((mod) => mod.InterviewScheduleTab),
  career: () => import('@/components/hrm-recruitment').then((mod) => mod.CareerTab),
}

const JobsTab = lazy(() => import('@/components/hrm-recruitment').then((mod) => ({ default: mod.JobsTab })))
const JobCreateTab = lazy(() =>
  import('@/components/hrm-recruitment').then((mod) => ({ default: mod.JobCreateTab }))
)
const ApplicationsTab = lazy(() =>
  import('@/components/hrm-recruitment').then((mod) => ({ default: mod.ApplicationsTab }))
)
const CandidatesTab = lazy(() => import('@/components/hrm-recruitment').then((mod) => ({ default: mod.CandidatesTab })))
const OnboardingTab = lazy(() => import('@/components/hrm-recruitment').then((mod) => ({ default: mod.OnboardingTab })))
const CustomQuestionsTab = lazy(() =>
  import('@/components/hrm-recruitment').then((mod) => ({ default: mod.CustomQuestionsTab }))
)
const InterviewScheduleTab = lazy(() =>
  import('@/components/hrm-recruitment').then((mod) => ({ default: mod.InterviewScheduleTab }))
)
const CareerTab = lazy(() =>
  import('@/components/hrm-recruitment').then((mod) => ({ default: mod.CareerTab }))
)

const TabLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[100px] w-full" />
    <Skeleton className="h-[400px] w-full" />
  </div>
)

function TabContentWithCache({
  tabId,
  Component,
  cache,
}: {
  tabId: string
  Component: React.ComponentType
  cache: { [key: string]: React.ReactNode }
}) {
  if (!cache[tabId] && Component) {
    cache[tabId] = <Component />
  }
  return cache[tabId] ? <>{cache[tabId]}</> : null
}

export default function RecruitmentSetupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'jobs'
  const tabContentCache = useRef<{ [key: string]: React.ReactNode }>({})

  const recruitmentTabs = useMemo(
    () => [
      {
        id: 'jobs',
        title: 'Jobs',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="jobs" Component={JobsTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'jobCreate',
        title: 'Job Create',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="jobCreate" Component={JobCreateTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'applications',
        title: 'Job Application',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="applications" Component={ApplicationsTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'candidates',
        title: 'Job Candidate',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="candidates" Component={CandidatesTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'onboarding',
        title: 'Job On-boarding',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="onboarding" Component={OnboardingTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'questions',
        title: 'Custom Question',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="questions" Component={CustomQuestionsTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'interviews',
        title: 'Interview Schedule',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="interviews" Component={InterviewScheduleTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
      {
        id: 'career',
        title: 'Career',
        content: (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TabContentWithCache tabId="career" Component={CareerTab} cache={tabContentCache.current} />
          </Suspense>
        ),
      },
    ],
    []
  )

  const handleTabChange = (tabId: string) => {
    router.push(`/hrm/recruitment?tab=${tabId}`, { scroll: false })
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
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {/* Card title page - sesuai acuan /hrm/assets & reference-erp /job/create (route terpisah) */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <CardTitle className="text-2xl font-semibold">Recruitment</CardTitle>
                  <CardDescription>
                    Kelola lowongan kerja, lamaran, kandidat, onboarding, pertanyaan kustom, jadwal wawancara, dan halaman career.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            {/* Card untuk tab + konten - sesuai acuan card untuk title tab */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardContent className="px-6 pt-4 pb-6">
                <SmoothTab
                  items={recruitmentTabs}
                  value={activeTab}
                  defaultTabId={activeTab}
                  activeColor="bg-white dark:bg-gray-700 shadow-xs"
                  onChange={handleTabChange}
                  onTabPreload={(tabId) => {
                    const preload = preloadTab[tabId as keyof typeof preloadTab]
                    if (preload) preload()
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
