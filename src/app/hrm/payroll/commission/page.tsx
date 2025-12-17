import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { CommissionContent } from '@/components/hrm-payroll/commission/CommissionContent';

export default function CommissionPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <CommissionContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
