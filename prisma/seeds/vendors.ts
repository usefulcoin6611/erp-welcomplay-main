export async function seedVendors(prisma: any) {
  console.log("Seeding vendors...");

  const user = await prisma.user.findFirst({
    where: {
      role: {
        in: ["super admin", "company"],
      },
      branchId: {
        not: null,
      },
    },
  });

  if (!user) {
    console.log("Skipping vendor seed: Super Admin or Company user with branchId not found.");
    return;
  }

  const branchId = user.branchId || (await prisma.branch.findFirst())?.id;

  if (!branchId) {
    console.log("Skipping vendor seed: Branch not found.");
    return;
  }

  const vendors = [
    {
      vendorCode: "VDR-001",
      name: "PT Supply Berkah",
      email: "vendor@supplyberkah.id",
      contact: "+62 21 5555 8888",
      taxNumber: "01.234.567.8-999.000",
      balance: 150000000,
      billingName: "PT Supply Berkah",
      billingPhone: "+62 21 5555 8888",
      billingAddress: "Jl. Industri No. 10",
      billingCity: "Jakarta",
      billingState: "DKI Jakarta",
      billingCountry: "Indonesia",
      billingZip: "13110",
      shippingName: "Gudang Supply Berkah",
      shippingPhone: "+62 21 5555 8888",
      shippingAddress: "Kawasan Pergudangan Berkah Blok A1",
      shippingCity: "Bekasi",
      shippingState: "Jawa Barat",
      shippingCountry: "Indonesia",
      shippingZip: "17145",
      branchId,
      createdById: user.id,
    },
    {
      vendorCode: "VDR-002",
      name: "CV Logistik Nusantara",
      email: "info@logistiknusantara.co.id",
      contact: "+62 31 7777 8888",
      taxNumber: "02.111.222.3-444.000",
      balance: 85000000,
      billingName: "CV Logistik Nusantara",
      billingPhone: "+62 31 7777 8888",
      billingAddress: "Jl. Tanjung Perak No. 7",
      billingCity: "Surabaya",
      billingState: "Jawa Timur",
      billingCountry: "Indonesia",
      billingZip: "60165",
      shippingName: "Gudang Logistik Nusantara",
      shippingPhone: "+62 31 7777 8888",
      shippingAddress: "Kawasan Industri Pelabuhan Blok B2",
      shippingCity: "Surabaya",
      shippingState: "Jawa Timur",
      shippingCountry: "Indonesia",
      shippingZip: "60166",
      branchId,
      createdById: user.id,
    },
  ];

  for (const vendorData of vendors) {
    await prisma.vendor.upsert({
      where: { vendorCode: vendorData.vendorCode },
      update: {},
      create: vendorData,
    });
  }

  console.log(`Seeded ${vendors.length} vendors.`);
}

