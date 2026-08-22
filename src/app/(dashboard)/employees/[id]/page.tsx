import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, BackLink } from "@/components/ui";
import { calcSalary, PF_RATE, PROF_TAX } from "@/lib/salary";

export default async function EmployeeViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  const admin = isAdmin(session.role);
  const user = await prisma.user.findUnique({ where: { id }, include: { profile: true, company: true } });
  if (!user?.profile || user.companyId !== session.companyId) return <p>Not found</p>;
  const p = user.profile;
  const wage = p.monthlyWage ?? 50000;
  const s = calcSalary(wage);
  const yearly = wage * 12;
  const pf = s.basic * PF_RATE;

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink href="/dashboard">Employees</BackLink>
      <div className="rounded-[10px] border border-border bg-surface p-6 shadow-rest">
        <div className="flex gap-6 border-b border-border pb-4">
          <Avatar name={`${p.firstName} ${p.lastName}`} size="lg" />
          <div className="grid flex-1 grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted">Name</span><p className="font-semibold">{p.firstName} {p.lastName}</p></div>
            <div><span className="text-muted">Company</span><p>{user.company?.name || "—"}</p></div>
            <div><span className="text-muted">Login ID</span><p>{user.employeeId}</p></div>
            <div><span className="text-muted">Department</span><p>{p.department || "—"}</p></div>
            <div><span className="text-muted">Email</span><p>{user.email}</p></div>
            <div><span className="text-muted">Manager</span><p>{p.manager || "—"}</p></div>
            <div><span className="text-muted">Mobile</span><p>{p.phone || "—"}</p></div>
            <div><span className="text-muted">Location</span><p>{p.location || "—"}</p></div>
          </div>
        </div>
        <div className="mt-4 flex gap-2 text-xs">
          <span className="rounded-md border border-border px-3 py-1 text-muted">Resume</span>
          <Link href={`/profile`} className="rounded-md border border-border px-3 py-1 text-muted hover:bg-bg transition-colors">Private Info</Link>
          {admin && <span className="rounded bg-accent px-3 py-1 text-white">Salary Info</span>}
        </div>
        {admin ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 text-sm">
            <div>
              <p className="font-semibold">Salary Info</p>
              <p>Month Wage <b>{wage.toLocaleString()}</b> / Month</p>
              <p>Yearly wage <b>{yearly.toLocaleString()}</b> / Yearly</p>
              <div className="mt-4 space-y-1">
                <p>Basic Salary {s.basic.toFixed(2)} ₹/month 50%</p>
                <p>House Rent Allowance {s.hra.toFixed(2)} ₹/month 50% of Basic</p>
                <p>Standard Allowance {s.standard.toFixed(2)} ₹/month 16.67%</p>
                <p>Performance Bonus {s.perfBonus.toFixed(2)} ₹/month 8.33%</p>
                <p>Leave Travel Allowance {s.lta.toFixed(2)} ₹/month 8.33%</p>
                <p>Fixed Allowance {s.fixed.toFixed(2)} ₹/month</p>
              </div>
            </div>
            <div className="space-y-2">
              <p>No. of working days: {p.workingDaysPerWeek}/week | Break: {p.breakHours} Hrs</p>
              <p>PF Employee {pf.toFixed(2)} (12% of Basic)</p>
              <p>PF Employer {pf.toFixed(2)}</p>
              <p>Professional Tax {PROF_TAX} ₹/month</p>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">View-only mode. Salary Info visible to Admin only.</p>
        )}
      </div>
    </div>
  );
}
