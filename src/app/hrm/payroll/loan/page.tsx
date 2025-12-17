import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { LoanContent } from '@/components/hrm-payroll/loan/LoanContent';

export default function LoanPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <LoanContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
