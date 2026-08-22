import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { PageHeader, Table, Td, Badge, EmptyState, fmtDate } from "@/components/ui";
import { LeaveReviewForm } from "@/components/leave-review";

export default async function AdminLeavesPage() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) redirect("/dashboard");

  const requests = await prisma.leaveRequest.findMany({
    include: { user: { include: { profile: true } } },
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  });

  const pendingFirst = [...requests].sort((a, b) => {
    if (a.status === b.status) return +new Date(b.createdAt) - +new Date(a.createdAt);
    const order: Record<string, number> = { PENDING: 0, APPROVED: 1, REJECTED: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <>
      <PageHeader title="Leave Approvals" subtitle="Review and respond to employee leave requests." />
      {pendingFirst.length === 0 ? (
        <EmptyState message="No leave requests yet." />
      ) : (
        <Table head={["Employee", "Type", "From", "To", "Remarks", "Status", "HR comment", "Action"]}>
          {pendingFirst.map((r) => (
            <tr key={r.id}>
              <Td>
                {r.user.profile
                  ? `${r.user.profile.firstName} ${r.user.profile.lastName}`
                  : r.user.email}
              </Td>
              <Td><Badge value={r.type} /></Td>
              <Td>{fmtDate(r.startDate)}</Td>
              <Td>{fmtDate(r.endDate)}</Td>
              <Td className="max-w-40 truncate">{r.remarks}</Td>
              <Td><Badge value={r.status} /></Td>
              <Td className="max-w-40 truncate">{r.adminComment}</Td>
              <Td>
                {r.status === "PENDING" ? (
                  <LeaveReviewForm id={r.id} />
                ) : (
                  <span className="text-xs text-slate-400">Reviewed</span>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
