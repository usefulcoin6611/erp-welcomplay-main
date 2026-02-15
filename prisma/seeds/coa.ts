import { PrismaClient } from "@prisma/client";

export async function seedCOA(prisma: PrismaClient) {
  console.log("Seeding Chart of Accounts...");
  // Get a branch to associate with COA
  const branch = await prisma.branch.findFirst();
  if (!branch) {
    console.warn("No branch found, skipping COA seeding or branch association.");
    return;
  }

  const branchId = branch.id;
  console.log(`Using Branch ID: ${branchId} for COA seeding`);

  // Seed Chart of Accounts (Assets)
  const assetAccounts = [
    { code: "1050", name: "Accounts Receivable", type: "Assets", subType: "Accounts Receivable", branchId },
    { code: "1060", name: "Checking Account", type: "Assets", subType: "Current Asset", branchId },
    { code: "1065", name: "Petty Cash", type: "Assets", subType: "Current Asset", branchId },
    { code: "1205", name: "Allowance for doubtful accounts", type: "Assets", subType: "Current Asset", branchId },
    { code: "1510", name: "Inventory", type: "Assets", subType: "Current Asset", branchId },
    { code: "1520", name: "Stock of Raw Materials", type: "Assets", subType: "Inventory Asset", branchId },
    { code: "1530", name: "Stock of Work In Progress", type: "Assets", subType: "Inventory Asset", branchId },
    { code: "1540", name: "Stock of Finished Goods", type: "Assets", subType: "Inventory Asset", branchId },
    { code: "1550", name: "Goods Received Clearing account", type: "Assets", subType: "Inventory Asset", branchId },
    { code: "1810", name: "Land and Buildings", type: "Assets", subType: "Non-current Asset", branchId },
    { code: "1820", name: "Office Furniture and Equipement", type: "Assets", subType: "Non-current Asset", branchId },
    { code: "1825", name: "Accum.depreciation-Furn. and Equip", type: "Assets", subType: "Non-current Asset", branchId },
    { code: "1840", name: "Motor Vehicle", type: "Assets", subType: "Non-current Asset", branchId },
    { code: "1845", name: "Accum.depreciation-Motor Vehicle", type: "Assets", subType: "Non-current Asset", branchId },
  ];

  for (const account of assetAccounts) {
    await prisma.chartOfAccount.upsert({
      where: { code: account.code },
      update: account,
      create: account,
    });
  }
  console.log("Chart of Accounts (Assets) seeded.");

  // Seed Chart of Accounts (Liabilities & Equity)
  const otherAccounts = [
    // Liabilities
    { code: "2100", name: "Accounts Payable", type: "Liabilities", subType: "Accounts Payable", branchId },
    { code: "2105", name: "Deferred Income", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2110", name: "Accrued Income Tax-Central", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2120", name: "Income Tax Payable", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2130", name: "Accrued Franchise Tax", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2140", name: "Vat Provision", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2145", name: "Purchase Tax", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2150", name: "VAT Pay / Refund", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2151", name: "Zero Rated", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2152", name: "Capital Import", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2153", name: "Standard Import", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2154", name: "Capital Standard", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2155", name: "Vat Exempt", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2160", name: "Accrued Use Tax Payable", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2210", name: "Accrued Wages", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2220", name: "Accrued Comp Time", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2230", name: "Accrued Holiday Pay", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2240", name: "Accrued Vacation Pay", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2310", name: "Accr. Benefits - Central Provident Fund", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2320", name: "Accr. Benefits - Stock Purchase", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2330", name: "Accr. Benefits - Med, Den", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2340", name: "Accr. Benefits - Payroll Taxes", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2350", name: "Accr. Benefits - Credit Union", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2360", name: "Accr. Benefits - Savings Bond", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2370", name: "Accr. Benefits - Group Insurance", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2380", name: "Accr. Benefits - Charity Cont.", type: "Liabilities", subType: "Current Liabilities", branchId },
    { code: "2620", name: "Bank Loans", type: "Liabilities", subType: "Long Term Liabilities", branchId },
    { code: "2680", name: "Loans from Shareholders", type: "Liabilities", subType: "Long Term Liabilities", branchId },
    // Equity
    { code: "3020", name: "Opening Balances and adjustments", type: "Equity", subType: "Owners Equity", branchId },
    { code: "3025", name: "Owners Contribution", type: "Equity", subType: "Owners Equity", branchId },
    { code: "3030", name: "Profit and Loss ( current Year)", type: "Equity", subType: "Owners Equity", branchId },
    { code: "3035", name: "Retained income", type: "Equity", subType: "Owners Equity", branchId },
    // Income
    { code: "4010", name: "Sales Income", type: "Income", subType: "Sales Revenue", branchId },
    { code: "4020", name: "Service Income", type: "Income", subType: "Sales Revenue", branchId },
    { code: "4430", name: "Shipping and Handling", type: "Income", subType: "Other Revenue", branchId },
    { code: "4435", name: "Sundry Income", type: "Income", subType: "Other Revenue", branchId },
    { code: "4440", name: "Interest Received", type: "Income", subType: "Other Revenue", branchId },
    { code: "4450", name: "Foreign Exchange Gain", type: "Income", subType: "Other Revenue", branchId },
    { code: "4500", name: "Unallocated Income", type: "Income", subType: "Other Revenue", branchId },
    { code: "4510", name: "Discounts Received", type: "Income", subType: "Other Revenue", branchId },
    // Costs of Goods Sold
    { code: "5005", name: "Cost of Sales- On Services", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5010", name: "Cost of Sales - Purchases", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5015", name: "Operating Costs", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5020", name: "Material Usage Varaiance", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5025", name: "Breakage and Replacement Costs", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5030", name: "Consumable Materials", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5035", name: "Sub-contractor Costs", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5040", name: "Purchase Price Variance", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5045", name: "Direct Labour - COS", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5050", name: "Purchases of Materials", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5060", name: "Discounts Received", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    { code: "5100", name: "Freight Costs", type: "Costs of Goods Sold", subType: "Costs of Goods Sold", branchId },
    // Expenses
    { code: "5410", name: "Salaries and Wages", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5415", name: "Directors Fees & Remuneration", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5420", name: "Wages - Overtime", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5425", name: "Members Salaries", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5430", name: "UIF Payments", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5440", name: "Payroll Taxes", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5450", name: "Workers Compensation ( Coida )", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5460", name: "Normal Taxation Paid", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5470", name: "General Benefits", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5510", name: "Provisional Tax Paid", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5520", name: "Inc Tax Exp - State", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5530", name: "Taxes - Real Estate", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5540", name: "Taxes - Personal Property", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5550", name: "Taxes - Franchise", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5560", name: "Taxes - Foreign Withholding", type: "Expenses", subType: "Payroll Expenses", branchId },
    { code: "5610", name: "Accounting Fees", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5615", name: "Advertising and Promotions", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5620", name: "Bad Debts", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5625", name: "Courier and Postage", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5660", name: "Depreciation Expense", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5685", name: "Insurance Expense", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5690", name: "Bank Charges", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5695", name: "Interest Paid", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5700", name: "Office Expenses - Consumables", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5705", name: "Printing and Stationary", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5710", name: "Security Expenses", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5715", name: "Subscription - Membership Fees", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5755", name: "Electricity, Gas and Water", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5760", name: "Rent Paid", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5765", name: "Repairs and Maintenance", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5770", name: "Motor Vehicle Expenses", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5771", name: "Petrol and Oil", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5775", name: "Equipment Hire - Rental", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5785", name: "Travel and Accommodation", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5786", name: "Meals and Entertainment", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5787", name: "Staff Training", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5790", name: "Utilities", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5791", name: "Computer Expenses", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5795", name: "Registrations", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5800", name: "Licenses", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "5810", name: "Foreign Exchange Loss", type: "Expenses", subType: "General and Administrative expenses", branchId },
    { code: "9990", name: "Profit and Loss", type: "Expenses", subType: "General and Administrative expenses", branchId },
  ];

  for (const account of otherAccounts) {
    await prisma.chartOfAccount.upsert({
      where: { code: account.code },
      update: account,
      create: account,
    });
  }
  console.log("Chart of Accounts (Liabilities & Equity) seeded.");
}
