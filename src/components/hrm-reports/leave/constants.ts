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

export const leaveTypes = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'emergency', label: 'Emergency Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
];

export const leaveStatuses = [
  { value: 'approved', label: 'Approved', color: 'text-green-600' },
  { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
  { value: 'rejected', label: 'Rejected', color: 'text-red-600' },
];

export interface LeaveData {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  branch: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'approved' | 'pending' | 'rejected';
  appliedDate: string;
}

export const mockLeaveData: LeaveData[] = [
  {
    id: 'LEV001',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    department: 'IT',
    branch: 'Jakarta',
    leaveType: 'annual',
    startDate: '2024-02-05',
    endDate: '2024-02-09',
    days: 5,
    reason: 'Family vacation',
    status: 'approved',
    appliedDate: '2024-01-20',
  },
  {
    id: 'LEV002',
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    department: 'Finance',
    branch: 'Jakarta',
    leaveType: 'sick',
    startDate: '2024-02-12',
    endDate: '2024-02-13',
    days: 2,
    reason: 'Flu and fever',
    status: 'approved',
    appliedDate: '2024-02-11',
  },
  {
    id: 'LEV003',
    employeeId: 'EMP003',
    employeeName: 'Ahmad Rizki',
    department: 'Marketing',
    branch: 'Bandung',
    leaveType: 'annual',
    startDate: '2024-02-15',
    endDate: '2024-02-16',
    days: 2,
    reason: 'Personal matters',
    status: 'pending',
    appliedDate: '2024-02-10',
  },
  {
    id: 'LEV004',
    employeeId: 'EMP004',
    employeeName: 'Siti Nurhaliza',
    department: 'HR',
    branch: 'Surabaya',
    leaveType: 'emergency',
    startDate: '2024-02-08',
    endDate: '2024-02-08',
    days: 1,
    reason: 'Family emergency',
    status: 'approved',
    appliedDate: '2024-02-07',
  },
  {
    id: 'LEV005',
    employeeId: 'EMP005',
    employeeName: 'Budi Santoso',
    department: 'IT',
    branch: 'Jakarta',
    leaveType: 'sick',
    startDate: '2024-02-20',
    endDate: '2024-02-22',
    days: 3,
    reason: 'Medical checkup',
    status: 'pending',
    appliedDate: '2024-02-15',
  },
  {
    id: 'LEV006',
    employeeId: 'EMP006',
    employeeName: 'Lisa Anderson',
    department: 'Marketing',
    branch: 'Bandung',
    leaveType: 'annual',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    days: 5,
    reason: 'Holiday trip',
    status: 'rejected',
    appliedDate: '2024-02-18',
  },
  {
    id: 'LEV007',
    employeeId: 'EMP007',
    employeeName: 'Rudi Hartono',
    department: 'Finance',
    branch: 'Surabaya',
    leaveType: 'unpaid',
    startDate: '2024-02-25',
    endDate: '2024-02-27',
    days: 3,
    reason: 'Personal travel',
    status: 'pending',
    appliedDate: '2024-02-16',
  },
];
