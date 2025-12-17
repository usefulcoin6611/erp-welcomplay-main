import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { OtherPaymentContent } from '@/components/hrm-payroll/otherpayment/OtherPaymentContent';

export default function OtherPaymentPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <OtherPaymentContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
