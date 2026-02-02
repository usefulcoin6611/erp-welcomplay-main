'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { MainContentWrapper } from '@/components/main-content-wrapper';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

/**
 * Layout Project System (URL root: /project_report, /taskboard, /bugs-report, /calendar).
 * Sama dengan projects/layout: SidebarProvider, MainContentWrapper, bg-gray-100, gap-4 p-4.
 */
export default function ProjectSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div className="flex flex-1 flex-col">
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              {children}
            </div>
          </MainContentWrapper>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
