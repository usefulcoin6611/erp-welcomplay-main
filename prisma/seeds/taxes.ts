import { PrismaClient } from "@prisma/client";

export async function seedTaxes(prisma: PrismaClient) {
  console.log("Seeding Taxes (Indonesia)...");

  const taxes = [
    { name: "PPN 11%", rate: 11 },
    { name: "PPN 0% (Zero Rated)", rate: 0 },
    { name: "PPh 21 5%", rate: 5 },
    { name: "PPh 23 2%", rate: 2 },
  ];

  for (const tax of taxes) {
    const existing = await prisma.tax.findFirst({ where: { name: tax.name } });
    if (existing) {
      await prisma.tax.update({ where: { id: existing.id }, data: tax });
      console.log(`Tax updated: ${tax.name}`);
    } else {
      await prisma.tax.create({ data: tax });
      console.log(`Tax created: ${tax.name}`);
    }
  }

  console.log("Taxes seeding completed.");
}
