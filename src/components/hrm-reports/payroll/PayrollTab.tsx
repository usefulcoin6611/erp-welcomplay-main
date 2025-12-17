'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { usePayrollData } from './usePayrollData';

const PayrollFilters = dynamic(() => import('./PayrollFilters'), { ssr: false });
const PayrollSummary = dynamic(() => import('./PayrollSummary'), { ssr: false });
const PayrollTable = dynamic(() => import('./PayrollTable'), { ssr: false });

function PayrollTabComponent() {
  const { filters, setFilters, data, summary } = usePayrollData();

  const handleReset = () => {
    setFilters({
      type: 'monthly',
      month: new Date().toISOString().slice(0, 7),
      year: new Date().getFullYear().toString(),
      branchId: '',
      departmentId: '',
      employeeId: '',
    });
  };

  const handleExport = () => {
    console.log('Export payroll data', data);
  };

  const getBranchName = () => {
    if (!filters.branchId || filters.branchId === 'all') return 'All Branch';
    return filters.branchId.charAt(0).toUpperCase() + filters.branchId.slice(1);
  };

  const getDepartmentName = () => {
    if (!filters.departmentId || filters.departmentId === 'all') return 'All Department';
    return filters.departmentId.toUpperCase();
  };

  const getDuration = () => {
    if (filters.type === 'monthly') {
      return new Date(filters.month + '-01').toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
    }
    return filters.year;
  };

  return (
    <div className="flex flex-col gap-4">
      <PayrollFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        onExport={handleExport}
      />

      <PayrollSummary
        type={filters.type === 'monthly' ? 'Monthly' : 'Daily'}
        branch={getBranchName()}
        department={getDepartmentName()}
        duration={getDuration()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Employees</div>
          <div className="text-2xl font-bold" suppressHydrationWarning>{summary.totalEmployees}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Basic Salary</div>
          <div className="text-2xl font-bold" suppressHydrationWarning>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summary.totalBasicSalary)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Allowances</div>
          <div className="text-2xl font-bold text-green-600" suppressHydrationWarning>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summary.totalAllowances)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Deductions</div>
          <div className="text-2xl font-bold text-red-600" suppressHydrationWarning>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summary.totalDeductions)}
          </div>
        </div>
      </div>

      <PayrollTable data={data} />
    </div>
  );
}

export const PayrollTab = memo(PayrollTabComponent);
