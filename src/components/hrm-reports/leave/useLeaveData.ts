import { useState, useEffect, useCallback } from 'react';
import type { LeaveData } from './constants';

export interface LeaveFilters {
  type: 'monthly' | 'daily';
  month: string;
  year: string;
  branchId: string;
  departmentId: string;
}

export interface LeaveFilterOptions {
  branches: { value: string; label: string }[];
  departments: { value: string; label: string }[];
}

const defaultFilterOptions: LeaveFilterOptions = {
  branches: [{ value: 'all', label: 'All Branch' }],
  departments: [{ value: 'all', label: 'All Department' }],
};

export function useLeaveData() {
  const [filters, setFilters] = useState<LeaveFilters>({
    type: 'monthly',
    month: new Date().toISOString().slice(0, 7),
    year: new Date().getFullYear().toString(),
    branchId: 'all',
    departmentId: 'all',
  });

  const [filterOptions, setFilterOptions] = useState<LeaveFilterOptions>(defaultFilterOptions);
  const [data, setData] = useState<LeaveData[]>([]);
  const [summary, setSummary] = useState({
    totalApproved: 0,
    totalPending: 0,
    totalRejected: 0,
    totalLeaves: 0,
    totalDays: 0,
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
    });
  }, []);

  const fetchLeave = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      params.set('month', filters.month);
      params.set('year', filters.year);
      if (filters.branchId && filters.branchId !== 'all') params.set('branchId', filters.branchId);
      if (filters.departmentId && filters.departmentId !== 'all') params.set('departmentId', filters.departmentId);
      const res = await fetch(`/api/hrm/reports/leave?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setError(true);
        setData([]);
        setSummary({ totalApproved: 0, totalPending: 0, totalRejected: 0, totalLeaves: 0, totalDays: 0 });
        return;
      }
      setData(json.data ?? []);
      setSummary(json.summary ?? { totalApproved: 0, totalPending: 0, totalRejected: 0, totalLeaves: 0, totalDays: 0 });
    } catch {
      setError(true);
      setData([]);
      setSummary({ totalApproved: 0, totalPending: 0, totalRejected: 0, totalLeaves: 0, totalDays: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters.month, filters.year, filters.branchId, filters.departmentId]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchLeave();
  }, [fetchLeave]);

  return {
    filters,
    setFilters,
    data,
    summary,
    filterOptions,
    loading,
    error,
  };
}
