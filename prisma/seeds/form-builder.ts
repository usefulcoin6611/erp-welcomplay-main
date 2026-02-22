export async function seedFormBuilder(prisma: any) {
  console.log("Seeding Form Builder data...");

  const forms = [
    {
      formId: "FRM-LEAD-01",
      name: "Website Lead Form",
      code: "lead_web_01",
      isActive: true,
      isLeadActive: true,
      responses: 125,
    },
    {
      formId: "FRM-FEEDBACK-01",
      name: "Customer Feedback",
      code: "cust_fb_01",
      isActive: true,
      isLeadActive: false,
      responses: 48,
    },
    {
      formId: "FRM-CONTACT-01",
      name: "Contact Us",
      code: "contact_01",
      isActive: true,
      isLeadActive: true,
      responses: 89,
    },
    {
      formId: "FRM-SURVEY-01",
      name: "Product Survey",
      code: "survey_01",
      isActive: false,
      isLeadActive: false,
      responses: 32,
    },
  ];

  for (const form of forms) {
    const existing = await prisma.formBuilder.findFirst({
      where: {
        OR: [{ formId: form.formId }, { code: form.code }],
      },
    });

    const formRecord = existing
      ? await prisma.formBuilder.update({
          where: { id: existing.id },
          data: {
            name: form.name,
            code: form.code,
            isActive: form.isActive,
            isLeadActive: form.isLeadActive,
            responses: form.responses,
          },
        })
      : await prisma.formBuilder.create({
          data: form,
        });

    console.log(`${existing ? "Form updated" : "Form created"}: ${form.formId}`);

    await prisma.formField.deleteMany({
      where: { formId: formRecord.id },
    });

    const fields = [
      { name: "Name", type: "text", required: true },
      { name: "Email", type: "email", required: true },
      { name: "Phone", type: "text", required: false },
    ];

    for (const field of fields) {
      await prisma.formField.create({
        data: {
          formId: formRecord.id,
          name: field.name,
          type: field.type,
          required: field.required,
        },
      });
    }
  }

  console.log("Form Builder seeding completed.");
}
