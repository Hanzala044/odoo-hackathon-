"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any>(null);
  const load = () => fetch("/api/attendance").then(r => r.json()).then(setAttendance);
  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f3f4f6] py-4">
      <div className="w-full max-w-[800px] bg-white border border-gray-300">
        <Navbar onCheckInChange={load} />
        <div className="p-6">
          <h1 className="text-lg font-semibold">Attendance</h1>
          <p className="text-xs text-gray-500 mt-1">Employees can mark their attendance using the Check In/Check Out systray, and users can view their attendance records through the Attendance module.</p>

          <div className="mt-6 border border-gray-300 p-4 bg-[#fafafa] max-w-sm">
            <div className="text-xs text-gray-500">{attendance?.checkIn ? `Since ${new Date(attendance.checkIn).toLocaleTimeString()}` : "Not checked in yet"}</div>
            <div className="mt-2 flex gap-2">
              <Link href="/employees" className="text-xs border border-gray-400 px-3 py-1 bg-white">Go to Employees</Link>
            </div>
            {attendance && <pre className="text-xs mt-3 bg-white border p-2 overflow-auto">{JSON.stringify(attendance, null, 2)}</pre>}
          </div>
        </div>
      </div>
    </div>
  );
}
