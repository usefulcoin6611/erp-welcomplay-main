export async function seedCustomers(prisma: any) {
  console.log("Seeding customers...");

  const user = await prisma.user.findFirst({
    where: { 
      role: {
        in: ["super admin", "company"]
      },
      branchId: {
        not: null
      }
    },
  });

  if (!user) {
    console.log("Skipping customer seed: Super Admin or Company user with branchId not found.");
    return;
  }

  // Use the branch assigned to the user if available, otherwise find any branch
  const branchId = user.branchId || (await prisma.branch.findFirst())?.id;

  if (!branchId) {
    console.log("Skipping customer seed: Branch not found.");
    return;
  }

  const customers = [
    {
      customerCode: "CUST-001",
      name: "PT. Maju Bersama",
      email: "info@majubersama.com",
      contact: "08123456789",
      taxNumber: "12.345.678.9-012.000",
      balance: 5000000,
      billingName: "PT. Maju Bersama",
      billingPhone: "021-5551234",
      billingAddress: "Jl. Sudirman No. 123",
      billingCity: "Jakarta Selatan",
      billingState: "DKI Jakarta",
      billingCountry: "Indonesia",
      billingZip: "12190",
      shippingName: "PT. Maju Bersama",
      shippingPhone: "021-5551234",
      shippingAddress: "Jl. Gatot Subroto No. 45",
      shippingCity: "Jakarta Selatan",
      shippingState: "DKI Jakarta",
      shippingCountry: "Indonesia",
      shippingZip: "12160",
      branchId: branchId,
      createdById: user.id,
    },
    {
      customerCode: "CUST-002",
      name: "Bapak Budi Santoso",
      email: "budi.santoso@gmail.com",
      contact: "08771234567",
      balance: 1500000,
      billingName: "Budi Santoso",
      billingPhone: "08771234567",
      billingAddress: "Perum Harapan Indah Blok B/10",
      billingCity: "Bekasi",
      billingState: "Jawa Barat",
      billingCountry: "Indonesia",
      billingZip: "17131",
      shippingName: "Budi Santoso",
      shippingPhone: "08771234567",
      shippingAddress: "Perum Harapan Indah Blok B/10",
      shippingCity: "Bekasi",
      shippingState: "Jawa Barat",
      shippingCountry: "Indonesia",
      shippingZip: "17131",
      branchId: branchId,
      createdById: user.id,
    },
    {
      customerCode: "CUST-003",
      name: "Toko Sinar Jaya",
      email: "sinarjaya.toko@yahoo.com",
      contact: "021-8884321",
      taxNumber: "98.765.432.1-098.000",
      balance: 0,
      billingName: "Toko Sinar Jaya",
      billingPhone: "021-8884321",
      billingAddress: "Pasar Baru No. 45",
      billingCity: "Jakarta Pusat",
      billingState: "DKI Jakarta",
      billingCountry: "Indonesia",
      billingZip: "10710",
      shippingName: "Gudang Sinar Jaya",
      shippingPhone: "021-8884321",
      shippingAddress: "Gudang Utama Blok A No. 2",
      shippingCity: "Jakarta Utara",
      shippingState: "DKI Jakarta",
      shippingCountry: "Indonesia",
      shippingZip: "14350",
      branchId: branchId,
      createdById: user.id,
    },
  ];

  for (const customerData of customers) {
    await prisma.customer.upsert({
      where: { customerCode: customerData.customerCode },
      update: {},
      create: customerData,
    });
  }

  console.log(`Seeded ${customers.length} customers.`);
}
