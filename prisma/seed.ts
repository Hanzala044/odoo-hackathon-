import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("Admin@123", 10);
  const empPass = await bcrypt.hash("Employee@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@dayflow.test" },
    update: {},
    create: {
      employeeId: "EMP-001",
      email: "admin@dayflow.test",
      password: adminPass,
      role: "ADMIN",
      profile: {
        create: {
          firstName: "Ava",
          lastName: "Reed",
          jobTitle: "HR Officer",
          department: "People Ops",
          phone: "+1 555 0100",
          address: "1 HQ Plaza",
          dateOfJoining: new Date("2023-01-10"),
          salaryBase: 95000,
          salaryBonus: 5000,
        },
      },
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@dayflow.test" },
    update: {},
    create: {
      employeeId: "EMP-002",
      email: "employee@dayflow.test",
      password: empPass,
      role: "EMPLOYEE",
      profile: {
        create: {
          firstName: "Sam",
          lastName: "Carter",
          jobTitle: "Software Engineer",
          department: "Engineering",
          phone: "+1 555 0111",
          address: "42 Elm Street",
          dateOfJoining: new Date("2024-03-01"),
          salaryBase: 72000,
          salaryBonus: 2000,
        },
      },
    },
  });

  const others = [
    ["EMP-003", "mia.chen@dayflow.test", "Mia", "Chen", "Designer", "Design"],
    ["EMP-004", "liam.patel@dayflow.test", "Liam", "Patel", "QA Engineer", "Engineering"],
    ["EMP-005", "noor.hassan@dayflow.test", "Noor", "Hassan", "Accountant", "Finance"],
  ] as const;

  for (const [employeeId, email, firstName, lastName, jobTitle, department] of others) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        employeeId,
        email,
        password: empPass,
        role: "EMPLOYEE",
        profile: {
          create: {
            firstName,
            lastName,
            jobTitle,
            department,
            dateOfJoining: new Date("2024-06-15"),
            salaryBase: 65000,
            salaryBonus: 1000,
          },
        },
      },
    });
  }

  // sample attendance for the last 7 days (skip weekends)
  const today = new Date();
  for (let i = 1; i <= 6; i++) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    if (d.getUTCDay() === 0 || d.getUTCDay() === 6) continue;
    for (const u of [employee]) {
      await prisma.attendance.upsert({
        where: { userId_date: { userId: u.id, date: d } },
        update: {},
        create: {
          userId: u.id,
          date: d,
          checkIn: new Date(d.getTime() + 9 * 3600000),
          checkOut: new Date(d.getTime() + 17.5 * 3600000),
          status: "PRESENT",
        },
      });
    }
  }

  // sample leave request
  const existingLeave = await prisma.leaveRequest.findFirst({
    where: { userId: employee.id, status: "PENDING" },
  });
  if (!existingLeave) {
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 7));
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 9));
    await prisma.leaveRequest.create({
      data: {
        userId: employee.id,
        type: "PAID",
        startDate: start,
        endDate: end,
        remarks: "Family trip.",
      },
    });
  }

  console.log(`Seeded. Admin: ${admin.email} / Admin@123 — Employee: ${employee.email} / Employee@123`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
