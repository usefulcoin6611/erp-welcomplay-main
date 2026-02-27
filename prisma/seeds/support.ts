/**
 * Seed data for Support (Sistem Dukungan) page.
 * Creates support tickets and replies. Requires users to exist (run after seedUsers).
 */

const STATUSES = ["Open", "On Hold", "Close"] as const;
const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

const TICKET_SUBJECTS = [
  "Cannot login to system",
  "Request feature enhancement",
  "Bug report in dashboard",
  "Password reset not working",
  "Invoice generation error",
  "Report export failing",
  "User permission issue",
  "Email notification not sent",
  "Data synchronization problem",
  "Mobile app crash on iOS",
  "Slow page loading",
  "Payment gateway integration issue",
];

const DESCRIPTIONS = [
  "I am unable to access the system with my credentials. Please assist.",
  "Would like to request additional filters on the reports module.",
  "Dashboard charts sometimes show wrong totals after refresh.",
  "Password reset link in email expires too quickly.",
  "Error occurs when generating PDF invoice for orders with discount.",
  "Export to Excel fails when selection is over 1000 rows.",
  "New user cannot see the HR menu after assignment.",
  "Notification emails are not received by some users.",
  "Data from branch A does not sync to central after 24 hours.",
  "App crashes when opening the timesheet screen on iOS 17.",
  "Product list page takes more than 10 seconds to load.",
  "Payment callback from gateway is not updating order status.",
];

export async function seedSupport(prisma: any) {
  console.log("Seeding Support tickets...");

  const users = await prisma.user.findMany({
    select: { id: true },
    take: 10,
  });

  if (!users || users.length === 0) {
    console.log("No users found, skipping support seed.");
    return;
  }

  const createdIds: string[] = [];
  for (let i = 0; i < TICKET_SUBJECTS.length; i++) {
    const createdBy = users[i % users.length];
    const assignUser = users[(i + 1) % users.length];
    const status = STATUSES[i % STATUSES.length];
    const priority = PRIORITIES[i % PRIORITIES.length];
    const ticketCode = `TKT-${String(i + 1).padStart(3, "0")}`;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7 + (i % 14));

    try {
      const ticket = await prisma.supportTicket.upsert({
        where: { ticketCode },
        update: {
          subject: TICKET_SUBJECTS[i],
          description: DESCRIPTIONS[i] ?? null,
          status,
          priority,
          endDate,
          assignUserId: assignUser.id,
        },
        create: {
          ticketCode,
          subject: TICKET_SUBJECTS[i],
          description: DESCRIPTIONS[i] ?? null,
          status,
          priority,
          endDate,
          createdById: createdBy.id,
          assignUserId: assignUser.id,
        },
      });
      createdIds.push(ticket.id);
    } catch (err) {
      console.error(`Failed to seed support ticket ${ticketCode}:`, err);
    }
  }

  // Add one reply to the first 3 tickets (only if they have no replies yet)
  for (let t = 0; t < Math.min(3, createdIds.length); t++) {
    const ticketId = createdIds[t];
    const count = await prisma.supportReply.count({ where: { supportTicketId: ticketId } });
    if (count > 0) continue;
    const replier = users[(t + 2) % users.length];
    await prisma.supportReply.create({
      data: {
        supportTicketId: ticketId,
        userId: replier.id,
        message: "We have received your ticket and will look into it shortly. Please provide any additional details if available.",
      },
    });
  }

  console.log("Support seeding completed.");
}
