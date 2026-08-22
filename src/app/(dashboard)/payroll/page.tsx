import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { PayslipCard } from "@/components/payslip";
import { workingDaysInMonth } from "@/lib/salary";

export default async function PayrollPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: session.id } });
  if (!profile) {
    return (
      <>
        <PageHeader title="Payroll" subtitle="Your salary structure (read-only). Contact HR for changes." />
        <p className="rounded-lg border border-border bg-surface p-6 text-sm text-muted">Profile not found.</p>
      </>
    );
  }

  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const start = new Date(Date.UTC(y, m, 1));
  const end = new Date(Date.UTC(y, m + 1, 1));
  const records = await prisma.attendance.findMany({
    where: { userId: session.id, date: { gte: start, lt: end } },
  });
  const totalWorkingDays = workingDaysInMonth(y, m, profile.workingDaysPerWeek ?? 5);
  const present = records.filter((r) => r.status === "PRESENT").length;
  const half = records.filter((r) => r.status === "HALF_DAY").length * 0.5;
  const presentDays = present + half;
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <>
      <PageHeader title="Payroll" subtitle="Detailed payslip — earnings, deductions, CTC and attendance proration." />
      <PayslipCard
        wage={profile.monthlyWage}
        workingDaysPerWeek={profile.workingDaysPerWeek}
        breakHours={profile.breakHours}
        presentDays={Math.min(presentDays, totalWorkingDays)}
        totalWorkingDays={totalWorkingDays}
        monthLabel={monthLabel}
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-widest text-muted">Legacy base + bonus</p>
          <p className="mt-1 text-sm">Base ₹{profile.salaryBase.toLocaleString()} + Bonus ₹{profile.salaryBonus.toLocaleString()} = <b>₹{(profile.salaryBase + profile.salaryBonus).toLocaleString()}</b></p>
          <p className="mt-1 text-[11px] text-muted">Kept for compatibility. New source of truth is Monthly Wage.</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-widest text-muted">This month attendance</p>
          <p className="mt-1 text-sm">{records.length} records · <span className="text-positive-text">{present} present</span> · {half*2} half-day · {totalWorkingDays - presentDays} absent (LOP)</p>
          <p className="mt-1 text-[11px] text-muted">Prorated on {totalWorkingDays} working days in {monthLabel}.</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-widest text-muted">Need a change?</p>
          <p className="mt-1 text-sm">Contact HR. Admin edits <b>Monthly Wage</b> in Team → Employee → Edit profile.</p>
        </div>
      </div>
    </>
  );
}
