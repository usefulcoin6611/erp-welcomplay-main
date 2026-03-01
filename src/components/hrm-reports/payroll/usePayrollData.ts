import { useState, useEffect, useCallback } from 'react';
import type { PayrollData } from './constants';

export interface PayrollFilters {
  type: 'monthly' | 'daily';
  month: string;
  year: string;
  branchId: string;
  departmentId: string;
  employeeId: string;
}

export interface PayrollFilterOptions {
  branches: { value: string; label: string }[];
  departments: { value: string; label: string }[];
  employees: { value: string; label: string; employeeId?: string }[];
}

const defaultFilterOptions: PayrollFilterOptions = {
  branches: [{ value: 'all', label: 'All Branch' }],
  departments: [{ value: 'all', label: 'All Department' }],
  employees: [{ value: 'all', label: 'All Employee' }],
};

export function usePayrollData() {
  const [filters, setFilters] = useState<PayrollFilters>({
    type: 'monthly',
    month: new Date().toISOString().slice(0, 7),
    year: new Date().getFullYear().toString(),
    branchId: 'all',
    departmentId: 'all',
    employeeId: 'all',
  });

  const [filterOptions, setFilterOptions] = useState<PayrollFilterOptions>(defaultFilterOptions);
  const [data, setData] = useState<PayrollData[]>([]);
  const [summary, setSummary] = useState({
    totalBasicSalary: 0,
    totalAllowances: 0,
    totalDeductions: 0,
    totalNetSalary: 0,
    totalEmployees: 0,
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

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      params.set('month', filters.month);
      if (filters.branchId && filters.branchId !== 'all') params.set('branchId', filters.branchId);
      if (filters.departmentId && filters.departmentId !== 'all') params.set('departmentId', filters.departmentId);
      if (filters.employeeId && filters.employeeId !== 'all') params.set('employeeId', filters.employeeId);
      const res = await fetch(`/api/hrm/reports/payroll?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setError(true);
        setData([]);
        setSummary({ totalBasicSalary: 0, totalAllowances: 0, totalDeductions: 0, totalNetSalary: 0, totalEmployees: 0 });
        return;
      }
      setData(json.data ?? []);
      setSummary(json.summary ?? { totalBasicSalary: 0, totalAllowances: 0, totalDeductions: 0, totalNetSalary: 0, totalEmployees: 0 });
    } catch {
      setError(true);
      setData([]);
      setSummary({ totalBasicSalary: 0, totalAllowances: 0, totalDeductions: 0, totalNetSalary: 0, totalEmployees: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters.month, filters.branchId, filters.departmentId, filters.employeeId]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

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
