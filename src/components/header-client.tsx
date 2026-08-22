"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { logoutAction } from "@/app/actions/auth";

export function HeaderClient({ companyName, email, isCheckedIn, checkedInSince }: { companyName?: string; email: string; isCheckedIn: boolean; checkedInSince?: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const tabs = [
    { href: "/dashboard", label: "Employees" },
    { href: "/attendance", label: "Attendance" },
    { href: "/leaves", label: "Time Off" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#111318] text-white">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold tracking-wide">{companyName || "Company Logo"}</Link>
          <nav className="flex gap-1">
            {tabs.map((t) => (
              <Link key={t.href} href={t.href} className={`rounded px-3 py-1 text-sm ${pathname?.startsWith(t.href) ? "bg-indigo-600" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>{t.label}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${isCheckedIn ? "bg-green-500" : "bg-red-400"}`} title={isCheckedIn ? "Present - click avatar to Check Out" : "Not checked in"} />
          <div className="relative">
            <button onClick={() => setOpen((v) => !v)} className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-400 text-sm">●</button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border bg-white text-sm text-slate-800 shadow-xl">
                <Link href="/profile" onClick={() => setOpen(false)} className="block px-4 py-2.5 hover:bg-slate-100">My Profile</Link>
                <form action={logoutAction}><button className="w-full border-t px-4 py-2.5 text-left hover:bg-slate-100">Log Out</button></form>
              </div>
            )}
          </div>
          <div className="h-6 w-8 bg-[#1e3a5f]" />
        </div>
      </div>
      <div className="flex justify-end px-4 pb-2">
        {!isCheckedIn ? (
          <button onClick={async () => { await checkInAction(); location.reload(); }} className="rounded border border-slate-600 px-4 py-1.5 text-xs hover:bg-slate-800">Check IN -&gt;</button>
        ) : (
          <div className="rounded border border-slate-700 bg-[#1a1d28] px-4 py-2 text-right text-xs">
            <p className="text-slate-400">Since {checkedInSince}</p>
            <button onClick={async () => { await checkOutAction(); location.reload(); }} className="mt-1 rounded border border-slate-600 px-3 py-1 hover:bg-slate-800">Check Out -&gt;</button>
          </div>
        )}
      </div>
    </header>
  );
}
