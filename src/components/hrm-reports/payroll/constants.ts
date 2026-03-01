export interface PayrollFilterOption {
  value: string;
  label: string;
  employeeId?: string;
}

export interface PayrollData {
  id: string;
  employeeId: string;
  employeeDbId?: string;
  employeeName: string;
  department: string;
  branch: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
}
