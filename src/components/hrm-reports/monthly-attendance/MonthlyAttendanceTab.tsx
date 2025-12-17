'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { useAttendanceData } from './useAttendanceData';
import { Calendar, UserCheck, UserX, Clock, DollarSign, LogOut } from 'lucide-react';

const AttendanceFilters = dynamic(() => import('./AttendanceFilters'), { ssr: false });
const AttendanceTable = dynamic(() => import('./AttendanceTable'), { ssr: false });

function MonthlyAttendanceTabComponent() {
  const { filters, setFilters, data, dates, summary } = useAttendanceData();

  const handleReset = () => {
    setFilters({
      month: new Date().toISOString().slice(0, 7),
      branchId: '',
      departmentId: '',
      employeeId: [],
    });
  };

  const handleExport = () => {
    console.log('Export attendance data', data);
  };

  const formatMonth = () => {
    return new Date(filters.month + '-01').toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <AttendanceFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        onExport={handleExport}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <div className="text-xs text-muted-foreground">Total Present</div>
          </div>
          <div className="text-2xl font-bold text-green-600" suppressHydrationWarning>{summary.totalPresent}</div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-green-600" />
            <div className="text-xs text-muted-foreground">Total Leave</div>
          </div>
          <div className="text-2xl font-bold text-blue-600" suppressHydrationWarning>{summary.totalLeave}</div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserX className="w-4 h-4 text-red-600" />
            <div className="text-xs text-muted-foreground">Total Absent</div>
          </div>
          <div className="text-2xl font-bold text-red-600" suppressHydrationWarning>{summary.totalAbsent}</div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <div className="text-xs text-muted-foreground">Late Arrivals</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600" suppressHydrationWarning>{summary.totalLate}</div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <div className="text-xs text-muted-foreground">Overtime (hrs)</div>
          </div>
          <div className="text-2xl font-bold text-purple-600" suppressHydrationWarning>{summary.overtimeHours.toFixed(2)}</div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <LogOut className="w-4 h-4 text-orange-600" />
            <div className="text-xs text-muted-foreground">Early Leave (hrs)</div>
          </div>
          <div className="text-2xl font-bold text-orange-600" suppressHydrationWarning>{summary.earlyLeaveHours.toFixed(2)}</div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <h5 className="text-sm font-semibold">Attendance Report</h5>
            <p className="text-xs text-muted-foreground">{formatMonth()}</p>
          </div>
        </div>
      </div>

      <AttendanceTable data={data} dates={dates} />
    </div>
  );
}

export const MonthlyAttendanceTab = memo(MonthlyAttendanceTabComponent);
