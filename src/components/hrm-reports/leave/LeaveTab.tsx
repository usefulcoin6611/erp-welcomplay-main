'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { useLeaveData } from './useLeaveData';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const LeaveFilters = dynamic(() => import('./LeaveFilters'), { ssr: false });
const LeaveTable = dynamic(() => import('./LeaveTable'), { ssr: false });

function LeaveTabComponent() {
  const { filters, setFilters, data, summary, filterOptions, loading } = useLeaveData();

  const handleReset = () => {
    setFilters({
      type: 'monthly',
      month: new Date().toISOString().slice(0, 7),
      year: new Date().getFullYear().toString(),
      branchId: 'all',
      departmentId: 'all',
    });
  };

  const handleExport = () => {
    console.log('Export leave data', data);
  };

  return (
    <div className="flex flex-col gap-4">
      <LeaveFilters
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={setFilters}
        onReset={handleReset}
        onExport={handleExport}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Leaves</div>
          <div className="text-2xl font-bold" suppressHydrationWarning>{summary.totalLeaves}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="text-2xl font-bold text-green-600" suppressHydrationWarning>{summary.totalApproved}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600" suppressHydrationWarning>{summary.totalPending}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
          <div className="text-2xl font-bold text-red-600" suppressHydrationWarning>{summary.totalRejected}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Days</div>
          <div className="text-2xl font-bold" suppressHydrationWarning>{summary.totalDays}</div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading leave data...</div>
      ) : (
        <LeaveTable data={data} />
      )}
    </div>
  );
}

export const LeaveTab = memo(LeaveTabComponent);
