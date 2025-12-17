import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { PayslipTypeContent } from '@/components/hrm-payroll/paysliptype/PayslipTypeContent';

export default function PayslipTypePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <PayslipTypeContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
