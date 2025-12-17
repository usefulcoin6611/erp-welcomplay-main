'use client';

import { lazy, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SmoothTab } from '@/components/ui/smooth-tab';

// Lazy load tab components
const preloadTab = {
  jobs: () => import('@/components/hrm-recruitment').then((mod) => mod.JobsTab),
  applications: () => import('@/components/hrm-recruitment').then((mod) => mod.ApplicationsTab),
  candidates: () => import('@/components/hrm-recruitment').then((mod) => mod.CandidatesTab),
  onboarding: () => import('@/components/hrm-recruitment').then((mod) => mod.OnboardingTab),
  questions: () => import('@/components/hrm-recruitment').then((mod) => mod.CustomQuestionsTab),
  interviews: () => import('@/components/hrm-recruitment').then((mod) => mod.InterviewScheduleTab),
};

const JobsTab = lazy(() => import('@/components/hrm-recruitment').then((mod) => ({ default: mod.JobsTab })));
const ApplicationsTab = lazy(() =>
  import('@/components/hrm-recruitment').then((mod) => ({ default: mod.ApplicationsTab }))
);
const CandidatesTab = lazy(() => import('@/components/hrm-recruitment').then((mod) => ({ default: mod.CandidatesTab })));
const OnboardingTab = lazy(() => import('@/components/hrm-recruitment').then((mod) => ({ default: mod.OnboardingTab })));
const CustomQuestionsTab = lazy(() =>
  import('@/components/hrm-recruitment').then((mod) => ({ default: mod.CustomQuestionsTab }))
);
const InterviewScheduleTab = lazy(() =>
  import('@/components/hrm-recruitment').then((mod) => ({ default: mod.InterviewScheduleTab }))
);

export default function RecruitmentSetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'jobs';

  const recruitmentTabs = useMemo(
    () => [
      {
        id: 'jobs',
        title: 'Jobs',
        content: <JobsTab />,
      },
      {
        id: 'applications',
        title: 'Job Application',
        content: <ApplicationsTab />,
      },
      {
        id: 'candidates',
        title: 'Job Candidate',
        content: <CandidatesTab />,
      },
      {
        id: 'onboarding',
        title: 'Job On-boarding',
        content: <OnboardingTab />,
      },
      {
        id: 'questions',
        title: 'Custom Question',
        content: <CustomQuestionsTab />,
      },
      {
        id: 'interviews',
        title: 'Interview Schedule',
        content: <InterviewScheduleTab />,
      },
    ],
    []
  );

  const handleTabChange = (tabId: string) => {
    router.push(`?tab=${tabId}`);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <SmoothTab
            items={recruitmentTabs}
            defaultTabId={activeTab}
            activeColor="bg-white dark:bg-gray-700 shadow-xs"
            onChange={handleTabChange}
            onTabPreload={(tabId) => {
              // Preload tab component on hover for instant switching
              if (preloadTab[tabId as keyof typeof preloadTab]) {
                preloadTab[tabId as keyof typeof preloadTab]();
              }
            }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
