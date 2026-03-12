export async function seedTrainers(prisma: any) {
  console.log("Seeding Trainers...");

  const trainers = [
    {
      branch: "Pusat Jakarta",
      firstName: "Sarah",
      lastName: "Johnson",
      contact: "+62 812-3456-7890",
      email: "sarah.johnson@company.com",
      expertise: "Technical Skills, Programming",
      address: "Jakarta Pusat",
    },
    {
      branch: "Cabang Bandung",
      firstName: "Michael",
      lastName: "Brown",
      contact: "+62 813-9876-5432",
      email: "michael.brown@company.com",
      expertise: "Leadership, Management",
      address: "Bandung",
    },
    {
      branch: "Pusat Jakarta",
      firstName: "Emily",
      lastName: "Davis",
      contact: "+62 821-1234-5678",
      email: "emily.davis@company.com",
      expertise: "Customer Service, Communication",
      address: "Jakarta Selatan",
    },
  ];

  let createdCount = 0;

  for (const t of trainers) {
    const existing = await prisma.trainer.findUnique({
      where: { email: t.email },
    });

    if (existing) {
      continue;
    }

    await prisma.trainer.create({
      data: {
        branch: t.branch,
        firstName: t.firstName,
        lastName: t.lastName,
        contact: t.contact,
        email: t.email,
        expertise: t.expertise,
        address: t.address,
      },
    });
    createdCount++;
    console.log(`Trainer created: ${t.firstName} ${t.lastName}`);
  }

  console.log(`Trainers seeding completed. New records: ${createdCount}`);
}

