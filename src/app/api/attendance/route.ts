import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const att = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  return NextResponse.json(att);
}
