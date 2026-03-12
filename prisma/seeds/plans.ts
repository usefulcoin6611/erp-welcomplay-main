export async function seedPlans(prisma: any) {
  console.log("Seeding plans...")

  const planDelegate = prisma?.plan
  if (!planDelegate) {
    console.warn(
      "Prisma client has no 'plan' model. Run: pnpm prisma generate (or npx prisma generate) then re-run the seed."
    )
    return
  }

  const plans = [
    {
      name: "Free Plan",
      price: 0,
      duration: "lifetime",
      maxUsers: 5,
      maxCustomers: 5,
      maxVenders: 5,
      maxClients: 5,
      storageLimit: 1024,
      trialDays: 0,
      isDisable: false,
      hasAccount: true,
      hasCrm: false,
      hasHrm: false,
      hasProject: false,
      hasPos: false,
      hasChatgpt: false,
    },
    {
      name: "Silver",
      price: 250000,
      duration: "month",
      maxUsers: 20,
      maxCustomers: 100,
      maxVenders: 50,
      maxClients: 25,
      storageLimit: 5000,
      trialDays: 0,
      isDisable: false,
      hasAccount: true,
      hasCrm: true,
      hasHrm: true,
      hasProject: false,
      hasPos: false,
      hasChatgpt: false,
    },
    {
      name: "Gold",
      price: 750000,
      duration: "month",
      maxUsers: 50,
      maxCustomers: 500,
      maxVenders: 100,
      maxClients: 50,
      storageLimit: 10000,
      trialDays: 0,
      isDisable: false,
      hasAccount: true,
      hasCrm: true,
      hasHrm: true,
      hasProject: true,
      hasPos: true,
      hasChatgpt: false,
    },
    {
      name: "Platinum",
      price: 1500000,
      duration: "month",
      maxUsers: -1,
      maxCustomers: -1,
      maxVenders: -1,
      maxClients: -1,
      storageLimit: -1,
      trialDays: 0,
      isDisable: false,
      hasAccount: true,
      hasCrm: true,
      hasHrm: true,
      hasProject: true,
      hasPos: true,
      hasChatgpt: true,
    },
  ]

  for (const plan of plans) {
    await planDelegate.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    })
  }

  console.log(`Seeded ${plans.length} plans.`)
}
