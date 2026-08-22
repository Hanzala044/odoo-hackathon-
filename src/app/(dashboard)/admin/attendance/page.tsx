import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { PageHeader, Table, Td, Badge, EmptyState, fmtDate, fmtTime } from "@/components/ui";
import { MarkAttendanceForm } from "@/components/attendance-forms";

export default async function AdminAttendancePage() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) redirect("/dashboard");

  const [records, users] = await Promise.all([
    prisma.attendance.findMany({
      include: { user: { include: { profile: true } } },
      orderBy: [{ date: "desc" }, { checkIn: "desc" }],
      take: 100,
    }),
    prisma.user.findMany({ include: { profile: true }, orderBy: { employeeId: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Attendance Records" subtitle="All employees · latest 100 records" />

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Mark attendance manually</h2>
        <MarkAttendanceForm
          employees={users.map((u) => ({
            id: u.id,
            label: u.profile ? `${u.profile.firstName} ${u.profile.lastName} (${u.employeeId})` : u.email,
          }))}
        />
      </div>

      {records.length === 0 ? (
        <EmptyState message="No attendance records yet." />
      ) : (
        <Table head={["Date", "Employee", "Check-in", "Check-out", "Status"]}>
          {records.map((r) => (
            <tr key={r.id}>
              <Td>{fmtDate(r.date)}</Td>
              <Td>{r.user.profile ? `${r.user.profile.firstName} ${r.user.profile.lastName}` : r.user.email}</Td>
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
