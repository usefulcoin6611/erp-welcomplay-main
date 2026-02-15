import { PrismaClient } from "@prisma/client";

export async function seedCreditNotes(prisma: PrismaClient) {
  console.log("Seeding Credit Notes...");

  const inv1 = await prisma.invoice.findUnique({ where: { invoiceId: "INV-2026-001" } });
  const inv2 = await prisma.invoice.findUnique({ where: { invoiceId: "INV-2026-002" } });
  const inv3 = await prisma.invoice.findUnique({ where: { invoiceId: "INV-2026-003" } });
  const inv4 = await prisma.invoice.findUnique({ where: { invoiceId: "INV-2026-004" } });

  if (!inv1 || !inv2 || !inv3 || !inv4) {
    console.log("Skipping credit note seed: required invoices not found.");
    return;
  }

  type SeedRow = {
    number: number;
    invoiceId: string;
    date: Date;
    amount: number;
    description: string;
    status: number;
  };

  const rows: SeedRow[] = [
    {
      number: 1,
      invoiceId: inv1.invoiceId,
      date: new Date("2026-02-14"),
      amount: 2500000,
      description: "Service refund - partial completion",
      status: 0,
    },
    {
      number: 2,
      invoiceId: inv2.invoiceId,
      date: new Date("2026-02-12"),
      amount: 1200000,
      description: "Product return - quality issues",
      status: 1,
    },
    {
      number: 3,
      invoiceId: inv3.invoiceId,
      date: new Date("2026-02-10"),
      amount: 500000,
      description: "Overpayment refund",
      status: 0,
    },
    {
      number: 4,
      invoiceId: inv4.invoiceId,
      date: new Date("2026-02-08"),
      amount: 3000000,
      description: "Cancelled order",
      status: 2,
    },
    {
      number: 5,
      invoiceId: inv1.invoiceId,
      date: new Date("2026-02-18"),
      amount: 1500000,
      description: "Additional discount after negotiation",
      status: 1,
    },
    {
      number: 6,
      invoiceId: inv2.invoiceId,
      date: new Date("2026-02-20"),
      amount: 750000,
      description: "Service credit for downtime",
      status: 0,
    },
    {
      number: 7,
      invoiceId: inv3.invoiceId,
      date: new Date("2026-02-22"),
      amount: 1000000,
      description: "Return of defective hardware",
      status: 2,
    },
    {
      number: 8,
      invoiceId: inv4.invoiceId,
      date: new Date("2026-02-24"),
      amount: 900000,
      description: "Scope reduction adjustment",
      status: 1,
    },
  ];

  for (const row of rows) {
    const exists = await (prisma as any).creditNote.findFirst({
      where: {
        number: row.number,
        invoiceId: row.invoiceId,
      },
    });

    if (exists) {
      console.log(`Credit note exists: #CN${row.number.toString().padStart(5, "0")} for ${row.invoiceId}`);
      continue;
    }

    await (prisma as any).creditNote.create({
      data: {
        number: row.number,
        invoiceId: row.invoiceId,
        date: row.date,
        amount: row.amount,
        description: row.description,
        status: row.status,
      },
    });

    console.log(`Credit note seeded: #CN${row.number.toString().padStart(5, "0")} for ${row.invoiceId}`);
  }

  console.log("Credit Notes seeding completed.");
}

