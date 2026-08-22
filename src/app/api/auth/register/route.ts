import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, employeeId, role } = body;
    if (!email || !password || !firstName || !lastName || !employeeId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { employeeId }] },
    });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        employeeId,
        role: role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
        profile: {
          create: {
            firstName,
            lastName,
            jobTitle: "New Employee",
            department: "General",
          },
        },
      },
    });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
