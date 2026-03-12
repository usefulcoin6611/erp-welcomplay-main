/**
 * Seeds sample leave requests. Requires employees and leave types to exist.
 */
export async function seedLeaveRequests(prisma: any) {
  const hasModel = Boolean((prisma as any).leaveRequest);
  if (!hasModel) {
    console.log("Skipping Leave Requests: leave_request model not available.");
    return;
  }

  console.log("Seeding Leave Requests...");

  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
    take: 5,
  });
  const leaveTypes = await prisma.leaveType.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  if (!employees.length || !leaveTypes.length) {
    console.log("Skipping Leave Requests: require employees and leave types.");
    return;
  }

  const items = [
    {
      employeeIdx: 0,
      leaveTypeName: "Annual Leave",
      startDate: "2024-06-01",
      endDate: "2024-06-05",
      reason: "Family vacation",
      status: "Approved",
    },
    {
      employeeIdx: 1,
      leaveTypeName: "Sick Leave",
      startDate: "2024-07-10",
      endDate: "2024-07-11",
      reason: "Medical appointment",
      status: "Approved",
    },
    {
      employeeIdx: 2,
      leaveTypeName: "Annual Leave",
      startDate: "2024-08-15",
      endDate: "2024-08-20",
      reason: "Personal matters",
      status: "Pending",
    },
  ];

  let createdCount = 0;

  for (const item of items) {
    const employee = employees[item.employeeIdx];
    const leaveType =
      leaveTypes.find((lt: any) => lt.name === item.leaveTypeName) ?? leaveTypes[0];
    if (!employee || !leaveType) continue;

    const existing = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        leaveTypeId: leaveType.id,
        startDate: new Date(`${item.startDate}T00:00:00.000Z`),
      },
    });
    if (existing) continue;

    await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveTypeId: leaveType.id,
        startDate: new Date(`${item.startDate}T00:00:00.000Z`),
        endDate: new Date(`${item.endDate}T00:00:00.000Z`),
        reason: item.reason,
        status: item.status,
      },
    });
    createdCount++;
    console.log(`Leave Request created: ${employee.name} - ${leaveType.name} (${item.status})`);
  }

  console.log(`Leave Requests seeding completed. New records: ${createdCount}`);
}
