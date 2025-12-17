import { useState, useMemo, useEffect } from 'react';
import { mockLeaveData, type LeaveData } from './constants';

export interface LeaveFilters {
  type: 'monthly' | 'daily';
  month: string;
  year: string;
  branchId: string;
  departmentId: string;
}

export function useLeaveData() {
  const [filters, setFilters] = useState<LeaveFilters>({
    type: 'monthly',
    month: new Date().toISOString().slice(0, 7),
    year: new Date().getFullYear().toString(),
    branchId: '',
    departmentId: '',
  });

  const [allData, setAllData] = useState<LeaveData[]>([]);

  useEffect(() => {
    setAllData(mockLeaveData);
  }, []);

  const filteredData = useMemo(() => {
    return allData.filter((item) => {
      if (filters.branchId && filters.branchId !== 'all' && item.branch.toLowerCase() !== filters.branchId) {
        return false;
      }
      if (filters.departmentId && filters.departmentId !== 'all' && item.department.toLowerCase() !== filters.departmentId) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const summary = useMemo(() => {
    const totalApproved = filteredData.filter((item) => item.status === 'approved').length;
    const totalPending = filteredData.filter((item) => item.status === 'pending').length;
    const totalRejected = filteredData.filter((item) => item.status === 'rejected').length;
    const totalDays = filteredData.reduce((sum, item) => sum + item.days, 0);

    return {
      totalApproved,
      totalPending,
      totalRejected,
      totalLeaves: filteredData.length,
      totalDays,
    };
  }, [filteredData]);

  return {
    filters,
    setFilters,
    data: filteredData,
    summary,
  };
}
