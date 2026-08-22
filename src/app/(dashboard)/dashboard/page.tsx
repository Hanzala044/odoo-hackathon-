import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, StatCard, Badge } from "@/components/ui";
import { LogoutButton } from "@/components/logout-button";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));

  const [profile, todayAttendance, monthAttendance, pendingLeaves] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.id } }),
    prisma.attendance.findUnique({
      where: { userId_date: { userId: session.id, date: todayUtc } },
    }),
    prisma.attendance.findMany({
      where: { userId: session.id, date: { gte: monthStart }, status: "PRESENT" },
    }),
    prisma.leaveRequest.count({ where: { userId: session.id, status: "PENDING" } }),
  ]);

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back{profile ? `, ${profile.firstName}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s your day at a glance.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Status today" value={todayAttendance ? <Badge value={todayAttendance.status} /> : "Not checked in"} />
        <StatCard
          label="Check-in"
          value={todayAttendance?.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
        />
        <StatCard label="Days present this month" value={monthAttendance.length} />
        <StatCard label="Pending leave requests" value={pendingLeaves} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickLink href="/attendance" title="Attendance" desc="Check in / check out and review your history." />
        <QuickLink href="/leaves" title="Leave" desc="Apply for time off and track approvals." />
        <QuickLink href="/payroll" title="Payroll" desc="View your salary structure (read-only)." />
      </div>
    </>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md h-full">
        <h2 className="font-semibold text-indigo-700">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </Card>
    </Link>
  );
}
