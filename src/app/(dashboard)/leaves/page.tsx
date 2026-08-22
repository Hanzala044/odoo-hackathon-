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

  // leave balance — quotas per year (from spec)
  const QUOTAS: Record<string, number> = { PAID: 12, SICK: 6, UNPAID: Infinity };
  const used: Record<string, number> = { PAID: 0, SICK: 0, UNPAID: 0 };
  const yearStart = new Date(Date.UTC(new Date().getFullYear(), 0, 1));
  for (const r of requests) {
    if (r.status !== "APPROVED") continue;
    if (r.startDate < yearStart) continue;
    const days = Math.ceil((r.endDate.getTime() - r.startDate.getTime()) / 86400000) + 1;
    if (r.type in used) used[r.type] += days;
  }

  return (
    <>
      <PageHeader title="Time Off" subtitle="Request time off and follow each decision." />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {Object.entries(QUOTAS).map(([type, quota]) => {
          const u = used[type] || 0;
          const rem = quota === Infinity ? "∞" : Math.max(0, quota - u);
          const pct = quota === Infinity ? 0 : Math.min(100, (u / quota) * 100);
          return (
            <div key={type} className="rounded-xl border border-border bg-surface p-4 shadow-rest">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">{type}</p>
              <p className="mt-1 text-2xl font-semibold">{rem}<span className="text-sm font-normal text-muted"> remaining</span></p>
              <p className="text-xs text-muted">{u} used of {quota === Infinity ? "∞" : quota} days</p>
              {quota !== Infinity && <div className="mt-2 h-1.5 rounded-full bg-bg"><div className="h-1.5 rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} /></div>}
            </div>
          );
        })}
      </div>

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
