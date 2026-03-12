/**
 * Seed coupons for /coupons page.
 * Codes align with order seed (SUMMER20, WELCOME10, ANNUAL15, PARTNER20) and add more for demo.
 */
export async function seedCoupons(prisma: any) {
  console.log("Seeding coupons...")

  const coupons = [
    { name: "Summer Sale", code: "SUMMER20", discount: 20, limit: 100, used: 12, isActive: true },
    { name: "Welcome Discount", code: "WELCOME10", discount: 10, limit: 0, used: 45, isActive: true },
    { name: "Annual Plan", code: "ANNUAL15", discount: 15, limit: 50, used: 8, isActive: true },
    { name: "Partner Program", code: "PARTNER20", discount: 20, limit: 30, used: 5, isActive: true },
    { name: "New Year Special", code: "NEWYEAR25", discount: 25, limit: 200, used: 0, isActive: true },
    { name: "Silver Upgrade", code: "SILVER10", discount: 10, limit: 20, used: 3, isActive: true },
    { name: "Gold Launch", code: "GOLD50", discount: 50, limit: 10, used: 10, isActive: false },
    { name: "Trial Extension", code: "TRIAL7", discount: 100, limit: 5, used: 2, isActive: true },
  ]

  let created = 0
  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        discount: c.discount,
        limit: c.limit,
        used: c.used,
        isActive: c.isActive,
      },
      create: {
        name: c.name,
        code: c.code,
        discount: c.discount,
        limit: c.limit,
        used: c.used,
        isActive: c.isActive,
      },
    })
    created++
  }

  console.log(`Coupons seeding completed. Upserted ${created} coupons.`)
}
