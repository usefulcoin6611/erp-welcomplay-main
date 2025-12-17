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
  { value: 'emp006', label: 'Lisa Anderson' },
  { value: 'emp007', label: 'Rudi Hartono' },
];

export interface AttendanceData {
  employeeId: string;
  employeeName: string;
  department: string;
  branch: string;
  attendance: { [date: string]: 'P' | 'A' | 'L' }; // P=Present, A=Absent, L=Leave
}

// Generate dates for current month
export function getDatesInMonth(month: string): string[] {
  const [year, monthStr] = month.split('-');
  const daysInMonth = new Date(parseInt(year), parseInt(monthStr), 0).getDate();
  const dates: string[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(day.toString().padStart(2, '0'));
  }
  
  return dates;
}

// Simple seeded random function for consistent results
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Mock attendance data generator with deterministic random
export function generateMockAttendance(month: string): AttendanceData[] {
  const employees: AttendanceData[] = [
    {
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'IT',
      branch: 'Jakarta',
      attendance: {},
    },
    {
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      department: 'Finance',
      branch: 'Jakarta',
      attendance: {},
    },
    {
      employeeId: 'EMP003',
      employeeName: 'Ahmad Rizki',
      department: 'Marketing',
      branch: 'Bandung',
      attendance: {},
    },
    {
      employeeId: 'EMP004',
      employeeName: 'Siti Nurhaliza',
      department: 'HR',
      branch: 'Surabaya',
      attendance: {},
    },
    {
      employeeId: 'EMP005',
      employeeName: 'Budi Santoso',
      department: 'IT',
      branch: 'Jakarta',
      attendance: {},
    },
  ];

  const dates = getDatesInMonth(month);
  
  employees.forEach((emp, empIndex) => {
    dates.forEach((date, dateIndex) => {
      // Use seeded random for consistent results between server and client
      const seed = empIndex * 1000 + dateIndex + parseInt(date);
      const random = seededRandom(seed);
      
      // 85% present, 10% absent, 5% leave
      if (random < 0.85) {
        emp.attendance[date] = 'P';
      } else if (random < 0.95) {
        emp.attendance[date] = 'A';
      } else {
        emp.attendance[date] = 'L';
      }
    });
  });

  return employees;
}
