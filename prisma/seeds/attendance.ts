import { PrismaClient } from "@prisma/client";

export async function seedAttendance(prisma: any) {
  console.log("Seeding Attendance...");

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  if (!employees || employees.length === 0) {
    console.log("No active employees found, skipping attendance seed.");
    return;
  }

  // Seed attendance for the last 14 days (excluding weekends optionally)
  const daysToSeed = 14;
  const today = new Date();
  for (let d = 1; d <= daysToSeed; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    // Normalize date to UTC midnight (so composite key matches route behavior)
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    const dateString = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
    const targetDate = new Date(`${dateString}T00:00:00.000Z`);

    for (const emp of employees) {
      // Randomize a little for demo: most present, a few absent
      const rand = Math.random();
      const status = rand > 0.07 ? "Present" : rand > 0.03 ? "Late" : "Absent";

      let clockIn = null;
      let clockOut = null;
      if (status !== "Absent") {
        // clock in between 08:00 - 09:00 (random)
        const inHour = 8;
        const inMinutes = Math.floor(Math.random() * 60);
        clockIn = new Date(targetDate);
        clockIn.setUTCHours(inHour, inMinutes, 0, 0);

        // clock out between 17:00 - 18:30
        const outHour = 17 + Math.floor(Math.random() * 2); // 17 or 18
        const outMinutes = Math.floor(Math.random() * 60);
        clockOut = new Date(targetDate);
        clockOut.setUTCHours(outHour, outMinutes, 0, 0);
      }

      try {
        await prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: emp.id,
              date: targetDate,
            },
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
      } catch (err) {
        console.error(`Failed seeding attendance for ${emp.id} on ${dateString}:`, err);
      }
    }
  }

  console.log("Attendance seeding completed.");
}

