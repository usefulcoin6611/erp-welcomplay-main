import { PrismaClient } from "@prisma/client";

export async function seedCustomFields(prisma: PrismaClient) {
  console.log("Seeding Custom Fields (Indonesia)...");

  const fields = [
    { name: "Nomor Faktur Pajak", type: "Text", module: "Invoice" },
    { name: "Nomor PO", type: "Text", module: "Invoice" },
    { name: "NPWP", type: "Text", module: "Customer" },
    { name: "NIB/NIK", type: "Text", module: "Vendor" },
    { name: "Satuan Kemasan", type: "Text", module: "Product" },
  ];

  for (const f of fields) {
    const existing = await prisma.customField.findFirst({ where: { name: f.name } });
    if (existing) {
      await prisma.customField.update({ where: { id: existing.id }, data: f });
      console.log(`Custom field updated: ${f.name}`);
    } else {
      await prisma.customField.create({ data: f });
      console.log(`Custom field created: ${f.name}`);
    }
  }

  console.log("Custom Fields seeding completed.");
}
