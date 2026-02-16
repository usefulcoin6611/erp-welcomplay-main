export async function seedBankAccounts(prisma: any) {
  const branch = await prisma.branch.findFirst({ orderBy: { createdAt: "asc" } });
  const branchId = branch?.id ?? null;

  const findCoaId = async (code: string) => {
    const coa = await prisma.chartOfAccount.findUnique({ where: { code } });
    return coa?.id || null;
  };

  const rows = [
    {
      chartCode: "1010",
      holderName: "Operating Account",
      bank: "Bank BCA",
      accountNumber: "1234567890",
      openingBalance: 150000000,
      contactNumber: "+62 812-1111-2222",
      bankAddress: "KCP Sudirman Jakarta",
      paymentGateway: "Cash",
    },
    {
      chartCode: "1011",
      holderName: "Petty Cash",
      bank: "Bank Mandiri",
      accountNumber: "998877665544",
      openingBalance: 12500000,
      contactNumber: "+62 812-3333-4444",
      bankAddress: "KCP Gatot Subroto Jakarta",
      paymentGateway: "Cash",
    },
    {
      chartCode: "1020",
      holderName: "Midtrans VA",
      bank: "Bank Mandiri",
      accountNumber: "VA-8877-1234-9999",
      openingBalance: 28750000,
      contactNumber: "+62 812-8888-0000",
      bankAddress: "VA Mandiri Center",
      paymentGateway: "Midtrans",
    },
    {
      chartCode: "1020",
      holderName: "Xendit VA",
      bank: "Bank BCA",
      accountNumber: "VA-1234-5678-9999",
      openingBalance: 45000000,
      contactNumber: "+62 812-7777-8888",
      bankAddress: "VA BCA Center",
      paymentGateway: "Xendit",
    },
  ];

  for (const row of rows) {
    const chartAccountId = await findCoaId(row.chartCode);
    if (!chartAccountId) continue;

    const existing = await prisma.bankAccount.findFirst({
      where: { accountNumber: row.accountNumber },
    });

    if (existing) {
      await prisma.bankAccount.update({
        where: { id: existing.id },
        data: {
          holderName: row.holderName,
          bank: row.bank,
          openingBalance: row.openingBalance,
          contactNumber: row.contactNumber,
          bankAddress: row.bankAddress,
          paymentGateway: row.paymentGateway,
          chartAccountId,
          branchId,
        },
      });
    } else {
      await prisma.bankAccount.create({
        data: {
          holderName: row.holderName,
          bank: row.bank,
          accountNumber: row.accountNumber,
          openingBalance: row.openingBalance,
          contactNumber: row.contactNumber,
          bankAddress: row.bankAddress,
          paymentGateway: row.paymentGateway,
          chartAccountId,
          branchId,
        },
      });
    }
  }
}
