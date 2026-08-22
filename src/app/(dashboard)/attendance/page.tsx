import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, PageHeader, Table, Tr, Td, Badge, EmptyState, buttonClass, fmtDate, fmtTime, fmtRelative } from "@/components/ui";
import { CheckButtons } from "@/components/attendance-forms";

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const weekAgo = new Date(todayUtc.getTime() - 6 * 86400000);

  const [todayRecord, records] = await Promise.all([
    prisma.attendance.findUnique({ where: { userId_date: { userId: session.id, date: todayUtc } } }),
    prisma.attendance.findMany({
      where: { userId: session.id, date: { gte: weekAgo } },
      orderBy: { date: "desc" },
    }),
  ]);

  const checkedIn = !!todayRecord?.checkIn;
  const checkedOut = !!todayRecord?.checkOut;
  const isOnBreak = !!(todayRecord?.breakStart && checkedIn && !checkedOut);

  return (
    <>
      <PageHeader title="Attendance" subtitle="Your check-ins for the past week — time tracking is live." />
      <Card className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Today · {fmtDate(todayUtc)}</p>
          <p className="mt-1.5 font-medium">
            {checkedIn && !checkedOut && !isOnBreak && (
              <>
                Checked in at {fmtTime(todayRecord?.checkIn)}
                <span className="ml-2 text-xs font-normal text-muted">{fmtRelative(todayRecord?.checkIn)}</span>
                {todayRecord?.totalMinutes == null && todayRecord?.breaks && Array.isArray(todayRecord.breaks) && (todayRecord.breaks as any[]).length > 0 && (
                  <span className="ml-2 text-xs text-muted">Breaks: {(todayRecord.breaks as any[]).length}</span>
                )}
              </>
            )}
            {checkedIn && !checkedOut && isOnBreak && (
              <>On break since {fmtTime(todayRecord?.breakStart)} <span className="ml-2 text-xs font-normal text-amber-600">timer paused</span></>
            )}
            {checkedIn && checkedOut && <>Day complete — checked out at {fmtTime(todayRecord?.checkOut)} · Worked {todayRecord?.totalMinutes != null ? `${Math.floor((todayRecord.totalMinutes as number)/60)}h ${(todayRecord.totalMinutes as number)%60}m` : "—"}</>}
            {!checkedIn && "You haven't checked in yet — timer not started"}
          </p>
        </div>
        <CheckButtons checkedIn={checkedIn} checkedOut={checkedOut} isOnBreak={isOnBreak} />
      </Card>

      <h2 className="mb-3 text-[15px] font-semibold">Last 7 days</h2>
      {records.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.5]">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          }
          message="No attendance records this week."
          action={
            !checkedIn ? (
              <Link href="#" className={buttonClass}>Check in to start tracking</Link>
            ) : undefined
          }
        />
      ) : (
        <Table head={["Date", "Check-in", "Check-out", "Worked", "Breaks", "Status"]}>
          {records.map((r: any) => (
            <Tr key={r.id}>
              <Td>{fmtDate(r.date)}</Td>
              <Td>{fmtTime(r.checkIn)}</Td>
              <Td>{fmtTime(r.checkOut)}</Td>
              <Td>{r.totalMinutes != null ? `${Math.floor(r.totalMinutes/60)}h ${r.totalMinutes%60}m` : r.checkIn && r.checkOut ? `${Math.floor((new Date(r.checkOut).getTime()-new Date(r.checkIn).getTime())/60000/60)}h` : "—"}</Td>
              <Td>{Array.isArray(r.breaks) ? (r.breaks as any[]).length : 0}</Td>
              <Td><Badge value={r.status} /></Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}
