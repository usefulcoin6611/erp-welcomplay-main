import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { SetSalaryContent } from '@/components/hrm-payroll/salary/SetSalaryContent';

export default function SetSalaryPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <SetSalaryContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
