"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import EmployeeCard from "@/components/EmployeeCard";

type Employee = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  status: string;
};

export default function EmployeesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch(`/api/employees?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEmployees(data);
      })
      .catch(() => {});
  }, [search, refreshKey]);

  if (status === "loading") return <div className="p-8">Loading...</div>;
  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f3f4f6] py-4">
      <div className="w-full max-w-[800px] bg-white border border-gray-300 flex flex-col">
        <Navbar onCheckInChange={() => setRefreshKey((k) => k + 1)} />

        {/* Search + NEW badge area */}
        <div className="bg-[#eef2ff] border-b border-gray-300 px-4 py-3 flex items-center gap-4">
          <span className="bg-[#e879f9] text-white text-xs px-2 py-1">NEW</span>
          <div className="flex-1 flex justify-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="border border-gray-300 rounded-full px-4 py-1 text-sm w-64 text-center bg-white"
            />
          </div>
          <div className="w-8" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-[#f9fafb]">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              id={emp.id}
              name={`${emp.firstName} ${emp.lastName}`}
              jobTitle={emp.jobTitle}
              department={emp.department}
              employeeId={emp.employeeId}
              status={emp.status}
            />
          ))}
        </div>

        {employees.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">No employees found.</div>
        )}

        {/* Footer info from mockup */}
        <div className="px-4 py-6 text-xs text-gray-600 space-y-3 border-t border-gray-300 bg-white">
          <div>Settings</div>
          <div>Each card should display the employee&apos;s profile picture and some basic information.</div>
          <div>At the top-right corner of each card, there should be an icon indicating the employee&apos;s attendance or work status.</div>
          <div>
            The status indicators are as follows:
            <br />
            <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-1" /> Green dot: Employee is present in the office.
            <br />
            ✈️ Airplane icon: Employee is on leave.
            <br />
            <span className="inline-block h-2 w-2 bg-yellow-400 rounded-full mr-1" /> Yellow dot: Employee is absent. (Employee has not applied time off and is absent.)
          </div>
          <div className="pt-2 text-[11px] text-gray-500">
            Employees can mark their attendance using the Check In/Check Out systray, and users can view their attendance records through the Attendance module.
          </div>
        </div>
      </div>
    </div>
  );
}
