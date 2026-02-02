/**
 * Mock payroll data untuk Set Salary & Payslip.
 * Digunakan oleh /hrm/payroll (Set Salary tab, Payslip tab), detail & edit pages.
 */

export type SalaryDetail = {
  id: string;
  employeeId: string;
  name: string;
  payrollType: string;
  salary: number;
  netSalary: number;
  allowances: number;
  deductions: number;
  department: string;
  branch?: string;
  effectiveDate?: string;
}

export type PayslipDetail = {
  id: string;
  employeeId: string;
  employeeName: string;
  payrollType: string;
  salary: number;
  netSalary: number;
  allowances: number;
  deductions: number;
  status: 'Paid' | 'UnPaid';
  month: string;
  year: string;
  paidAt?: string;
}

const salaryList: SalaryDetail[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'John Doe',
    payrollType: 'Monthly',
    salary: 8000000,
    allowances: 1500000,
    deductions: 500000,
    netSalary: 9000000,
    department: 'IT',
    branch: 'Main Branch',
    effectiveDate: '2024-01-01',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Jane Smith',
    payrollType: 'Monthly',
    salary: 7500000,
    allowances: 1200000,
    deductions: 400000,
    netSalary: 8300000,
    department: 'HR',
    branch: 'Main Branch',
    effectiveDate: '2024-01-01',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Bob Johnson',
    payrollType: 'Monthly',
    salary: 9000000,
    allowances: 2000000,
    deductions: 600000,
    netSalary: 10400000,
    department: 'Finance',
    branch: 'Main Branch',
    effectiveDate: '2024-01-01',
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Alice Brown',
    payrollType: 'Hourly',
    salary: 6000000,
    allowances: 800000,
    deductions: 300000,
    netSalary: 6500000,
    department: 'Marketing',
    branch: 'Branch Bandung',
    effectiveDate: '2024-02-01',
  },
];

const payslipList: PayslipDetail[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    payrollType: 'Monthly',
    salary: 8000000,
    netSalary: 9000000,
    allowances: 1500000,
    deductions: 500000,
    status: 'Paid',
    month: '03',
    year: '2024',
    paidAt: '2024-03-28T10:00:00',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    payrollType: 'Monthly',
    salary: 7500000,
    netSalary: 8300000,
    allowances: 1200000,
    deductions: 400000,
    status: 'UnPaid',
    month: '03',
    year: '2024',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'Bob Johnson',
    payrollType: 'Monthly',
    salary: 9000000,
    netSalary: 10400000,
    allowances: 2000000,
    deductions: 600000,
    status: 'Paid',
    month: '03',
    year: '2024',
    paidAt: '2024-03-29T14:30:00',
  },
  {
    id: '4',
    employeeId: 'EMP004',
    employeeName: 'Alice Brown',
    payrollType: 'Hourly',
    salary: 6000000,
    netSalary: 6500000,
    allowances: 800000,
    deductions: 300000,
    status: 'UnPaid',
    month: '03',
    year: '2024',
  },
];

let mutablePayslips = [...payslipList];

export function getSalaryById(id: string): SalaryDetail | undefined {
  return salaryList.find((s) => s.id === id);
}

export function getSalaryList(): SalaryDetail[] {
  return salaryList;
}

export function getPayslipById(id: string): PayslipDetail | undefined {
  return mutablePayslips.find((p) => p.id === id);
}

export function getPayslipsList(): PayslipDetail[] {
  return mutablePayslips;
}

export function setPayslipsList(list: PayslipDetail[]): void {
  mutablePayslips = list;
}

export function removePayslipById(id: string): void {
  mutablePayslips = mutablePayslips.filter((p) => p.id !== id);
}

export function updatePayslipStatus(id: string, status: 'Paid' | 'UnPaid', paidAt?: string): void {
  mutablePayslips = mutablePayslips.map((p) =>
    p.id === id ? { ...p, status, paidAt: status === 'Paid' ? paidAt ?? new Date().toISOString() : undefined } : p
  );
}

export function updatePayslip(id: string, data: Partial<PayslipDetail>): void {
  mutablePayslips = mutablePayslips.map((p) => (p.id === id ? { ...p, ...data } : p));
}
