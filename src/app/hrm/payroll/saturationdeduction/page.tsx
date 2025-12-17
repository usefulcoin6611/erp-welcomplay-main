import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { SaturationDeductionContent } from '@/components/hrm-payroll/saturationdeduction/SaturationDeductionContent';

export default function SaturationDeductionPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <SaturationDeductionContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
