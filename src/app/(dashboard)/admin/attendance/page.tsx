import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { PageHeader, Table, Tr, Td, Badge, EmptyState, fmtDate, fmtTime } from "@/components/ui";
import { MarkAttendanceForm } from "@/components/attendance-forms";

export default async function AdminAttendancePage() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) redirect("/dashboard");

  const [records, users] = await Promise.all([
    prisma.attendance.findMany({
      where: { user: { companyId: session.companyId } },
      include: { user: { include: { profile: true } } },
      orderBy: [{ date: "desc" }, { checkIn: "desc" }],
      take: 100,
    }),
    prisma.user.findMany({
      where: { companyId: session.companyId },
      include: { profile: true },
      orderBy: { employeeId: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader title="Attendance Records" subtitle="All employees · latest 100 records" />

      <div className="mb-8 rounded-[10px] border border-border bg-surface p-5 shadow-rest">
        <h2 className="mb-4 text-[15px] font-semibold">Mark attendance manually</h2>
        <MarkAttendanceForm
          employees={users.map((u: any) => ({
            id: u.id,
            label: u.profile ? `${u.profile.firstName} ${u.profile.lastName} (${u.employeeId})` : u.email,
          }))}
        />
      </div>

      {records.length === 0 ? (
        <EmptyState message="No attendance records yet." />
      ) : (
        <Table head={["Date", "Employee", "Check-in", "Check-out", "Worked", "Breaks", "Status"]}>
          {records.map((r: any) => (
            <Tr key={r.id}>
              <Td>{fmtDate(r.date)}</Td>
              <Td>{r.user.profile ? `${r.user.profile.firstName} ${r.user.profile.lastName}` : r.user.email}</Td>
              <Td>{fmtTime(r.checkIn)} {r.breakStart ? <span className="ml-1 rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-700">on break</span> : null}</Td>
              <Td>{fmtTime(r.checkOut)}</Td>
              <Td>{r.totalMinutes != null ? `${Math.floor(r.totalMinutes/60)}h ${r.totalMinutes%60}m` : r.checkIn && r.checkOut ? `${Math.floor((new Date(r.checkOut).getTime()-new Date(r.checkIn).getTime())/60000)}m` : "—"}</Td>
              <Td>{Array.isArray(r.breaks) ? (r.breaks as any[]).length : 0}</Td>
              <Td><Badge value={r.status} /></Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}
