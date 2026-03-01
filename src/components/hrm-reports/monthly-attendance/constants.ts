export interface AttendanceData {
  employeeId: string;
  employeeName: string;
  department: string;
  branch: string;
  attendance: { [date: string]: 'P' | 'A' | 'L' };
}

export function getDatesInMonth(month: string): string[] {
  const [year, monthStr] = month.split('-');
  const daysInMonth = new Date(parseInt(year, 10), parseInt(monthStr, 10), 0).getDate();
  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(day.toString().padStart(2, '0'));
  }
  return dates;
}
