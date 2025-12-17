import { useState, useMemo, useEffect } from 'react';
import { mockPayrollData, type PayrollData } from './constants';

export interface PayrollFilters {
  type: 'monthly' | 'daily';
  month: string;
  year: string;
  branchId: string;
  departmentId: string;
  employeeId: string;
}

export function usePayrollData() {
  const [filters, setFilters] = useState<PayrollFilters>({
    type: 'monthly',
    month: new Date().toISOString().slice(0, 7),
    year: new Date().getFullYear().toString(),
    branchId: '',
    departmentId: '',
    employeeId: '',
  });

  const [allData, setAllData] = useState<PayrollData[]>([]);

  useEffect(() => {
    setAllData(mockPayrollData);
  }, []);

  const filteredData = useMemo(() => {
    return allData.filter((item) => {
      if (filters.branchId && filters.branchId !== 'all' && item.branch.toLowerCase() !== filters.branchId) {
        return false;
      }
      if (filters.departmentId && filters.departmentId !== 'all' && item.department.toLowerCase() !== filters.departmentId) {
        return false;
      }
      if (filters.employeeId && filters.employeeId !== 'all' && item.employeeId.toLowerCase() !== filters.employeeId.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const summary = useMemo(() => {
    return {
      totalBasicSalary: filteredData.reduce((sum, item) => sum + item.basicSalary, 0),
      totalAllowances: filteredData.reduce((sum, item) => sum + item.allowances, 0),
      totalDeductions: filteredData.reduce((sum, item) => sum + item.deductions, 0),
      totalNetSalary: filteredData.reduce((sum, item) => sum + item.netSalary, 0),
      totalEmployees: filteredData.length,
    };
  }, [filteredData]);

  return {
    filters,
    setFilters,
    data: filteredData,
    summary,
  };
}
