import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, PageHeader, StatCard, Badge, Table, Tr, Td, fmtDate, fmtTime, buttonClass } from "@/components/ui";
import { CheckButtons } from "@/components/attendance-forms";

function formatMinutes(m: number) {
  const h = Math.floor(m / 60);
  const mins = m % 60;
  return `${h}h ${mins}m`;
}

export default async function EmployeeDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (isAdmin(session.role)) redirect("/admin/dashboard");

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const weekAgo = new Date(todayUtc.getTime() - 6 * 86400000);

  const [user, todayRecord, weekRecords, leaves, pendingLeavesCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.id }, include: { profile: true, company: true } }),
    prisma.attendance.findUnique({ where: { userId_date: { userId: session.id, date: todayUtc } } }),
    prisma.attendance.findMany({ where: { userId: session.id, date: { gte: weekAgo } }, orderBy: { date: "desc" } }),
    prisma.leaveRequest.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.leaveRequest.count({ where: { userId: session.id, status: "PENDING" } }),
  ]);

  const checkedIn = !!todayRecord?.checkIn;
  const checkedOut = !!todayRecord?.checkOut;
  const isOnBreak = !!todayRecord?.breakStart;

  let todayMinutes: number | null = null;
  if (checkedIn && todayRecord?.checkIn) {
    if (checkedOut && todayRecord.totalMinutes != null) todayMinutes = todayRecord.totalMinutes as number;
    else {
      const breaks: any[] = Array.isArray(todayRecord?.breaks) ? (todayRecord.breaks as any) : [];
      const breakMs = breaks.reduce((acc, b) => (b.start && b.end ? acc + (new Date(b.end).getTime() - new Date(b.start).getTime()) : acc), 0);
      const activeBreakMs = isOnBreak && todayRecord.breakStart ? Date.now() - new Date(todayRecord.breakStart as Date).getTime() : 0;
      const workMs = Date.now() - new Date(todayRecord.checkIn as Date).getTime() - breakMs - activeBreakMs;
      todayMinutes = Math.max(0, Math.floor(workMs / 60000));
    }
  }

  const weeklyMinutes = weekRecords.reduce((acc, r: any) => {
    if (r.totalMinutes != null) return acc + r.totalMinutes;
    if (r.checkIn && r.checkOut) return acc + Math.floor((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 60000);
    return acc;
  }, 0);

  return (
    <>
      <PageHeader title={`Welcome, ${user?.profile?.firstName || session.email}`} subtitle={`${user?.company?.name || ""} · ${fmtDate(todayUtc)}`} />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Today's status" value={checkedOut ? "Done" : isOnBreak ? "On Break" : checkedIn ? "Checked in" : "Not checked in"} />
        <StatCard label="Today worked" value={todayMinutes != null ? formatMinutes(todayMinutes) : "—"} />
        <StatCard label="Week worked" value={formatMinutes(weeklyMinutes)} />
        <StatCard label="Pending leaves" value={pendingLeavesCount} />
      </div>

      <Card className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Time tracking today</p>
          <p className="mt-1 text-sm">
            {checkedIn && !checkedOut
              ? isOnBreak
                ? `On break — paused at ${todayRecord?.breakStart ? new Date(todayRecord.breakStart as Date).toLocaleTimeString() : "—"}`
                : `Working since ${fmtTime(todayRecord?.checkIn)} · ${todayMinutes != null ? formatMinutes(todayMinutes) : ""}`
              : checkedOut
                ? `Checked out at ${fmtTime(todayRecord?.checkOut)} · Total ${todayRecord?.totalMinutes != null ? formatMinutes(todayRecord.totalMinutes as number) : "—"}`
                : "You haven't checked in yet — tap Check in to start timer"}
          </p>
          {todayRecord?.breaks && Array.isArray(todayRecord.breaks) && (todayRecord.breaks as any[]).length > 0 && (
            <p className="mt-1 text-xs text-muted">Breaks taken today: {(todayRecord.breaks as any[]).length}</p>
          )}
        </div>
        <CheckButtons checkedIn={checkedIn} checkedOut={checkedOut} isOnBreak={isOnBreak} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-[15px] font-semibold">Last 7 days</h2>
          {weekRecords.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">No attendance records this week.</p>
              {!checkedIn && <Link href="/attendance" className={buttonClass + " mt-3 inline-block"}>Go to Attendance</Link>}
            </Card>
          ) : (
            <Table head={["Date", "In", "Out", "Worked", "Status"]}>
              {weekRecords.map((r: any) => (
                <Tr key={r.id}>
                  <Td>{fmtDate(r.date)}</Td>
                  <Td>{fmtTime(r.checkIn)}</Td>
                  <Td>{fmtTime(r.checkOut)}</Td>
                  <Td>{r.totalMinutes != null ? formatMinutes(r.totalMinutes) : r.checkIn && r.checkOut ? formatMinutes(Math.floor((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime())/60000)) : "—"}</Td>
                  <Td><Badge value={r.status} /></Td>
                </Tr>
              ))}
            </Table>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-[15px] font-semibold">Recent leave requests</h2>
          {leaves.length === 0 ? (
            <Card><p className="text-sm text-muted">No leave requests yet.</p><Link href="/leaves" className="mt-3 inline-block text-sm font-medium text-accent hover:underline">Request time off →</Link></Card>
          ) : (
            <Table head={["Type", "From", "To", "Status"]}>
              {leaves.map((r) => (
                <Tr key={r.id}>
                  <Td><Badge value={r.type} /></Td>
                  <Td>{fmtDate(r.startDate)}</Td>
                  <Td>{fmtDate(r.endDate)}</Td>
                  <Td><Badge value={r.status} /></Td>
                </Tr>
              ))}
            </Table>
          )}
          <Link href="/leaves" className="mt-3 inline-block text-sm font-medium text-accent hover:underline">View all leaves →</Link>
        </div>
      </div>
    </>
  );
}
