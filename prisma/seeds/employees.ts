export async function seedEmployees(prisma: any) {
  console.log("Seeding Employees...");

  const employees = [
    {
      employeeId: "EMP001",
      name: "John Doe",
      email: "john.doe@company.com",
      phone: "+62 812-3456-7890",
      dateOfBirth: "1990-05-15",
      gender: "Male",
      address: "Jakarta Selatan",
      branch: "Pusat Jakarta",
      department: "IT Department",
      designation: "Software Engineer",
      dateOfJoining: "2024-01-15",
      lastLogin: "2024-10-31T09:30:00",
      isActive: true,
      salaryType: "Monthly",
      basicSalary: 15000000,
      documentsCertificate: "certificate.png",
      documentsPhoto: "profile.png",
      accountHolderName: "John Doe",
      accountNumber: "1234567890",
      bankName: "Bank BCA",
      bankIdentifierCode: "BCA001",
      branchLocation: "Jakarta",
      taxPayerId: "95682",
    },
    {
      employeeId: "EMP002",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      phone: "+62 813-9876-5432",
      dateOfBirth: "1988-08-20",
      gender: "Female",
      address: "Bandung",
      branch: "Cabang Bandung",
      department: "HR Department",
      designation: "HR Manager",
      dateOfJoining: "2023-12-01",
      lastLogin: "2024-10-31T08:15:00",
      isActive: true,
      salaryType: "Monthly",
      basicSalary: 18000000,
      documentsCertificate: "certificate.png",
      documentsPhoto: "profile.png",
      accountHolderName: "Jane Smith",
      accountNumber: "223344556677",
      bankName: "Bank Mandiri",
      bankIdentifierCode: "MAND001",
      branchLocation: "Bandung",
      taxPayerId: "95683",
    },
    {
      employeeId: "EMP003",
      name: "Bob Johnson",
      email: "bob.johnson@company.com",
      phone: "+62 821-1234-5678",
      dateOfBirth: "1992-03-10",
      gender: "Male",
      address: "Surabaya",
      branch: "Cabang Surabaya",
      department: "Sales Department",
      designation: "Sales Executive",
      dateOfJoining: "2024-02-20",
      lastLogin: "2024-10-30T17:45:00",
      isActive: true,
      salaryType: "Monthly",
      basicSalary: 12000000,
      documentsCertificate: "certificate.png",
      documentsPhoto: "profile.png",
      accountHolderName: "Bob Johnson",
      accountNumber: "1234567891",
      bankName: "Bank BCA",
      bankIdentifierCode: "BCA001",
      branchLocation: "Surabaya",
      taxPayerId: "95684",
    },
    {
      employeeId: "EMP004",
      name: "Alice Brown",
      email: "alice.brown@company.com",
      phone: "+62 822-5555-1234",
      dateOfBirth: "1991-11-25",
      gender: "Female",
      address: "Jakarta Pusat",
      branch: "Pusat Jakarta",
      department: "Finance Department",
      designation: "Accountant",
      dateOfJoining: "2024-03-10",
      lastLogin: null,
      isActive: false,
      salaryType: "Monthly",
      basicSalary: 14000000,
      documentsCertificate: "certificate.png",
      documentsPhoto: "profile.png",
      accountHolderName: "Alice Brown",
      accountNumber: "1234567892",
      bankName: "Bank BCA",
      bankIdentifierCode: "BCA001",
      branchLocation: "Jakarta",
      taxPayerId: "95685",
    },
    {
      employeeId: "EMP005",
      name: "Charlie Wilson",
      email: "charlie.wilson@company.com",
      phone: "+62 823-7777-9999",
      dateOfBirth: "1989-07-05",
      gender: "Male",
      address: "Medan",
      branch: "Pusat Jakarta",
      department: "Marketing Department",
      designation: "Marketing Specialist",
      dateOfJoining: "2024-01-25",
      lastLogin: "2024-10-29T16:30:00",
      isActive: true,
      salaryType: "Monthly",
      basicSalary: 13000000,
      documentsCertificate: "certificate.png",
      documentsPhoto: "profile.png",
      accountHolderName: "Charlie Wilson",
      accountNumber: "223344556678",
      bankName: "Bank Mandiri",
      bankIdentifierCode: "MAND001",
      branchLocation: "Medan",
      taxPayerId: "95686",
    },
    {
      employeeId: "EMP006",
      name: "Employee Demo",
      email: "employee@example.com",
      phone: "+62 811-0000-0000",
      dateOfBirth: "1995-01-01",
      gender: "Male",
      address: "Demo City",
      branch: "Pusat Jakarta",
      department: "IT Department",
      designation: "Software Engineer",
      dateOfJoining: "2024-01-01",
      lastLogin: null,
      isActive: true,
      salaryType: "Monthly",
      basicSalary: 8000000,
      documentsCertificate: null,
      documentsPhoto: null,
      accountHolderName: "Employee Demo",
      accountNumber: "1234567893",
      bankName: "Bank BCA",
      bankIdentifierCode: "BCA001",
      branchLocation: "Demo City",
      taxPayerId: "99999",
    },
  ];

  const hasEmployeeDocumentModel = Boolean((prisma as any).employeeDocument);

  const documentTypes = hasEmployeeDocumentModel
    ? await prisma.documentType.findMany({
        orderBy: { createdAt: "asc" },
      })
    : [];

  const certificateType =
    documentTypes.find((dt: any) => dt.name === "Employment Contract") ??
    documentTypes[0] ??
    null;

  const photoType =
    documentTypes.find((dt: any) => dt.name === "KTP") ??
    documentTypes[1] ??
    documentTypes[0] ??
    null;

  // Ambil bank account yang terkait COA payroll (1120, 1121) agar konsisten dengan Set Salary
  const payrollBankAccounts = await prisma.bankAccount.findMany({
    include: { chartAccount: true },
  });

  const payrollBca =
    payrollBankAccounts.find(
      (b: any) => b.chartAccount?.code === "1120",
    ) ?? null;
  const payrollMandiri =
    payrollBankAccounts.find(
      (b: any) => b.chartAccount?.code === "1121",
    ) ?? null;

  // Ambil master data payroll (allowance / loan / deduction options) untuk relasi Set Salary
  const allowanceOptionsAll = await prisma.allowanceOption.findMany({
    orderBy: { createdAt: "asc" },
  });
  const loanOptionsAll = await prisma.loanOption.findMany({
    orderBy: { createdAt: "asc" },
  });
  const deductionOptionsAll = await prisma.deductionOption.findMany({
    orderBy: { createdAt: "asc" },
  });

  const leaveTypesAll = await prisma.leaveType.findMany({
    orderBy: { createdAt: "asc" },
  });

  for (const e of employees) {
    // Mapping sederhana: Pusat Jakarta -> BCA, cabang lain -> Mandiri (fallback silang bila salah satu tidak ada)
    const payrollBank =
      e.branch === "Pusat Jakarta"
        ? payrollBca ?? payrollMandiri
        : payrollMandiri ?? payrollBca;

    const accountHolderName = payrollBank?.holderName ?? e.accountHolderName;
    const accountNumber = payrollBank?.accountNumber ?? e.accountNumber;
    const bankName = payrollBank?.bank ?? e.bankName;
    const bankIdentifierCode =
      (payrollBank as any)?.chartAccount?.code ?? e.bankIdentifierCode;

    const employee = await prisma.employee.upsert({
      where: { employeeId: e.employeeId },
      update: {
        name: e.name,
        email: e.email,
        phone: e.phone,
        dateOfBirth: new Date(`${e.dateOfBirth}T00:00:00.000Z`),
        gender: e.gender,
        address: e.address,
        branch: e.branch,
        department: e.department,
        designation: e.designation,
        dateOfJoining: new Date(`${e.dateOfJoining}T00:00:00.000Z`),
        lastLogin: e.lastLogin ? new Date(`${e.lastLogin}Z`) : null,
        isActive: e.isActive,
        salaryType: e.salaryType,
        basicSalary: e.basicSalary,
        documentsCertificate: e.documentsCertificate,
        documentsPhoto: e.documentsPhoto,
        accountHolderName,
        accountNumber,
        bankName,
        bankIdentifierCode,
        branchLocation: e.branchLocation,
        taxPayerId: e.taxPayerId,
      },
      create: {
        employeeId: e.employeeId,
        name: e.name,
        email: e.email,
        phone: e.phone,
        dateOfBirth: new Date(`${e.dateOfBirth}T00:00:00.000Z`),
        gender: e.gender,
        address: e.address,
        branch: e.branch,
        department: e.department,
        designation: e.designation,
        dateOfJoining: new Date(`${e.dateOfJoining}T00:00:00.000Z`),
        lastLogin: e.lastLogin ? new Date(`${e.lastLogin}Z`) : null,
        isActive: e.isActive,
        salaryType: e.salaryType,
        basicSalary: e.basicSalary,
        documentsCertificate: e.documentsCertificate,
        documentsPhoto: e.documentsPhoto,
        accountHolderName,
        accountNumber,
        bankName,
        bankIdentifierCode,
        branchLocation: e.branchLocation,
        taxPayerId: e.taxPayerId,
      },
    });

    if (hasEmployeeDocumentModel && certificateType && e.documentsCertificate) {
      const existingCertificate = await (prisma as any).employeeDocument.findFirst({
        where: {
          employeeId: employee.id,
          documentTypeId: certificateType.id,
        },
      });

      if (existingCertificate) {
        await (prisma as any).employeeDocument.update({
          where: { id: existingCertificate.id },
          data: { filePath: e.documentsCertificate },
        });
      } else {
        await (prisma as any).employeeDocument.create({
          data: {
            employeeId: employee.id,
            documentTypeId: certificateType.id,
            filePath: e.documentsCertificate,
          },
        });
      }
    }

    if (hasEmployeeDocumentModel && photoType && e.documentsPhoto) {
      const existingPhoto = await (prisma as any).employeeDocument.findFirst({
        where: {
          employeeId: employee.id,
          documentTypeId: photoType.id,
        },
      });

      if (existingPhoto) {
        await (prisma as any).employeeDocument.update({
          where: { id: existingPhoto.id },
          data: { filePath: e.documentsPhoto },
        });
      } else {
        await (prisma as any).employeeDocument.create({
          data: {
            employeeId: employee.id,
            documentTypeId: photoType.id,
            filePath: e.documentsPhoto,
          },
        });
      }
    }

    // Seed data Set Salary (Allowance, Commission, Loan, Deduction, Other Payment, Overtime)
    const baseSalary = Number(e.basicSalary ?? 0);

    const allowanceOption = allowanceOptionsAll[0] ?? null;
    const loanOption = loanOptionsAll[0] ?? null;
    const deductionOption = deductionOptionsAll[0] ?? null;

    // Allowances
    await prisma.employeeAllowance.deleteMany({ where: { employeeId: employee.id } });
    if (allowanceOption && baseSalary > 0) {
      await prisma.employeeAllowance.createMany({
        data: [
          {
            employeeId: employee.id,
            allowanceOptionId: allowanceOption.id,
            title: `${allowanceOption.name} Default`,
            amount: Math.round(baseSalary * 0.1),
            type: "Fixed",
          },
        ],
      });
    }

    // Commissions
    await prisma.employeeCommission.deleteMany({ where: { employeeId: employee.id } });
    if (baseSalary > 0) {
      await prisma.employeeCommission.createMany({
        data: [
          {
            employeeId: employee.id,
            title: "Sales Commission",
            amount: Math.round(baseSalary * 0.05),
            type: "Percentage",
          },
        ],
      });
    }

    // Loans
    await prisma.employeeLoan.deleteMany({ where: { employeeId: employee.id } });
    if (loanOption && baseSalary > 0) {
      const now = new Date("2024-01-01T00:00:00.000Z");
      const end = new Date("2024-12-31T00:00:00.000Z");
      await prisma.employeeLoan.createMany({
        data: [
          {
            employeeId: employee.id,
            loanOptionId: loanOption.id,
            title: `${loanOption.name} Seed`,
            amount: Math.round(baseSalary * 0.3),
            startDate: now,
            endDate: end,
            reason: "Seeded demo loan for Set Salary.",
          },
        ],
      });
    }

    // Saturation Deductions
    await prisma.employeeSaturationDeduction.deleteMany({ where: { employeeId: employee.id } });
    if (deductionOption && baseSalary > 0) {
      await prisma.employeeSaturationDeduction.createMany({
        data: [
          {
            employeeId: employee.id,
            deductionOptionId: deductionOption.id,
            title: `${deductionOption.name} Seed`,
            amount: Math.round(baseSalary * 0.05),
            type: "Fixed",
          },
        ],
      });
    }

    // Other Payments
    await prisma.employeeOtherPayment.deleteMany({ where: { employeeId: employee.id } });
    if (baseSalary > 0) {
      await prisma.employeeOtherPayment.createMany({
        data: [
          {
            employeeId: employee.id,
            title: "Performance Bonus",
            amount: Math.round(baseSalary * 0.15),
            type: "Fixed",
          },
        ],
      });
    }

    // Overtimes
    await prisma.employeeOvertime.deleteMany({ where: { employeeId: employee.id } });
    if (baseSalary > 0) {
      await prisma.employeeOvertime.createMany({
        data: [
          {
            employeeId: employee.id,
            title: "Weekend Overtime",
            days: 2,
            hours: 4,
            rate: Math.round(baseSalary / 160 / 2), // kira-kira setengah hourly rate
          },
        ],
      });
    }

    // Seed contoh data LeaveRequest agar halaman Manage Leave terisi
    await prisma.leaveRequest.deleteMany({
      where: { employeeId: employee.id },
    });

    const annualLeaveType =
      leaveTypesAll.find((lt: any) => lt.name === "Annual Leave") ??
      leaveTypesAll[0] ??
      null;
    const sickLeaveType =
      leaveTypesAll.find((lt: any) => lt.name === "Sick Leave") ??
      leaveTypesAll[1] ??
      leaveTypesAll[0] ??
      null;

    const baseYear = 2024;

    if (annualLeaveType) {
      await prisma.leaveRequest.create({
        data: {
          employeeId: employee.id,
          leaveTypeId: annualLeaveType.id,
          startDate: new Date(`${baseYear}-02-05T00:00:00.000Z`),
          endDate: new Date(`${baseYear}-02-07T00:00:00.000Z`),
          reason: "Annual leave (seed data)",
          status: "Approved",
        },
      });
    }

    if (sickLeaveType) {
      await prisma.leaveRequest.create({
        data: {
          employeeId: employee.id,
          leaveTypeId: sickLeaveType.id,
          startDate: new Date(`${baseYear}-03-12T00:00:00.000Z`),
          endDate: new Date(`${baseYear}-03-13T00:00:00.000Z`),
          reason: "Sick leave (seed data)",
          status: "Pending",
        },
      });
    }

    console.log(`Employee upserted & payroll seeded: ${e.employeeId} - ${e.name}`);
  }

  console.log("Employees seeding completed.");
}

export async function seedDevEmployeeUserLink(prisma: any) {
  const email = "employee@example.com";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(
      "Dev employee link: user with email employee@example.com not found, skipping link.",
    );
    return;
  }

  const employee = await prisma.employee.findFirst({
    where: { email },
  });

  if (!employee) {
    console.log(
      "Dev employee link: employee with email employee@example.com not found, skipping link.",
    );
    return;
  }

  if (employee.userId && employee.userId !== user.id) {
    console.log(
      "Dev employee link: employee already linked to a different user, skipping link.",
    );
    return;
  }

  if (employee.userId === user.id) {
    console.log(
      "Dev employee link: employee already linked to the correct user, nothing to do.",
    );
    return;
  }

  await prisma.employee.update({
    where: { id: employee.id },
    data: { userId: user.id },
  });

  console.log(
    `Dev employee link: linked employee ${employee.employeeId} to user ${user.email}.`,
  );
}
