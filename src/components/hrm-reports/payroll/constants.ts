export const branches = [
  { value: 'all', label: 'All Branch' },
  { value: 'jakarta', label: 'Jakarta' },
  { value: 'bandung', label: 'Bandung' },
  { value: 'surabaya', label: 'Surabaya' },
];

export const departments = [
  { value: 'all', label: 'All Department' },
  { value: 'it', label: 'IT' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
];

export const employees = [
  { value: 'all', label: 'All Employee' },
  { value: 'emp001', label: 'John Doe' },
  { value: 'emp002', label: 'Jane Smith' },
  { value: 'emp003', label: 'Ahmad Rizki' },
  { value: 'emp004', label: 'Siti Nurhaliza' },
  { value: 'emp005', label: 'Budi Santoso' },
];

export interface PayrollData {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  branch: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
}

export const mockPayrollData: PayrollData[] = [
  {
    id: 'PAY001',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    department: 'IT',
    branch: 'Jakarta',
    basicSalary: 15000000,
    allowances: 2500000,
    deductions: 1000000,
    netSalary: 16500000,
    paymentDate: '2024-01-31',
  },
  {
    id: 'PAY002',
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    department: 'Finance',
    branch: 'Jakarta',
    basicSalary: 12000000,
    allowances: 2000000,
    deductions: 800000,
    netSalary: 13200000,
    paymentDate: '2024-01-31',
  },
  {
    id: 'PAY003',
    employeeId: 'EMP003',
    employeeName: 'Ahmad Rizki',
    department: 'Marketing',
    branch: 'Bandung',
    basicSalary: 10000000,
    allowances: 1500000,
    deductions: 600000,
    netSalary: 10900000,
    paymentDate: '2024-01-31',
  },
  {
    id: 'PAY004',
    employeeId: 'EMP004',
    employeeName: 'Siti Nurhaliza',
    department: 'HR',
    branch: 'Surabaya',
    basicSalary: 11000000,
    allowances: 1800000,
    deductions: 700000,
    netSalary: 12100000,
    paymentDate: '2024-01-31',
  },
  {
    id: 'PAY005',
    employeeId: 'EMP005',
    employeeName: 'Budi Santoso',
    department: 'IT',
    branch: 'Jakarta',
    basicSalary: 13000000,
    allowances: 2200000,
    deductions: 900000,
    netSalary: 14300000,
    paymentDate: '2024-01-31',
  },
  {
    id: 'PAY006',
    employeeId: 'EMP006',
    employeeName: 'Lisa Anderson',
    department: 'Marketing',
    branch: 'Bandung',
    basicSalary: 9500000,
    allowances: 1400000,
    deductions: 550000,
    netSalary: 10350000,
    paymentDate: '2024-01-31',
  },
  {
    id: 'PAY007',
    employeeId: 'EMP007',
    employeeName: 'Rudi Hartono',
    department: 'Finance',
    branch: 'Surabaya',
    basicSalary: 11500000,
    allowances: 1900000,
    deductions: 750000,
    netSalary: 12650000,
    paymentDate: '2024-01-31',
  },
];
