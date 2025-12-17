import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { DeductionOptionContent } from '@/components/hrm-payroll/deductionoption/DeductionOptionContent';

export default function DeductionOptionPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <DeductionOptionContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
