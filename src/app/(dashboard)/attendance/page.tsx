import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, PageHeader, Table, Td, Badge, EmptyState, fmtDate, fmtTime } from "@/components/ui";
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
      <PageHeader title="Attendance" subtitle="Check in and out, and review your last 7 days." />
      <Card className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Today · {fmtDate(todayUtc)}</p>
          <p className="mt-1 font-medium">
            {checkedIn ? `Checked in at ${fmtTime(todayRecord?.checkIn)}` : "You haven't checked in yet"}
          </p>
        </div>
        <CheckButtons checkedIn={checkedIn} checkedOut={checkedOut} />
      </Card>

      <h2 className="mb-3 font-semibold">Last 7 days</h2>
      {records.length === 0 ? (
        <EmptyState message="No attendance records yet. Check in to create your first one." />
      ) : (
        <Table head={["Date", "Check-in", "Check-out", "Status"]}>
          {records.map((r) => (
            <tr key={r.id}>
              <Td>{fmtDate(r.date)}</Td>
              <Td>{fmtTime(r.checkIn)}</Td>
              <Td>{fmtTime(r.checkOut)}</Td>
              <Td><Badge value={r.status} /></Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
