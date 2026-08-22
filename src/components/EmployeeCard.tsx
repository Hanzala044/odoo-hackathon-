"use client";
import Link from "next/link";

type Props = {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  status: "PRESENT" | "ABSENT" | "LEAVE" | string;
  employeeId: string;
};

export default function EmployeeCard({ id, name, jobTitle, department, status, employeeId }: Props) {
  const statusIcon = () => {
    if (status === "PRESENT") return <span className="h-3 w-3 rounded-full bg-green-500 inline-block" title="Present" />;
    if (status === "LEAVE") return <span title="On Leave" className="text-sm">✈️</span>;
    return <span className="h-3 w-3 rounded-full bg-yellow-400 inline-block" title="Absent" />;
  };

  return (
    <Link
      href={`/employees/${id}`}
      className="border border-gray-300 bg-white p-3 flex flex-col gap-2 hover:shadow-md transition relative"
    >
      <div className="absolute top-2 right-2">{statusIcon()}</div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-[#dbeafe] border border-gray-300 flex items-center justify-center text-blue-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="text-xs text-gray-500">{employeeId}</div>
      </div>
      <div>
        <div className="text-sm font-medium text-gray-800">[ {name} ]</div>
        <div className="text-xs text-gray-500">{jobTitle}</div>
        <div className="text-xs text-gray-400">{department}</div>
      </div>
    </Link>
  );
}
