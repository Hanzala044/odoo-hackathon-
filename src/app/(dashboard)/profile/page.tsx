import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { Card, PageHeader, fmtDate } from "@/components/ui";
import { OwnProfileForm } from "@/components/profile-form";
import { ProfileTabs } from "@/components/profile-tabs";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { profile: true, company: true },
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

  const admin = isAdmin(session.role);
  return (
    <>
      <PageHeader title="My Profile" subtitle="Employee's profile in form view." />
      <div className="grid max-w-4xl gap-4">
        <Card>
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-full bg-rose-300 flex items-center justify-center">✎</div>
            <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Row label="My Name" value={`${p.firstName} ${p.lastName}`} />
              <Row label="Company" value={user.company?.name} />
              <Row label="Login ID" value={user.employeeId} />
              <Row label="Department" value={p.department} />
              <Row label="Email" value={user.email} />
              <Row label="Manager" value={p.manager} />
              <Row label="Mobile" value={p.phone} />
              <Row label="Location" value={p.location} />
            </dl>
          </div>
        </Card>
        <ProfileTabs profile={{ ...p, user }} isAdmin={admin} isOwn={true} />
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
