import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-indigo-600">← Back to Employees</Link>
      <div className="rounded-lg border bg-white p-6">
        <div className="flex gap-6 border-b pb-4">
          <div className="h-20 w-20 rounded-full bg-rose-300 flex items-center justify-center text-2xl">✎</div>
          <div className="grid flex-1 grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500">My Name</span><p className="font-semibold">{p.firstName} {p.lastName}</p></div>
            <div><span className="text-slate-500">Company</span><p>{user.company?.name || "—"}</p></div>
            <div><span className="text-slate-500">Login ID</span><p>{user.employeeId}</p></div>
            <div><span className="text-slate-500">Department</span><p>{p.department || "—"}</p></div>
            <div><span className="text-slate-500">Email</span><p>{user.email}</p></div>
            <div><span className="text-slate-500">Manager</span><p>{p.manager || "—"}</p></div>
            <div><span className="text-slate-500">Mobile</span><p>{p.phone || "—"}</p></div>
            <div><span className="text-slate-500">Location</span><p>{p.location || "—"}</p></div>
          </div>
        </div>
        <div className="mt-4 flex gap-2 text-xs">
          <span className="rounded border px-3 py-1">Resume</span>
          <Link href={`/profile`} className="rounded border px-3 py-1">Private Info</Link>
          {admin && <span className="rounded bg-slate-900 px-3 py-1 text-white">Salary Info</span>}
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
          <p className="mt-6 text-sm text-slate-500">View-only mode. Salary Info visible to Admin only.</p>
        )}
      </div>
    </div>
  );
}
