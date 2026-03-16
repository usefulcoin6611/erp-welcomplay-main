import { prisma } from '../src/lib/prisma';

async function main() {
  const plans = await (prisma as any).plan.findMany();
  console.log('Plans in DB:', plans);
  
  const user = await prisma.user.findFirst({
    where: { role: 'company' }
  });
  console.log('Sample User:', {
    id: user?.id,
    plan: user?.plan,
    planExpireDate: user?.planExpireDate
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
