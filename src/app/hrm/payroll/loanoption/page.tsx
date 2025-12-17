import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { LoanOptionContent } from '@/components/hrm-payroll/loanoption/LoanOptionContent';

export default function LoanOptionPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <LoanOptionContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
