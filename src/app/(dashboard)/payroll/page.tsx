import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, PageHeader, StatCard, fmtMoney } from "@/components/ui";

export default async function PayrollPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: session.id } });

  return (
    <>
      <PageHeader title="Payroll" subtitle="Your salary structure (read-only). Contact HR for changes." />
      {!profile ? (
        <Card>Profile not found.</Card>
      ) : (
        <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Base salary" value={fmtMoney(profile.salaryBase)} />
          <StatCard label="Bonus" value={fmtMoney(profile.salaryBonus)} />
          <StatCard label="Total" value={fmtMoney(profile.salaryBase + profile.salaryBonus)} />
        </div>
      )}
    </>
  );
}
