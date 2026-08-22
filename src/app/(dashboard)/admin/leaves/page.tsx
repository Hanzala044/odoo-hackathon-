import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { PageHeader, Table, Tr, Td, Badge, EmptyState, fmtDate } from "@/components/ui";
import { LeaveReviewForm } from "@/components/leave-review";

export default async function AdminLeavesPage() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) redirect("/dashboard");

  const requests = await prisma.leaveRequest.findMany({
    where: { user: { companyId: session.companyId } },
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
      <PageHeader title="Leave Approvals" subtitle="Respond to pending time-off requests." />
      {pendingFirst.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.5]">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          }
          message="All caught up — no leave requests to review."
        />
      ) : (
        <Table head={["Employee", "Type", "From", "To", "Remarks", "Status", "HR comment", "Action"]}>
          {pendingFirst.map((r) => (
            <Tr key={r.id}>
              <Td className="font-medium">
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
                  <span className="text-xs text-muted">Reviewed</span>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}
