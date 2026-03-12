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
