/**
 * Mock employee data untuk list, detail, dan edit page.
 * Digunakan oleh /hrm/employees, /hrm/employees/[employeeId], /hrm/employees/[employeeId]/edit
 */

export type EmployeeDetail = {
  id: number
  employeeId: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  branch: string
  department: string
  designation: string
  dateOfJoining: string
  lastLogin: string
  isActive: boolean
  salaryType: string
  basicSalary: string
  documents: { certificate: string; photo: string }
  bankAccount: {
    accountHolderName: string
    accountNumber: string
    bankName: string
    bankIdentifierCode: string
    branchLocation: string
    taxPayerId: string
  }
}

const employeesDetail: EmployeeDetail[] = [
  {
    id: 1,
    employeeId: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+62 812-3456-7890',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    address: 'Jakarta Selatan',
    branch: 'Main Branch',
    department: 'IT Department',
    designation: 'Software Engineer',
    dateOfJoining: '2024-01-15',
    lastLogin: '2024-10-31 09:30:00',
    isActive: true,
    salaryType: 'Monthly Payslip',
    basicSalary: '15000000',
    documents: { certificate: 'certificate.png', photo: 'profile.png' },
    bankAccount: {
      accountHolderName: 'John Doe',
      accountNumber: '14202546',
      bankName: 'Bank Central',
      bankIdentifierCode: '5879823',
      branchLocation: 'Jakarta',
      taxPayerId: '95682',
    },
  },
  {
    id: 2,
    employeeId: 'EMP002',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '+62 813-9876-5432',
    dateOfBirth: '1988-08-20',
    gender: 'Female',
    address: 'Bandung',
    branch: 'Main Branch',
    department: 'HR Department',
    designation: 'HR Manager',
    dateOfJoining: '2023-12-01',
    lastLogin: '2024-10-31 08:15:00',
    isActive: true,
    salaryType: 'Monthly Payslip',
    basicSalary: '18000000',
    documents: { certificate: 'certificate.png', photo: 'profile.png' },
    bankAccount: {
      accountHolderName: 'Jane Smith',
      accountNumber: '14202547',
      bankName: 'Bank Central',
      bankIdentifierCode: '5879823',
      branchLocation: 'Bandung',
      taxPayerId: '95683',
    },
  },
  {
    id: 3,
    employeeId: 'EMP003',
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    phone: '+62 821-1234-5678',
    dateOfBirth: '1992-03-10',
    gender: 'Male',
    address: 'Surabaya',
    branch: 'Branch Office',
    department: 'Sales Department',
    designation: 'Sales Executive',
    dateOfJoining: '2024-02-20',
    lastLogin: '2024-10-30 17:45:00',
    isActive: true,
    salaryType: 'Monthly Payslip',
    basicSalary: '12000000',
    documents: { certificate: 'certificate.png', photo: 'profile.png' },
    bankAccount: {
      accountHolderName: 'Bob Johnson',
      accountNumber: '14202548',
      bankName: 'Bank Central',
      bankIdentifierCode: '5879823',
      branchLocation: 'Surabaya',
      taxPayerId: '95684',
    },
  },
  {
    id: 4,
    employeeId: 'EMP004',
    name: 'Alice Brown',
    email: 'alice.brown@company.com',
    phone: '+62 822-5555-1234',
    dateOfBirth: '1991-11-25',
    gender: 'Female',
    address: 'Jakarta Pusat',
    branch: 'Main Branch',
    department: 'Finance Department',
    designation: 'Accountant',
    dateOfJoining: '2024-03-10',
    lastLogin: '',
    isActive: false,
    salaryType: 'Monthly Payslip',
    basicSalary: '14000000',
    documents: { certificate: 'certificate.png', photo: 'profile.png' },
    bankAccount: {
      accountHolderName: 'Alice Brown',
      accountNumber: '14202549',
      bankName: 'Bank Central',
      bankIdentifierCode: '5879823',
      branchLocation: 'Jakarta',
      taxPayerId: '95685',
    },
  },
  {
    id: 5,
    employeeId: 'EMP005',
    name: 'Charlie Wilson',
    email: 'charlie.wilson@company.com',
    phone: '+62 823-7777-9999',
    dateOfBirth: '1989-07-05',
    gender: 'Male',
    address: 'Medan',
    branch: 'Branch Office',
    department: 'Marketing Department',
    designation: 'Marketing Specialist',
    dateOfJoining: '2024-01-25',
    lastLogin: '2024-10-29 16:30:00',
    isActive: true,
    salaryType: 'Monthly Payslip',
    basicSalary: '13000000',
    documents: { certificate: 'certificate.png', photo: 'profile.png' },
    bankAccount: {
      accountHolderName: 'Charlie Wilson',
      accountNumber: '14202550',
      bankName: 'Bank Central',
      bankIdentifierCode: '5879823',
      branchLocation: 'Medan',
      taxPayerId: '95686',
    },
  },
]

export function getEmployeeById(employeeId: string): EmployeeDetail | null {
  return employeesDetail.find((e) => e.employeeId === employeeId) ?? null
}

export function getEmployeesList() {
  return employeesDetail.map((e) => ({
    id: e.id,
    employeeId: e.employeeId,
    name: e.name,
    email: e.email,
    branch: e.branch,
    department: e.department,
    designation: e.designation,
    dateOfJoining: e.dateOfJoining,
    lastLogin: e.lastLogin,
    isActive: e.isActive,
  }))
}
