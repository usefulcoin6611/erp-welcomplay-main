export async function seedBankAccounts(prisma: any) {
  const branch = await prisma.branch.findFirst({ orderBy: { createdAt: "asc" } });
  const branchId = branch?.id ?? null;

  const findCoaId = async (code: string) => {
    const coa = await prisma.chartOfAccount.findUnique({ where: { code } });
    return coa?.id || null;
  };

  const rows = [
    {
      chartCode: "1120", // Payroll Bank BCA (salary)
      holderName: "Payroll Account BCA",
      bank: "Bank BCA",
      accountNumber: "1234567890",
      openingBalance: 150000000,
      contactNumber: "+62 812-1111-2222",
      bankAddress: "KCP Sudirman Jakarta",
      paymentGateway: "Cash",
    },
    {
      chartCode: "1121", // Payroll Bank Mandiri (salary)
      holderName: "Payroll Account Mandiri",
      bank: "Bank Mandiri",
      accountNumber: "223344556677",
      openingBalance: 95000000,
      contactNumber: "+62 812-9999-0000",
      bankAddress: "KCP Thamrin Jakarta",
      paymentGateway: "Cash",
    },
    {
      chartCode: "1065", // Petty Cash Specific
      holderName: "Petty Cash",
      bank: "Bank Mandiri",
      accountNumber: "998877665544",
      openingBalance: 12500000,
      contactNumber: "+62 812-3333-4444",
      bankAddress: "KCP Gatot Subroto Jakarta",
      paymentGateway: "Cash",
    },
    {
      chartCode: "1123", // Midtrans VA Specific
      holderName: "Midtrans VA",
      bank: "Bank Mandiri",
      accountNumber: "VA-8877-1234-9999",
      openingBalance: 28750000,
      contactNumber: "+62 812-8888-0000",
      bankAddress: "VA Mandiri Center",
      paymentGateway: "Midtrans",
    },
    {
      chartCode: "1124", // Xendit VA Specific
      holderName: "Xendit VA",
      bank: "Bank BCA",
      accountNumber: "VA-1234-5678-9999",
      openingBalance: 45000000,
      contactNumber: "+62 812-7777-8888",
      bankAddress: "VA BCA Center",
      paymentGateway: "Xendit",
    },
    {
      chartCode: "1122", // Jago VA Specific
      holderName: "Jago VA",
      bank: "Bank Jago",
      accountNumber: "VA-5566-7788-9999",
      openingBalance: 10000000,
      contactNumber: "+62 812-5555-6666",
      bankAddress: "VA Jago Center",
      paymentGateway: "Jago",
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
