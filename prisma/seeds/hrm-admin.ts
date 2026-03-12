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
        {
          name: "New Year Day",
          date: new Date("2024-01-01"),
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-01"),
          description: "New Year celebration",
        },
        {
          name: "Independence Day",
          date: new Date("2024-08-17"),
          startDate: new Date("2024-08-17"),
          endDate: new Date("2024-08-17"),
          description: "National holiday",
        },
        {
          name: "Christmas",
          date: new Date("2024-12-25"),
          startDate: new Date("2024-12-25"),
          endDate: new Date("2024-12-25"),
          description: "Christmas celebration",
        },
      ],
    });
    console.log("HR Admin: Created sample holidays.");
  }

  const existingEvent = await prisma.hrmEvent.findFirst();
  if (!existingEvent && employees.length >= 3) {
    await prisma.hrmEvent.createMany({
      data: [
        {
          title: "Company Annual Meeting",
          branch: employees[0].branch ?? "Head Office",
          department: employees[0].department ?? "Management",
          employeeId: employees[0].id,
          startDate: new Date("2024-03-20"),
          endDate: new Date("2024-03-20"),
          color: "blue",
          description: "Annual company meeting to discuss yearly goals",
        },
        {
          title: "Team Building Event",
          branch: employees[1].branch ?? "Head Office",
          department: employees[1].department ?? "HR",
          employeeId: employees[1].id,
          startDate: new Date("2024-03-25"),
          endDate: new Date("2024-03-26"),
          color: "green",
          description: "Two-day team building activities",
        },
        {
          title: "Product Launch",
          branch: employees[2].branch ?? "Branch Office",
          department: employees[2].department ?? "Marketing",
          employeeId: employees[2].id,
          startDate: new Date("2024-04-01"),
          endDate: new Date("2024-04-01"),
          color: "purple",
          description: "Launch event for new product line",
        },
      ],
    });
    console.log("HR Admin: Created sample HR events.");
  }

  try {
    const existingMeeting = await prisma.hrmMeeting.findFirst();
    if (!existingMeeting && employees.length >= 2) {
      const branches = await prisma.branch.findMany({ take: 2, orderBy: { name: "asc" } });
      const branchName = branches[0]?.name ?? employees[0].branch ?? "Head Office";
      const deptName = employees[0].department ?? "IT";
      await prisma.hrmMeeting.createMany({
        data: [
          {
            title: "Weekly Team Standup",
            branch: branchName,
            department: deptName,
            employeeId: employees[0].id,
            meetingDate: new Date("2024-03-20"),
            meetingTime: "09:00",
            note: "Daily sync and blockers",
            status: "Scheduled",
          },
          {
            title: "Client Presentation",
            branch: branchName,
            department: employees[1]?.department ?? "Sales",
            employeeId: employees[1].id,
            meetingDate: new Date("2024-03-21"),
            meetingTime: "14:00",
            note: "",
            status: "Scheduled",
          },
          {
            title: "Project Review",
            branch: branches[1]?.name ?? employees[1]?.branch ?? "Branch Office",
            department: deptName,
            employeeId: employees[0].id,
            meetingDate: new Date("2024-03-18"),
            meetingTime: "10:00",
            note: "Q1 deliverables",
            status: "Completed",
          },
        ],
      });
      console.log("HR Admin: Created sample meetings.");
    }
  } catch (err: any) {
    if (err?.code === "P2021" || err?.message?.includes("does not exist")) {
      console.log("HR Admin: Skipping meetings (hrm_meeting table not found). Run migration 20260229100000_add_hrm_meetings if needed.");
    } else {
      throw err;
    }
  }

  console.log("HR Admin seeding completed.");
}
