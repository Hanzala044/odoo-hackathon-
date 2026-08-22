import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { q } = await searchParams;
  const admin = isAdmin(session.role);

  const users = await prisma.user.findMany({
    include: { profile: true, attendances: { where: { date: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) } }, leaveRequests: { where: { status: "APPROVED", startDate: { lte: new Date() }, endDate: { gte: new Date() } } } },
    orderBy: { createdAt: "asc" },
  });
  const filtered = q ? users.filter((u: any) => `${u.profile?.firstName} ${u.profile?.lastName} ${u.email}`.toLowerCase().includes(q.toLowerCase())) : users;

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        {admin && <Link href="/admin/employees" className="rounded bg-[#c147ff] px-4 py-1.5 text-xs font-bold text-white">NEW</Link>}
        <form className="flex-1"><input name="q" defaultValue={q} placeholder="Search" className="mx-auto block w-full max-w-sm rounded-full border bg-white px-4 py-1.5 text-sm" /></form>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u: any) => {
          const att = u.attendances[0];
          const onLeave = u.leaveRequests.length > 0;
          let statusIcon = "🟡";
          let title = "Absent";
          if (onLeave) { statusIcon = "✈️"; title = "On leave"; }
          else if (att?.checkIn) { statusIcon = "🟢"; title = "Present"; }
          return (
            <Link key={u.id} href={`/employees/${u.id}`} className="relative rounded-lg border bg-white p-4 shadow-sm hover:shadow-md">
              <span className="absolute right-3 top-3 text-xs" title={title}>{statusIcon}</span>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-100 text-2xl">👤</div>
                <p className="text-sm font-medium">[{u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.email}]</p>
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="mt-8 text-center text-sm text-slate-500">No employees found.</p>}
      <p className="mt-6 text-xs text-slate-400">Settings — Each card displays profile picture & basic info. Status: 🟢 Present · ✈️ On leave · 🟡 Absent</p>
    </>
  );
}
