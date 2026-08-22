import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  // Minimal seed - no mock attendance/leaves. Create only one ADMIN if none exists.
  const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!existing) {
    const pass = await bcrypt.hash("Admin@123", 10);
    await prisma.user.create({
      data: {
        employeeId: "EMP-001",
        email: "admin@dayflow.test",
        password: pass,
        role: "ADMIN",
        profile: { create: { firstName: "Admin", lastName: "User" } },
      },
    });
    console.log("Seeded admin: admin@dayflow.test / Admin@123");
  } else console.log("Admin already exists, skipping seed.");
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
