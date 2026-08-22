import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true, attendances: { orderBy: { date: "desc" }, take: 5 } },
  });
  if (!user || !user.profile) return notFound();

  const p = user.profile;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f3f4f6] py-6">
      <div className="w-full max-w-[700px] bg-white border border-gray-300">
        {/* Top bar mimic */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-300 bg-white">
          <Link href="/employees" className="text-sm text-[#7c6cff] hover:underline">
            ← Back to Employees
          </Link>
          <span className="ml-auto text-xs bg-yellow-100 border border-yellow-300 px-2 py-1">View-only (non-editable) mode</span>
        </div>

        <div className="p-6">
          <h1 className="text-xl font-semibold mb-1">
            {p.firstName} {p.lastName}
          </h1>
          <p className="text-sm text-gray-500 mb-6">{p.jobTitle} • {p.department} • {user.employeeId}</p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" value={p.firstName} />
            <Field label="Last Name" value={p.lastName} />
            <Field label="Email" value={user.email} />
            <Field label="Employee ID" value={user.employeeId} />
            <Field label="Phone" value={p.phone ?? "-"} />
            <Field label="Department" value={p.department ?? "-"} />
            <Field label="Job Title" value={p.jobTitle ?? "-"} />
            <Field label="Address" value={p.address ?? "-"} />
            <Field label="Date of Joining" value={p.dateOfJoining ? new Date(p.dateOfJoining).toLocaleDateString() : "-"} />
            <Field label="Role" value={user.role} />
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2">Recent Attendance</h3>
            <div className="border border-gray-200">
              <div className="grid grid-cols-3 text-xs bg-gray-50 px-3 py-2 font-medium">
                <span>Date</span><span>Check In</span><span>Status</span>
              </div>
              {user.attendances.map((a) => (
                <div key={a.id} className="grid grid-cols-3 text-xs px-3 py-2 border-t border-gray-100">
                  <span>{new Date(a.date).toLocaleDateString()}</span>
                  <span>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "-"}</span>
                  <span>
                    {a.status === "PRESENT" && <span className="h-2 w-2 bg-green-500 rounded-full inline-block mr-1" />}
                    {a.status === "LEAVE" && "✈️ "}
                    {a.status}
                  </span>
                </div>
              ))}
              {user.attendances.length === 0 && <div className="text-xs p-3 text-gray-400">No records</div>}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-6">Make these cards clickable, and on click, the employee information page should open in a view-only (non-editable) mode.</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 p-3 bg-[#fafafa]">
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-sm mt-1 text-gray-800">{value}</div>
    </div>
  );
}
