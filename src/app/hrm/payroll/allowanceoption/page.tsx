import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { AllowanceOptionContent } from '@/components/hrm-payroll/allowanceoption/AllowanceOptionContent';

export default function AllowanceOptionPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <AllowanceOptionContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
