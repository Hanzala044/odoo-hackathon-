import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, PageHeader, Table, Tr, Td, Badge, EmptyState, fmtDate } from "@/components/ui";
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
      <PageHeader title="Time Off" subtitle="Request time off and follow each decision." />

      <Card className="mb-8">
        <h2 className="mb-4 text-[15px] font-semibold">New request</h2>
        <LeaveApplyForm
          existingRanges={requests
            .filter((r) => r.status === "PENDING" || r.status === "APPROVED")
            .map((r) => ({
              start: r.startDate.toISOString().slice(0, 10),
              end: r.endDate.toISOString().slice(0, 10),
              status: r.status,
              type: r.type,
            }))}
        />
      </Card>

      <h2 className="mb-3 text-[15px] font-semibold">Your requests</h2>
      {requests.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.5]">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
          }
          message="No time off requests yet. Pick your dates above to submit the first one."
        />
      ) : (
        <Table head={["Type", "From", "To", "Remarks", "Status", "HR comment"]}>
          {requests.map((r) => (
            <Tr key={r.id}>
              <Td><Badge value={r.type} /></Td>
              <Td>{fmtDate(r.startDate)}</Td>
              <Td>{fmtDate(r.endDate)}</Td>
              <Td className="max-w-48 truncate">{r.remarks}</Td>
              <Td><Badge value={r.status} /></Td>
              <Td className="max-w-48 truncate">{r.adminComment}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}
