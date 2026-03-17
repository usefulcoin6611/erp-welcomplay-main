'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { useAttendanceData } from './useAttendanceData';
import { Calendar, UserCheck, UserX, Clock, DollarSign, LogOut } from 'lucide-react';

const AttendanceFilters = dynamic(() => import('./AttendanceFilters'), { ssr: false });
const AttendanceTable = dynamic(() => import('./AttendanceTable'), { ssr: false });

function MonthlyAttendanceTabComponent() {
  const { filters, setFilters, data, dates, summary, filterOptions, loading } = useAttendanceData();

  const handleReset = () => {
    setFilters({
      month: new Date().toISOString().slice(0, 7),
      branchId: 'all',
      departmentId: 'all',
      employeeId: ['all'],
    });
  };

  const handleExport = () => {
    if (!data.length) return;
    const { exportToCSV } = require('@/components/reports/utils/exportUtils');
    const exportData = data.map(item => {
      const row: any = {
        'Employee ID': item.employeeId,
        'Employee Name': item.employeeName,
        'Department': item.department,
        'Branch': item.branch,
      };
      
      // Add each date's attendance status
      dates.forEach(date => {
        row[date] = item.attendance[date] || '-';
      });
      
      return row;
    });
    
    exportToCSV(exportData, `attendance_report_${filters.month}`);
  };

  const handleDownload = () => {
    handleExport();
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
        filterOptions={filterOptions}
        onFilterChange={setFilters}
        onReset={handleReset}
        onExport={handleExport}
        onDownload={handleDownload}
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

      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading attendance data...</div>
      ) : (
        <AttendanceTable data={data} dates={dates} />
      )}
    </div>
  );
}

export const MonthlyAttendanceTab = memo(MonthlyAttendanceTabComponent);
