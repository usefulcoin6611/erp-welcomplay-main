export async function seedBranches(prisma: any) {
  console.log("Seeding Branches...");
  
  const branches = [
    { name: "Pusat Jakarta" },
    { name: "Cabang Bandung" },
    { name: "Cabang Surabaya" }
  ];

  for (const branch of branches) {
    const existing = await prisma.branch.findFirst({
      where: { name: branch.name }
    });
    
    if (!existing) {
      await prisma.branch.create({
        data: branch
      });
      console.log(`Branch created: ${branch.name}`);
    }
  }
  
  console.log("Branches seeding completed.");
}
