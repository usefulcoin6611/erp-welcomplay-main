import * as bcrypt from "bcryptjs";

export async function seedUsers(prisma: any) {
  console.log("Seeding users via Prisma...");
  const users = [
    {
      email: "superadmin@example.com",
      name: "Super Admin",
      password: "password1234",
      role: "super admin",
    },
    {
      email: "company@example.com",
      name: "Company",
      password: "password1234",
      role: "company",
    },
    {
      email: "client@example.com",
      name: "Client",
      password: "password1234",
      role: "client",
    },
    {
      email: "employee@example.com",
      name: "Employee",
      password: "password1234",
      role: "employee",
    },
  ];

  const branchPusatJakarta = await prisma.branch.findFirst({ where: { name: "Pusat Jakarta" } });
  const defaultBranch = branchPusatJakarta ?? (await prisma.branch.findFirst());

  for (const user of users) {
    const branch =
      user.role === "company"
        ? branchPusatJakarta ?? defaultBranch
        : user.role === "employee"
          ? defaultBranch
          : await prisma.branch.findFirst();
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        password: hashedPassword,
        emailVerified: true,
        branchId: branch?.id ?? null,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        password: hashedPassword,
        emailVerified: true,
        branchId: branch?.id ?? null,
      },
    });

    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: user.email,
        },
      },
      update: {
        userId: dbUser.id,
        password: hashedPassword,
      },
      create: {
        userId: dbUser.id,
        providerId: "credential",
        accountId: user.email,
        password: hashedPassword,
      },
    });

    console.log(`User ensured with role ${user.role}: ${user.email}`);
  }
}
