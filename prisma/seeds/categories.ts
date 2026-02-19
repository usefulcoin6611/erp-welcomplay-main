export async function seedCategories(prisma: any) {
  console.log("Seeding Categories (Indonesia)...");

  const defaultBranch = await prisma.branch.findFirst({
    orderBy: { createdAt: "asc" },
  });
  const branchId = defaultBranch?.id ?? null;

  const categories = [
    // Product & Service (no account required)
    { name: "Maintenance Sales", type: "Product & Service", account: null, color: "3B82F6", branchId },
    { name: "Product Sales", type: "Product & Service", account: null, color: "F97316", branchId },

    // Income (needs account)
    { name: "Service Income", type: "Income", account: "Sales Revenue", color: "16A34A", branchId },
    { name: "Other Income", type: "Income", account: "Sales Revenue", color: "22C55E", branchId },

    // Expense (needs account)
    { name: "Operating Expense", type: "Expense", account: "Operating Expenses", color: "F97316", branchId },
    { name: "Transport", type: "Expense", account: "Operating Expenses", color: "0EA5E9", branchId },
    { name: "Meals & Entertainment", type: "Expense", account: "Operating Expenses", color: "EC4899", branchId },
    { name: "Office Supplies", type: "Expense", account: "Operating Expenses", color: "F59E0B", branchId },
    { name: "Cost of Goods Sold", type: "Expense", account: "Cost of Goods Sold", color: "4B5563", branchId },

    // Additional expense categories commonly used by Bills
    { name: "Logistics", type: "Expense", account: "Operating Expenses", color: "0EA5E9", branchId },
    { name: "IT Services", type: "Expense", account: "Operating Expenses", color: "2563EB", branchId },
    { name: "Utility", type: "Expense", account: "Operating Expenses", color: "22C55E", branchId },
  ];

  for (const category of categories) {
    const existing = await prisma.category.findFirst({ where: { name: category.name } });
    if (existing) {
      await prisma.category.update({ where: { id: existing.id }, data: category });
      console.log(`Category updated: ${category.name}`);
    } else {
      await prisma.category.create({ data: category });
      console.log(`Category created: ${category.name}`);
    }
  }

  await prisma.category.deleteMany({
    where: { name: { in: ["Expense Services"] } },
  });

  console.log("Categories seeding completed.");
}
