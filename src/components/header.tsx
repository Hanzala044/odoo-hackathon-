"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Header({ companyName, email, isCheckedIn, onCheckIn, onCheckOut, checkedInSince }: { companyName?: string; email: string; isCheckedIn: boolean; onCheckIn: () => void; onCheckOut: () => void; checkedInSince?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const tabs = [
    { href: "/dashboard", label: "Employees" },
    { href: "/attendance", label: "Attendance" },
    { href: "/leaves", label: "Time Off" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-slate-700 bg-[#0f1117] text-white">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold">{companyName || "Company Logo"}</Link>
          <nav className="flex gap-1">
            {tabs.map((t) => (
              <Link key={t.href} href={t.href} className={`rounded px-3 py-1 text-sm ${pathname === t.href ? "bg-indigo-600" : "hover:bg-slate-800"}`}>{t.label}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${isCheckedIn ? "bg-green-500" : "bg-red-400"}`} title={isCheckedIn ? "Present" : "Not checked in"} />
          <div className="relative">
            <button onClick={() => setOpen((v) => !v)} className="h-8 w-8 rounded-full bg-slate-600 text-xs">👤</button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white py-1 text-sm text-slate-800 shadow-lg">
                <Link href="/profile" className="block px-4 py-2 hover:bg-slate-100" onClick={() => setOpen(false)}>My Profile</Link>
                <form action="/api/logout" method="post"><button className="w-full px-4 py-2 text-left hover:bg-slate-100">Log Out</button></form>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end px-4 pb-2">
        {!isCheckedIn ? (
          <button onClick={onCheckIn} className="rounded border px-4 py-1 text-xs hover:bg-slate-800">Check IN -&gt;</button>
        ) : (
          <div className="text-right text-xs">
            <p className="text-slate-400">Since {checkedInSince}</p>
            <button onClick={onCheckOut} className="mt-1 rounded border px-4 py-1 hover:bg-slate-800">Check Out -&gt;</button>
          </div>
        )}
      </div>
    </header>
  );
}
