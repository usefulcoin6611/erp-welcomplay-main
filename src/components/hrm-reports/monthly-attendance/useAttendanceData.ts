import { useState, useMemo, useEffect } from 'react';
import { generateMockAttendance, getDatesInMonth, type AttendanceData } from './constants';

export interface AttendanceFilters {
  month: string;
  branchId: string;
  departmentId: string;
  employeeId: string[];
}

export function useAttendanceData() {
  const [filters, setFilters] = useState<AttendanceFilters>({
    month: new Date().toISOString().slice(0, 7),
    branchId: '',
    departmentId: '',
    employeeId: [],
  });

  const [allData, setAllData] = useState<AttendanceData[]>([]);

  useEffect(() => {
    setAllData(generateMockAttendance(filters.month));
  }, [filters.month]);

  const filteredData = useMemo(() => {
    return allData.filter((item) => {
      if (filters.branchId && filters.branchId !== 'all' && item.branch.toLowerCase() !== filters.branchId) {
        return false;
      }
      if (filters.departmentId && filters.departmentId !== 'all' && item.department.toLowerCase() !== filters.departmentId) {
        return false;
      }
      if (filters.employeeId.length > 0 && !filters.employeeId.includes('all') && !filters.employeeId.includes(item.employeeId.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [allData, filters]);

  const dates = useMemo(() => getDatesInMonth(filters.month), [filters.month]);

  const summary = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalLate = 0;
    let overtimeHours = 0;
    let earlyLeaveHours = 0;

    filteredData.forEach((emp) => {
      Object.values(emp.attendance).forEach((status) => {
        if (status === 'P') totalPresent++;
        if (status === 'A') totalAbsent++;
        if (status === 'L') totalLeave++;
      });
    });

    // Mock additional statistics (deterministic based on present count)
    totalLate = Math.floor(totalPresent * 0.1);
    overtimeHours = parseFloat((totalPresent * 0.15 + 10).toFixed(2));
    earlyLeaveHours = parseFloat((totalPresent * 0.08 + 5).toFixed(2));

    return {
      totalPresent,
      totalAbsent,
      totalLeave,
      totalLate,
      overtimeHours,
      earlyLeaveHours,
    };
  }, [filteredData]);

  return {
    filters,
    setFilters,
    data: filteredData,
    dates,
    summary,
  };
}
