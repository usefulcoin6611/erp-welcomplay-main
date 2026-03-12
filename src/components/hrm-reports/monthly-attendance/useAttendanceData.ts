import { useState, useEffect, useCallback } from 'react';
import { getDatesInMonth, type AttendanceData } from './constants';

export interface AttendanceFilters {
  month: string;
  branchId: string;
  departmentId: string;
  employeeId: string[];
}

export interface AttendanceFilterOptions {
  branches: { value: string; label: string }[];
  departments: { value: string; label: string }[];
  employees: { value: string; label: string; employeeId?: string }[];
}

const defaultFilterOptions: AttendanceFilterOptions = {
  branches: [{ value: 'all', label: 'All Branch' }],
  departments: [{ value: 'all', label: 'All Department' }],
  employees: [{ value: 'all', label: 'All Employee' }],
};

export function useAttendanceData() {
  const [filters, setFilters] = useState<AttendanceFilters>({
    month: new Date().toISOString().slice(0, 7),
    branchId: 'all',
    departmentId: 'all',
    employeeId: ['all'],
  });

  const [filterOptions, setFilterOptions] = useState<AttendanceFilterOptions>(defaultFilterOptions);
  const [data, setData] = useState<AttendanceData[]>([]);
  const [dates, setDates] = useState<string[]>(getDatesInMonth(filters.month));
  const [summary, setSummary] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalLeave: 0,
    totalLate: 0,
    overtimeHours: 0,
    earlyLeaveHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchFilters = useCallback(async () => {
    const res = await fetch('/api/hrm/reports/filters');
    const json = await res.json();
    if (!json?.success || !json?.data) return;
    const d = json.data;
    setFilterOptions({
      branches: [{ value: 'all', label: 'All Branch' }, ...(d.branches || [])],
      departments: [{ value: 'all', label: 'All Department' }, ...(d.departments || [])],
      employees: [{ value: 'all', label: 'All Employee' }, ...(d.employees || [])],
    });
  }, []);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      params.set('month', filters.month);
      if (filters.branchId && filters.branchId !== 'all') params.set('branchId', filters.branchId);
      if (filters.departmentId && filters.departmentId !== 'all') params.set('departmentId', filters.departmentId);
      const singleEmployee = filters.employeeId?.filter((id) => id && id !== 'all')[0];
      if (singleEmployee) params.set('employeeId', singleEmployee);
      const res = await fetch(`/api/hrm/reports/attendance?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setError(true);
        setData([]);
        setDates(getDatesInMonth(filters.month));
        setSummary({ totalPresent: 0, totalAbsent: 0, totalLeave: 0, totalLate: 0, overtimeHours: 0, earlyLeaveHours: 0 });
        return;
      }
      setData(json.data ?? []);
      setDates(json.dates ?? getDatesInMonth(filters.month));
      setSummary(
        json.summary ?? { totalPresent: 0, totalAbsent: 0, totalLeave: 0, totalLate: 0, overtimeHours: 0, earlyLeaveHours: 0 }
      );
    } catch {
      setError(true);
      setData([]);
      setDates(getDatesInMonth(filters.month));
      setSummary({ totalPresent: 0, totalAbsent: 0, totalLeave: 0, totalLate: 0, overtimeHours: 0, earlyLeaveHours: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters.month, filters.branchId, filters.departmentId, filters.employeeId]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    setDates(getDatesInMonth(filters.month));
    fetchAttendance();
  }, [filters.month, fetchAttendance]);

  return {
    filters,
    setFilters,
    data,
    dates,
    summary,
    filterOptions,
    loading,
    error,
  };
}
