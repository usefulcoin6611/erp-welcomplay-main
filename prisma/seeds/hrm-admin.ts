/**
 * Seeds sample data for HR Admin module (awards, transfers, resignations, etc.)
 */
export async function seedHrmAdmin(prisma: any) {
  console.log("Seeding HR Admin data...");

  const empCount = await prisma.employee.count();
  if (empCount === 0) {
    console.log("HR Admin: No employees found. Skipping.");
    return;
  }

  const employees = await prisma.employee.findMany({
    take: 5,
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, branch: true, department: true },
  });

  const awardType = await prisma.awardType.findFirst();
  const terminationType = await prisma.terminationType.findFirst();

  if (awardType && employees[0]) {
    const existingAward = await prisma.hrmAward.findFirst();
    if (!existingAward) {
      await prisma.hrmAward.create({
        data: {
          employeeId: employees[0].id,
          awardTypeId: awardType.id,
          date: new Date("2024-02-01"),
          gift: "Certificate + Bonus",
          description: "Outstanding performance",
        },
      });
      console.log("HR Admin: Created sample award.");
    }
  }

  if (employees.length >= 2) {
    const existingTransfer = await prisma.hrmTransfer.findFirst();
    if (!existingTransfer) {
      await prisma.hrmTransfer.create({
        data: {
          employeeId: employees[0].id,
          branch: employees[1]?.branch ?? "Head Office",
          department: employees[1]?.department ?? "IT",
          transferDate: new Date("2024-02-15"),
          description: "Transfer to new department",
        },
      });
      console.log("HR Admin: Created sample transfer.");
    }
  }

  const existingHoliday = await prisma.hrmHoliday.findFirst();
  if (!existingHoliday) {
    await prisma.hrmHoliday.createMany({
      data: [
        { name: "New Year Day", date: new Date("2024-01-01"), description: "New Year celebration" },
        { name: "Independence Day", date: new Date("2024-08-17"), description: "National holiday" },
        { name: "Christmas", date: new Date("2024-12-25"), description: "Christmas celebration" },
      ],
    });
    console.log("HR Admin: Created sample holidays.");
  }

  console.log("HR Admin seeding completed.");
}
