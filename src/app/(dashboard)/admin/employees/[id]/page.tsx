import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { BackLink, Card, PageHeader, fmtDate, fmtMoney } from "@/components/ui";
import { AdminProfileForm, PayrollForm } from "@/components/admin-forms";

export default async function AdminEmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) redirect("/dashboard");

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!user) notFound();
  const p = user.profile;

  return (
    <>
      <BackLink href="/admin/employees">Back to employees</BackLink>
      <PageHeader
        title={p ? `${p.firstName} ${p.lastName}` : user.email}
        subtitle={`${user.employeeId} · ${user.role}`}
      />
      <div className="grid max-w-3xl gap-4">
        <Card>
          <h2 className="mb-4 font-semibold">Employment details</h2>
          {!p ? (
            <p className="text-sm text-slate-500">No profile exists for this employee yet.</p>
          ) : (
            <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row label="Email" value={user.email} />
              <Row label="Date of joining" value={fmtDate(p.dateOfJoining)} />
              <Row label="Current salary" value={`${fmtMoney(p.salaryBase)} + ${fmtMoney(p.salaryBonus)}`} />
            </dl>
          )}
        </Card>

        {p && (
          <>
            <Card>
              <h2 className="mb-4 font-semibold">Edit profile (full access)</h2>
              <AdminProfileForm userId={user.id} phone={p.phone} address={p.address} jobTitle={p.jobTitle} department={p.department} />
            </Card>
            <Card>
              <h2 className="mb-4 font-semibold">Salary structure</h2>
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
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </>
  );
}
