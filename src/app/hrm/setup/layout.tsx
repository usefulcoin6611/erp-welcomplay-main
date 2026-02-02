'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { MainContentWrapper } from '@/components/main-content-wrapper';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Sidebar vertikal HRM System Setup (Branch, Department, Designation, ...).
 * Item aktif: style project (sky) konsisten dengan tombol Create/Edit di HRM.
 */
const HRM_SETUP_ITEMS = [
  { id: 'branch', label: 'Branch', href: '/hrm/setup/branch' },
  { id: 'department', label: 'Department', href: '/hrm/setup/department' },
  { id: 'designation', label: 'Designation', href: '/hrm/setup/designation' },
  { id: 'leave-type', label: 'Leave Type', href: '#' },
  { id: 'document-type', label: 'Document Type', href: '#' },
  { id: 'payslip-type', label: 'Payslip Type', href: '#' },
  { id: 'allowance-option', label: 'Allowance Option', href: '#' },
  { id: 'loan-option', label: 'Loan Option', href: '#' },
  { id: 'deduction-option', label: 'Deduction Option', href: '#' },
  { id: 'goal-type', label: 'Goal Type', href: '#' },
  { id: 'training-type', label: 'Training Type', href: '#' },
  { id: 'award-type', label: 'Award Type', href: '#' },
  { id: 'termination-type', label: 'Termination Type', href: '#' },
  { id: 'job-category', label: 'Job Category', href: '#' },
  { id: 'job-stage', label: 'Job Stage', href: '#' },
  { id: 'performance-type', label: 'Performance Type', href: '#' },
  { id: 'competencies', label: 'Competencies', href: '#' },
] as const;

export default function HRMSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
            <div className="@container/main flex flex-1 gap-4 p-4 bg-gray-100">
              {/* Sidebar vertikal kiri - item aktif pakai style project (sky) */}
              <aside className="w-56 shrink-0">
                <nav
                  className="rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden"
                  aria-label="HRM System Setup"
                >
                  <ul className="flex flex-col py-1">
                    {HRM_SETUP_ITEMS.map((item) => {
                      const isActive = pathname === item.href;
                      const isLink = item.href !== '#';
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400'
                                : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground',
                              !isLink && 'pointer-events-none opacity-60'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <span>{item.label}</span>
                            <ChevronRight
                              className={cn(
                                'h-4 w-4 shrink-0',
                                isActive ? 'text-sky-600' : 'text-muted-foreground'
                              )}
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </aside>
              {/* Area konten kanan */}
              <div className="min-w-0 flex-1 flex flex-col gap-4">
                {children}
              </div>
            </div>
          </MainContentWrapper>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
