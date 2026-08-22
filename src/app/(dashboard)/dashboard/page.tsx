import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, buttonClass, StatCard } from "@/components/ui";
import { DebouncedSearch } from "@/components/debounced-search";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { q } = await searchParams;
  const admin = isAdmin(session.role);

  const users = await prisma.user.findMany({
    include: {
      profile: true,
      attendances: { where: { date: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) } },
      leaveRequests: { where: { status: "APPROVED", startDate: { lte: new Date() }, endDate: { gte: new Date() } } },
    },
    orderBy: { createdAt: "asc" },
  });
  const pendingLeaves = admin
    ? await prisma.leaveRequest.count({ where: { status: "PENDING", user: { companyId: session.companyId } } })
    : 0;
  const filtered = q
    ? users.filter((u) => `${u.profile?.firstName} ${u.profile?.lastName} ${u.email}`.toLowerCase().includes(q.toLowerCase()))
    : users;
  const presentToday = users.filter((u) => u.attendances[0]?.checkIn && !u.attendances[0]?.checkOut).length;
  const onLeaveToday = users.filter((u) => u.leaveRequests.length > 0).length;

  return (
    <>
      {admin && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total staff" value={users.length} />
          <StatCard label="Present today" value={presentToday} />
          <StatCard label="On leave" value={onLeaveToday} />
          <StatCard label="Pending approvals" value={pendingLeaves} />
        </div>
      )}
      <div className="mb-5 flex items-center gap-3">
        <form className="flex-1">
          <DebouncedSearch placeholder="Search by name or email…" />
        </form>
        {admin && (
          <Link href="/admin/employees" className={buttonClass}>
            + Add employee
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => {
          const att = u.attendances[0];
          const onLeave = u.leaveRequests.length > 0;
          const status = onLeave
            ? { dot: "bg-info-text", label: "On leave" }
            : att?.checkIn && !att.checkOut
              ? { dot: "bg-positive-text", label: "Present" }
              : att?.checkOut
                ? { dot: "bg-neutral-text", label: "Done for today" }
                : { dot: "bg-attention-text", label: "Not checked in" };
          return (
            <Link
              key={u.id}
              href={`/employees/${u.id}`}
              className="group relative rounded-[10px] border border-border bg-surface p-5 shadow-rest transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="absolute right-4 top-4 flex items-center gap-1.5 text-xs text-muted" title={status.label}>
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <div className="flex items-center gap-4">
                <Avatar name={u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.email} />
                <div className="min-w-0">
                  <p className="truncate font-medium group-hover:text-accent">
                    {u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.email}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">{u.profile?.jobTitle || u.email}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">No employees match “{q}”.</p>
      )}
    </>
  );
}
