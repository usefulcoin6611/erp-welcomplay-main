import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { OvertimeContent } from '@/components/hrm-payroll/overtime/OvertimeContent';

export default function OvertimePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <OvertimeContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
