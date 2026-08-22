import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const search = req.nextUrl.searchParams.get("search") || "";
  const users = await prisma.user.findMany({
    where: {
      OR: search
        ? [
            { profile: { firstName: { contains: search } } },
            { profile: { lastName: { contains: search } } },
            { email: { contains: search } },
            { employeeId: { contains: search } },
          ]
        : undefined,
    },
    include: {
      profile: true,
      attendances: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const data = users.map((u) => ({
    id: u.id,
    employeeId: u.employeeId,
    email: u.email,
    role: u.role,
    firstName: u.profile?.firstName ?? "",
    lastName: u.profile?.lastName ?? "",
    jobTitle: u.profile?.jobTitle ?? "",
    department: u.profile?.department ?? "",
    profilePic: u.profile?.profilePic ?? null,
    status: u.attendances[0]?.status ?? "ABSENT",
    checkIn: u.attendances[0]?.checkIn ?? null,
    checkOut: u.attendances[0]?.checkOut ?? null,
  }));

  return NextResponse.json(data);
}
