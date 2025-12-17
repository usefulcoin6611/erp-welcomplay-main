'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, MapPin, Users, Calendar } from 'lucide-react';

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

function SummaryCard({ icon, title, value }: SummaryCardProps) {
  return (
    <Card className="report-card h-full">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="report-icon flex-shrink-0">{icon}</div>
        <div className="report-info flex-1 min-w-0">
          <h5 className="text-sm font-semibold mb-1">{title}</h5>
          <p className="text-xs text-muted-foreground truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface PayrollSummaryProps {
  type: string;
  branch: string;
  department: string;
  duration: string;
}

function PayrollSummary({ type, branch, department, duration }: PayrollSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <SummaryCard
        icon={
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3.09766 0.761719V20.668C3.09766 21.089 3.43835 21.4297 3.85938 21.4297H17.5703C17.9913 21.4297 18.332 21.089 18.332 20.668V0.761719C18.332 0.340691 17.9913 0 17.5703 0H3.85938C3.43835 0 3.09766 0.340691 3.09766 0.761719Z"
              fill="white"
            />
            <path
              d="M8.42969 26H22.1406C22.5617 26 22.9023 25.6593 22.9023 25.2383V5.38281C22.9023 4.96179 22.5617 4.62109 22.1406 4.62109H19.8555V20.668C19.8555 21.9281 18.8304 22.9531 17.5703 22.9531H7.66797V25.2383C7.66797 25.6593 8.00866 26 8.42969 26Z"
              fill="white"
            />
          </svg>
        }
        title="Report"
        value={`${type} Payroll Summary`}
      />
      <SummaryCard
        icon={<MapPin className="w-5 h-5" />}
        title="Branch"
        value={branch || 'All Branch'}
      />
      <SummaryCard
        icon={<Users className="w-5 h-5" />}
        title="Department"
        value={department || 'All Department'}
      />
      <SummaryCard
        icon={<Calendar className="w-5 h-5" />}
        title="Duration"
        value={duration}
      />
    </div>
  );
}

export default memo(PayrollSummary);
