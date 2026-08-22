import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";

const employeeNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "My Profile" },
  { href: "/attendance", label: "Attendance" },
  { href: "/leaves", label: "Leave Requests" },
  { href: "/payroll", label: "Payroll" },
];

const adminNav = [
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/attendance", label: "Attendance Records" },
  { href: "/admin/leaves", label: "Leave Approvals" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const admin = isAdmin(session.role);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-6">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            Dayflow
          </Link>
          <span className="mt-0.5 block text-xs italic text-slate-400">Every workday, perfectly aligned.</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Menu</p>
          {employeeNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          {admin && (
            <>
              <p className="px-2 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Administration</p>
              {adminNav.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </>
          )}
        </nav>
        <div className="border-t border-slate-100 px-5 py-4 text-sm">
          <p className="font-medium">{session.email}</p>
          <p className="text-xs text-slate-500">{admin ? "Admin / HR" : "Employee"}</p>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-8">{children}</main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
    >
      {label}
    </Link>
  );
}
