/**
 * Seed subscription orders for /orders page.
 * Relates to: User (company role) and Plan names. Requires seedUsers and seedPlans to run first.
 */
export async function seedOrders(prisma: any) {
  console.log("Seeding orders...");

  const companyUsers = await prisma.user.findMany({
    where: { role: "company" },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  const plans = await prisma.plan.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  const planNames = plans.length > 0 ? plans.map((p: { name: string }) => p.name) : ["Free Plan", "Silver", "Gold", "Platinum"];

  if (companyUsers.length === 0) {
    console.log("No company users found; skipping order seed. Run seedUsers first.");
    return;
  }

  const paymentStatuses = ["success", "Pending", "Approved", "success", "failed"] as const;
  const paymentTypes = ["STRIPE", "Bank Transfer", "Manually", "STRIPE", "Bank Transfer"] as const;

  const ordersData = [
    { orderId: "ORD-001", planName: "Gold", price: 750000, paymentStatus: "success" as const, paymentType: "STRIPE", coupon: "SUMMER20", receipt: "/uploads/order/receipt-001.pdf", isRefund: 0, daysAgo: 2 },
    { orderId: "ORD-002", planName: "Platinum", price: 1500000, paymentStatus: "Pending" as const, paymentType: "Bank Transfer", coupon: null, receipt: null, isRefund: 0, daysAgo: 5 },
    { orderId: "ORD-003", planName: "Silver", price: 250000, paymentStatus: "Approved" as const, paymentType: "Manually", coupon: null, receipt: "/uploads/order/receipt-003.pdf", isRefund: 0, daysAgo: 7 },
    { orderId: "ORD-004", planName: "Free Plan", price: 0, paymentStatus: "success" as const, paymentType: "Free", coupon: "WELCOME10", receipt: "Free plan activation", isRefund: 0, daysAgo: 10 },
    { orderId: "ORD-005", planName: "Platinum", price: 1500000, paymentStatus: "success" as const, paymentType: "STRIPE", coupon: null, receipt: "/uploads/order/receipt-005.pdf", isRefund: 1, daysAgo: 14 },
    { orderId: "ORD-006", planName: "Gold", price: 750000, paymentStatus: "success" as const, paymentType: "STRIPE", coupon: "ANNUAL15", receipt: "/uploads/order/receipt-006.pdf", isRefund: 0, daysAgo: 1 },
    { orderId: "ORD-007", planName: "Silver", price: 250000, paymentStatus: "failed" as const, paymentType: "Bank Transfer", coupon: null, receipt: null, isRefund: 0, daysAgo: 3 },
    { orderId: "ORD-008", planName: "Gold", price: 750000, paymentStatus: "Approved" as const, paymentType: "Manually", coupon: "PARTNER20", receipt: null, isRefund: 0, daysAgo: 8 },
  ];

  for (let i = 0; i < ordersData.length; i++) {
    const row = ordersData[i];
    const planName = planNames.includes(row.planName) ? row.planName : planNames[0] ?? "Free Plan";
    const user = companyUsers[i % companyUsers.length];
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - row.daysAgo);
    orderDate.setHours(12, 0, 0, 0);

    await prisma.order.upsert({
      where: { orderId: row.orderId },
      update: {
        userName: user.name ?? "Company",
        planName,
        price: row.price,
        paymentStatus: row.paymentStatus,
        paymentType: row.paymentType,
        coupon: row.coupon,
        receipt: row.receipt,
        isRefund: row.isRefund,
        orderDate,
      },
      create: {
        orderId: row.orderId,
        userId: user.id,
        userName: user.name ?? "Company",
        planName,
        price: row.price,
        paymentStatus: row.paymentStatus,
        paymentType: row.paymentType,
        coupon: row.coupon,
        receipt: row.receipt,
        isRefund: row.isRefund,
        orderDate,
      },
    });
  }

  console.log(`Seeded ${ordersData.length} orders.`);
}
