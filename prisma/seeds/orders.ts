/**
 * Seed subscription orders for company subscription history.
 * All orders are assigned to company@example.com for testing /settings?tab=order (Subscription History).
 * Requires seedUsers and seedPlans to run first.
 */
export async function seedOrders(prisma: any) {
  console.log("Seeding subscription orders...");

  const companyUser = await prisma.user.findFirst({
    where: { role: "company", email: "company@example.com" },
    select: { id: true, name: true },
  });

  if (!companyUser) {
    console.log("Company user (company@example.com) not found; skipping order seed. Run seedUsers first.");
    return;
  }

  const plans = await prisma.plan.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  const planNames = plans.length > 0 ? plans.map((p: { name: string }) => p.name) : ["Free Plan", "Silver", "Gold", "Platinum"];

  const ordersData = [
    { orderId: "ORD-001", planName: "Gold", price: 750000, paymentStatus: "success" as const, paymentType: "STRIPE", coupon: "SUMMER20", receipt: "/uploads/order/receipt-001.pdf", isRefund: 0, daysAgo: 1 },
    { orderId: "ORD-002", planName: "Gold", price: 750000, paymentStatus: "success" as const, paymentType: "STRIPE", coupon: "ANNUAL15", receipt: "/uploads/order/receipt-002.pdf", isRefund: 0, daysAgo: 32 },
    { orderId: "ORD-003", planName: "Silver", price: 250000, paymentStatus: "Approved" as const, paymentType: "Manually", coupon: null, receipt: "/uploads/order/receipt-003.pdf", isRefund: 0, daysAgo: 65 },
    { orderId: "ORD-004", planName: "Free Plan", price: 0, paymentStatus: "success" as const, paymentType: "Free", coupon: "WELCOME10", receipt: "Free plan activation", isRefund: 0, daysAgo: 95 },
    { orderId: "ORD-005", planName: "Silver", price: 250000, paymentStatus: "success" as const, paymentType: "Bank Transfer", coupon: null, receipt: "/uploads/order/receipt-005.pdf", isRefund: 0, daysAgo: 125 },
    { orderId: "ORD-006", planName: "Gold", price: 750000, paymentStatus: "Pending" as const, paymentType: "Bank Transfer", coupon: null, receipt: null, isRefund: 0, daysAgo: 2 },
    { orderId: "ORD-007", planName: "Silver", price: 250000, paymentStatus: "failed" as const, paymentType: "Bank Transfer", coupon: null, receipt: null, isRefund: 0, daysAgo: 45 },
    { orderId: "ORD-008", planName: "Gold", price: 750000, paymentStatus: "Approved" as const, paymentType: "Manually", coupon: "PARTNER20", receipt: null, isRefund: 0, daysAgo: 18 },
  ];

  for (const row of ordersData) {
    const planName = planNames.includes(row.planName) ? row.planName : planNames[0] ?? "Free Plan";
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - row.daysAgo);
    orderDate.setHours(12, 0, 0, 0);

    await prisma.order.upsert({
      where: { orderId: row.orderId },
      update: {
        userId: companyUser.id,
        userName: companyUser.name ?? "Company",
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
        userId: companyUser.id,
        userName: companyUser.name ?? "Company",
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

  console.log(`Seeded ${ordersData.length} subscription orders for company@example.com.`);
}
