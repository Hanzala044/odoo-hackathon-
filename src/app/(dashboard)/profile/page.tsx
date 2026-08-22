import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, PageHeader, fmtDate } from "@/components/ui";
import { OwnProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { profile: true },
  });
  if (!user?.profile) {
    return (
      <>
        <PageHeader title="My Profile" />
        <Card>Your profile has not been created yet. Please contact HR.</Card>
      </>
    );
  }
  const p = user.profile;

  return (
    <>
      <PageHeader title="My Profile" subtitle="View your details and update your contact information." />
      <div className="grid max-w-3xl gap-4">
        <Card>
          <h2 className="mb-4 font-semibold">Employment details</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Row label="Employee ID" value={user.employeeId} />
            <Row label="Email" value={user.email} />
            <Row label="Name" value={`${p.firstName} ${p.lastName}`} />
            <Row label="Job title" value={p.jobTitle} />
            <Row label="Department" value={p.department} />
            <Row label="Date of joining" value={fmtDate(p.dateOfJoining)} />
          </dl>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Contact info (editable)</h2>
          <OwnProfileForm phone={p.phone} address={p.address} />
        </Card>
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
