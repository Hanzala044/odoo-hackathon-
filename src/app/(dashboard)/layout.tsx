import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HeaderClient } from "@/components/header-client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.id }, include: { company: true } });
  if (user?.mustChangePassword) redirect("/change-password");
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const att = await prisma.attendance.findUnique({ where: { userId_date: { userId: session.id, date: todayUtc } } });
  const isCheckedIn = !!att?.checkIn && !att?.checkOut;
  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderClient companyName={user?.company?.name} email={session.email} isCheckedIn={isCheckedIn} checkedInSince={att?.checkIn ? new Date(att.checkIn).toLocaleTimeString() : undefined} isAdmin={isAdmin(session.role)} />
      <main className="p-6">{children}</main>
    </div>
  );
}
