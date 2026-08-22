import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { PageHeader, Table, Tr, Td, EmptyState, Badge, linkClass, fmtDate } from "@/components/ui";
import { CreateEmployeeForm } from "@/components/create-employee-form";

export default async function AdminEmployeesPage() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { companyId: session.companyId },
    include: { profile: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <PageHeader title="Employees" subtitle={`${users.length} team member${users.length === 1 ? "" : "s"}`} />
      <div className="mb-6"><CreateEmployeeForm /></div>
      {users.length === 0 ? (
        <EmptyState message="No employees yet." />
      ) : (
        <Table head={["Employee ID", "Name", "Email", "Department", "Role", "Joined", ""]}>
          {users.map((u) => (
            <Tr key={u.id}>
              <Td>{u.employeeId}</Td>
              <Td>{u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : "—"}</Td>
              <Td>{u.email}</Td>
              <Td>{u.profile?.department}</Td>
              <Td><Badge value={u.role} /></Td>
              <Td>{fmtDate(u.profile?.dateOfJoining ?? u.createdAt)}</Td>
              <Td>
                <Link href={`/admin/employees/${u.id}`} className={linkClass}>
                  View / edit
                </Link>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}
