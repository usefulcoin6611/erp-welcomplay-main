/**
 * Seeds attendance for existing employees for simulation:
 * - My Attendance page: history, overview (pie), and month filter
 * - Uses server-local dates to match API/HRM behavior
 * - Status: Present (with clock in/out), Absent, Leave (no punch)
 * - Covers past ~60 days so multiple months have data
 */

import { PrismaClient } from "@prisma/client";

/** Simple deterministic hash from string to 0..1 for reproducible per-employee/day variation */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return (h % 10000) / 10000;
}

export async function seedAttendance(prisma: PrismaClient | any) {
  console.log("Seeding Attendance...");

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  if (!employees?.length) {
    console.log("No active employees found, skipping attendance seed.");
    return;
  }

  const today = new Date();
  const daysToSeed = 60; // ~2 months for month filter simulation
  let created = 0;
  let updated = 0;

  for (let d = 1; d <= daysToSeed; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const day = dt.getDate();
    // Server-local midnight (matches API and HRM month filter)
    const targetDate = new Date(y, m - 1, day);

    for (const emp of employees) {
      const seedKey = `${emp.id}-${y}-${m}-${day}`;
      const r = hash(seedKey);
      // Deterministic mix: ~70% Present, ~15% Absent, ~15% Leave
      const status =
        r < 0.7 ? "Present" : r < 0.85 ? "Absent" : "Leave";

      let clockIn: Date | null = null;
      let clockOut: Date | null = null;
      if (status === "Present") {
        const inHour = 8;
        const inMin = Math.floor(hash(seedKey + "in") * 60);
        clockIn = new Date(y, m - 1, day, inHour, inMin, 0);
        const outHour = 17 + (hash(seedKey + "out") > 0.5 ? 1 : 0);
        const outMin = Math.floor(hash(seedKey + "out2") * 60);
        clockOut = new Date(y, m - 1, day, outHour, outMin, 0);
      }

      try {
        const existing = await prisma.attendance.findUnique({
          where: {
            employeeId_date: { employeeId: emp.id, date: targetDate },
          },
        });
        await prisma.attendance.upsert({
          where: {
            employeeId_date: { employeeId: emp.id, date: targetDate },
          },
          update: {
            status,
            clockIn,
            clockOut,
          },
          create: {
            employeeId: emp.id,
            date: targetDate,
            status,
            clockIn,
            clockOut,
          },
        });
        if (existing) updated++;
        else created++;
      } catch (err) {
        console.error(`Failed seeding attendance for ${emp.id} on ${y}-${m}-${day}:`, err);
      }
    }
  }

  console.log(`Attendance seeding completed. Created: ${created}, Updated: ${updated}.`);
}
