'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { usePayrollData } from './usePayrollData';

const PayrollFilters = dynamic(() => import('./PayrollFilters'), { ssr: false });
const PayrollSummary = dynamic(() => import('./PayrollSummary'), { ssr: false });
const PayrollTable = dynamic(() => import('./PayrollTable'), { ssr: false });

function PayrollTabComponent() {
  const { filters, setFilters, data, summary, filterOptions, loading } = usePayrollData();

  const handleReset = () => {
    setFilters({
      type: 'monthly',
      month: new Date().toISOString().slice(0, 7),
      year: new Date().getFullYear().toString(),
      branchId: 'all',
      departmentId: 'all',
      employeeId: 'all',
    });
  };

  const handleExport = () => {
    if (!data.length) return;
    const { exportToCSV } = require('@/components/reports/utils/exportUtils');
    const exportData = data.map(item => ({
      'Employee ID': item.employeeId,
      'Employee Name': item.employeeName,
      'Department': item.department,
      'Branch': item.branch,
      'Basic Salary': item.basicSalary,
      'Allowances': item.allowances,
      'Deductions': item.deductions,
      'Net Salary': item.netSalary,
      'Payment Date': item.paymentDate
    }));
    exportToCSV(exportData, `payroll_report_${filters.month}`);
  };

  const handleDownload = () => {
    // For now, download as CSV as well
    handleExport();
  };

  const getBranchName = () => {
    if (!filters.branchId || filters.branchId === 'all') return 'All Branch';
    const found = filterOptions.branches.find(b => b.value === filters.branchId);
    return found ? found.label : filters.branchId;
  };

  const getDepartmentName = () => {
    if (!filters.departmentId || filters.departmentId === 'all') return 'All Department';
    const found = filterOptions.departments.find(d => d.value === filters.departmentId);
    return found ? found.label : filters.departmentId;
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
        filterOptions={filterOptions}
        onFilterChange={setFilters}
        onReset={handleReset}
        onExport={handleExport}
        onDownload={handleDownload}
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

      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading payroll data...</div>
      ) : (
        <PayrollTable data={data} />
      )}
    </div>
  );
}

export const PayrollTab = memo(PayrollTabComponent);
