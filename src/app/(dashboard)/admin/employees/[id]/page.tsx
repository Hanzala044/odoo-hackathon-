import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { BackLink, Card, PageHeader, fmtDate, fmtMoney } from "@/components/ui";
import { AdminProfileForm, PayrollForm } from "@/components/admin-forms";
import { PayslipCard } from "@/components/payslip";
import { workingDaysInMonth } from "@/lib/salary";

export default async function AdminEmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) redirect("/dashboard");

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!user) notFound();
  if (user.companyId !== session.companyId) notFound();
  const p = user.profile;

  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const start = new Date(Date.UTC(y, m, 1));
  const end = new Date(Date.UTC(y, m + 1, 1));
  const records = p ? await prisma.attendance.findMany({ where: { userId: user.id, date: { gte: start, lt: end } } }) : [];
  const totalWorkingDays = p ? workingDaysInMonth(y, m, p.workingDaysPerWeek ?? 5) : 22;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const half = records.filter((r) => r.status === "HALF_DAY").length * 0.5;
  const presentDays = present + half;
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <>
      <BackLink href="/admin/employees">Back to employees</BackLink>
      <PageHeader
        title={p ? `${p.firstName} ${p.lastName}` : user.email}
        subtitle={`${user.employeeId} · ${user.role}`}
      />
      <div className="grid max-w-5xl gap-4">
        <Card>
          <h2 className="mb-4 font-semibold">Employment details</h2>
          {!p ? (
            <p className="text-sm text-muted">No profile exists for this employee yet.</p>
          ) : (
            <dl className="mb-2 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row label="Email" value={user.email} />
              <Row label="Date of joining" value={fmtDate(p.dateOfJoining)} />
              <Row label="Monthly wage (source)" value={fmtMoney(p.monthlyWage)} />
              <Row label="Working days" value={`${p.workingDaysPerWeek}/week · ${p.breakHours}h break`} />
              <Row label="Legacy base+bonus" value={`${fmtMoney(p.salaryBase)} + ${fmtMoney(p.salaryBonus)}`} />
            </dl>
          )}
        </Card>

        {p && (
          <>
            <PayslipCard wage={p.monthlyWage} workingDaysPerWeek={p.workingDaysPerWeek} breakHours={p.breakHours} presentDays={Math.min(presentDays, totalWorkingDays)} totalWorkingDays={totalWorkingDays} monthLabel={`${monthLabel} — ${p.firstName}'s payslip`} />
            <Card>
              <h2 className="mb-4 font-semibold">Edit profile & wage (full access)</h2>
              <p className="mb-4 text-xs text-muted">Changing <b>Monthly Wage</b> instantly recalculates the payslip above. Working days and break hours also affect proration.</p>
              <AdminProfileForm userId={user.id} profile={p} />
            </Card>
            <Card>
              <h2 className="mb-4 font-semibold">Legacy salary base/bonus (optional)</h2>
              <p className="mb-3 text-xs text-muted">Kept for backward compatibility. Prefer Monthly Wage.</p>
              <PayrollForm userId={user.id} salaryBase={p.salaryBase} salaryBonus={p.salaryBonus} />
            </Card>
          </>
        )}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </>
  );
}
