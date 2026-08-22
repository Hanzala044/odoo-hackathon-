import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const usersData = [
    {
      employeeId: "EMP001",
      email: "admin@dayflow.test",
      role: "ADMIN" as const,
      firstName: "Ava",
      lastName: "Patel",
      jobTitle: "HR Manager",
      department: "Human Resources",
      status: "PRESENT" as const,
    },
    {
      employeeId: "EMP002",
      email: "john.doe@dayflow.test",
      role: "EMPLOYEE" as const,
      firstName: "John",
      lastName: "Doe",
      jobTitle: "Software Engineer",
      department: "Engineering",
      status: "PRESENT" as const,
    },
    {
      employeeId: "EMP003",
      email: "jane.smith@dayflow.test",
      role: "EMPLOYEE" as const,
      firstName: "Jane",
      lastName: "Smith",
      jobTitle: "Product Designer",
      department: "Design",
      status: "LEAVE" as const,
    },
    {
      employeeId: "EMP004",
      email: "mike.ross@dayflow.test",
      role: "EMPLOYEE" as const,
      firstName: "Mike",
      lastName: "Ross",
      jobTitle: "Marketing Lead",
      department: "Marketing",
      status: "ABSENT" as const,
    },
    {
      employeeId: "EMP005",
      email: "sara.connor@dayflow.test",
      role: "EMPLOYEE" as const,
      firstName: "Sara",
      lastName: "Connor",
      jobTitle: "QA Engineer",
      department: "Engineering",
      status: "PRESENT" as const,
    },
    {
      employeeId: "EMP006",
      email: "david.kim@dayflow.test",
      role: "EMPLOYEE" as const,
      firstName: "David",
      lastName: "Kim",
      jobTitle: "DevOps Engineer",
      department: "Engineering",
      status: "ABSENT" as const,
    },
    {
      employeeId: "EMP007",
      email: "lisa.wang@dayflow.test",
      role: "EMPLOYEE" as const,
      firstName: "Lisa",
      lastName: "Wang",
      jobTitle: "HR Specialist",
      department: "Human Resources",
      status: "LEAVE" as const,
    },
    {
      employeeId: "EMP008",
      email: "chris.lee@dayflow.test",
      role: "EMPLOYEE" as const,
      firstName: "Chris",
      lastName: "Lee",
      jobTitle: "Sales Manager",
      department: "Sales",
      status: "PRESENT" as const,
    },
    {
      employeeId: "EMP009",
      email: "emma.brown@dayflow.test",
      role: "EMPLOYEE" as const,
      firstName: "Emma",
      lastName: "Brown",
      jobTitle: "Content Writer",
      department: "Marketing",
      status: "ABSENT" as const,
    },
    {
      employeeId: "EMP010",
      email: "alex.turner@dayflow.test",
      role: "EMPLOYEE" as const,
      firstName: "Alex",
      lastName: "Turner",
      jobTitle: "Data Analyst",
      department: "Analytics",
      status: "PRESENT" as const,
    },
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        employeeId: u.employeeId,
        email: u.email,
        password: passwordHash,
        role: u.role,
        profile: {
          create: {
            firstName: u.firstName,
            lastName: u.lastName,
            jobTitle: u.jobTitle,
            department: u.department,
            phone: "+1 555-010" + Math.floor(Math.random() * 9),
            address: "123 Main St, City",
            dateOfJoining: new Date("2023-01-15"),
          },
        },
      },
    });

    // attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.attendance.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: { status: u.status },
      create: {
        userId: user.id,
        date: today,
        status: u.status,
        checkIn: u.status === "PRESENT" ? new Date() : null,
      },
    });
  }

  console.log("Seed done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
