import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, PageHeader, Table, Td, Badge, EmptyState, fmtDate } from "@/components/ui";
import { LeaveApplyForm } from "@/components/leave-form";

export default async function LeavesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const requests = await prisma.leaveRequest.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Leave Requests" subtitle="Apply for time off and track your requests." />

      <Card className="mb-8">
        <h2 className="mb-4 font-semibold">New request</h2>
        <LeaveApplyForm />
      </Card>

      <h2 className="mb-3 font-semibold">Your requests</h2>
      {requests.length === 0 ? (
        <EmptyState message="You haven't applied for any leave yet." />
      ) : (
        <Table head={["Type", "From", "To", "Remarks", "Status", "HR comment"]}>
          {requests.map((r) => (
            <tr key={r.id}>
              <Td><Badge value={r.type} /></Td>
              <Td>{fmtDate(r.startDate)}</Td>
              <Td>{fmtDate(r.endDate)}</Td>
              <Td className="max-w-48 truncate">{r.remarks}</Td>
              <Td><Badge value={r.status} /></Td>
              <Td className="max-w-48 truncate">{r.adminComment}</Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
