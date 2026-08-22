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

  return (
    <>
      <PageHeader title="Attendance" subtitle="Your check-ins for the past week." />
      <Card className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Today · {fmtDate(todayUtc)}</p>
          <p className="mt-1.5 font-medium">
            {checkedIn && !checkedOut && (
              <>
                Checked in at {fmtTime(todayRecord?.checkIn)}
                <span className="ml-2 text-xs font-normal text-muted">{fmtRelative(todayRecord?.checkIn)}</span>
              </>
            )}
            {checkedIn && checkedOut && <>Day complete — checked out at {fmtTime(todayRecord?.checkOut)}</>}
            {!checkedIn && "You haven't checked in yet"}
          </p>
        </div>
        <CheckButtons checkedIn={checkedIn} checkedOut={checkedOut} />
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
        <Table head={["Date", "Check-in", "Check-out", "Status"]}>
          {records.map((r) => (
            <Tr key={r.id}>
              <Td>{fmtDate(r.date)}</Td>
              <Td>{fmtTime(r.checkIn)}</Td>
              <Td>{fmtTime(r.checkOut)}</Td>
              <Td><Badge value={r.status} /></Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}
