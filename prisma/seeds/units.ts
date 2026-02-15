import { PrismaClient } from "@prisma/client";

export async function seedUnits(prisma: PrismaClient) {
  console.log("Seeding Units (Indonesia)...");

  const units = [
    "Piece",
    "Box",
    "Pack",
    "Kg",
    "Litre",
    "Meter",
    "Hour",
    "Day",
  ];

  for (const name of units) {
    const existing = await prisma.unit.findFirst({ where: { name } });
    if (existing) {
      await prisma.unit.update({ where: { id: existing.id }, data: { name } });
      console.log(`Unit updated: ${name}`);
    } else {
      await prisma.unit.create({ data: { name } });
      console.log(`Unit created: ${name}`);
    }
  }

  console.log("Units seeding completed.");
}
