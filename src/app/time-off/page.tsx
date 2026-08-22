"use client";
import Navbar from "@/components/Navbar";

export default function TimeOffPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f3f4f6] py-4">
      <div className="w-full max-w-[800px] bg-white border border-gray-300">
        <Navbar />
        <div className="p-6">
          <h1 className="text-lg font-semibold">Time Off</h1>
          <p className="text-xs text-gray-500 mt-1">Apply and track leave requests. Yellow dot indicates absent without time off.</p>
          <div className="mt-6 border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">Time Off module — integrate with /api/leaves</div>
        </div>
      </div>
    </div>
  );
}
