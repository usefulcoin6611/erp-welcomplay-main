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
      salaryType: "Monthly Payslip",
      basicSalary: 15000000,
      documentsCertificate: "certificate.png",
      documentsPhoto: "profile.png",
      accountHolderName: "John Doe",
      accountNumber: "14202546",
      bankName: "Bank Central",
      bankIdentifierCode: "5879823",
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
      salaryType: "Monthly Payslip",
      basicSalary: 18000000,
      documentsCertificate: "certificate.png",
      documentsPhoto: "profile.png",
      accountHolderName: "Jane Smith",
      accountNumber: "14202547",
      bankName: "Bank Central",
      bankIdentifierCode: "5879823",
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
      salaryType: "Monthly Payslip",
      basicSalary: 12000000,
      documentsCertificate: "certificate.png",
      documentsPhoto: "profile.png",
      accountHolderName: "Bob Johnson",
      accountNumber: "14202548",
      bankName: "Bank Central",
      bankIdentifierCode: "5879823",
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
      salaryType: "Monthly Payslip",
      basicSalary: 14000000,
      documentsCertificate: "certificate.png",
      documentsPhoto: "profile.png",
      accountHolderName: "Alice Brown",
      accountNumber: "14202549",
      bankName: "Bank Central",
      bankIdentifierCode: "5879823",
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
      salaryType: "Monthly Payslip",
      basicSalary: 13000000,
      documentsCertificate: "certificate.png",
      documentsPhoto: "profile.png",
      accountHolderName: "Charlie Wilson",
      accountNumber: "14202550",
      bankName: "Bank Central",
      bankIdentifierCode: "5879823",
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
      salaryType: "Monthly Payslip",
      basicSalary: 8000000,
      documentsCertificate: null,
      documentsPhoto: null,
      accountHolderName: "Employee Demo",
      accountNumber: "14202551",
      bankName: "Bank Demo",
      bankIdentifierCode: "0000000",
      branchLocation: "Demo City",
      taxPayerId: "99999",
    },
  ];

  for (const e of employees) {
    await prisma.employee.upsert({
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
        accountHolderName: e.accountHolderName,
        accountNumber: e.accountNumber,
        bankName: e.bankName,
        bankIdentifierCode: e.bankIdentifierCode,
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
        accountHolderName: e.accountHolderName,
        accountNumber: e.accountNumber,
        bankName: e.bankName,
        bankIdentifierCode: e.bankIdentifierCode,
        branchLocation: e.branchLocation,
        taxPayerId: e.taxPayerId,
      },
    });

    console.log(`Employee upserted: ${e.employeeId} - ${e.name}`);
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
