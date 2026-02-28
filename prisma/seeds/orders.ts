import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedOrders() {
  console.log('Seeding orders...')

  // Get company users to link orders to
  const companyUsers = await prisma.user.findMany({
    where: { role: 'company' },
    select: { id: true, name: true },
    take: 5,
  })

  const orders = [
    {
      orderId: 'ORD-001',
      userId: companyUsers[0]?.id ?? null,
      userName: companyUsers[0]?.name ?? 'Acme Corporation',
      planName: 'Gold',
      price: 299000,
      paymentStatus: 'success',
      paymentType: 'STRIPE',
      coupon: 'SUMMER50',
      receipt: 'https://example.com/receipt1.pdf',
      isRefund: 0,
      orderDate: new Date('2024-01-15'),
    },
    {
      orderId: 'ORD-002',
      userId: companyUsers[1]?.id ?? null,
      userName: companyUsers[1]?.name ?? 'Tech Solutions Inc',
      planName: 'Platinum',
      price: 499000,
      paymentStatus: 'Pending',
      paymentType: 'Bank Transfer',
      receipt: '/uploads/order/receipt2.pdf',
      isRefund: 0,
      orderDate: new Date('2024-01-14'),
    },
    {
      orderId: 'ORD-003',
      userId: companyUsers[2]?.id ?? null,
      userName: companyUsers[2]?.name ?? 'Global Enterprises',
      planName: 'Silver',
      price: 149000,
      paymentStatus: 'Approved',
      paymentType: 'Manually',
      isRefund: 0,
      orderDate: new Date('2024-01-13'),
    },
    {
      orderId: 'ORD-004',
      userId: companyUsers[3]?.id ?? null,
      userName: companyUsers[3]?.name ?? 'Startup Company',
      planName: 'Gold',
      price: 0,
      paymentStatus: 'success',
      paymentType: 'Free',
      coupon: 'WELCOME10',
      receipt: 'free coupon',
      isRefund: 0,
      orderDate: new Date('2024-01-12'),
    },
    {
      orderId: 'ORD-005',
      userId: companyUsers[4]?.id ?? null,
      userName: companyUsers[4]?.name ?? 'Digital Agency',
      planName: 'Platinum',
      price: 499000,
      paymentStatus: 'success',
      paymentType: 'STRIPE',
      isRefund: 1,
      orderDate: new Date('2024-01-10'),
    },
  ]

  for (const order of orders) {
    await (prisma as any).order.upsert({
      where: { orderId: order.orderId },
      update: {},
      create: order,
    })
  }

  console.log(`Seeded ${orders.length} orders`)
}
