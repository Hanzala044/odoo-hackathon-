"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { logoutAction } from "@/app/actions/auth";
import { Avatar, fmtRelative } from "@/components/ui";

export function HeaderClient({
  companyName,
  email,
  userName,
  isCheckedIn,
  checkedInSince,
  checkedInAt,
  isAdmin,
}: {
  companyName?: string;
  email: string;
  userName: string;
  isCheckedIn: boolean;
  checkedInSince?: string;
  checkedInAt?: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [justToggled, setJustToggled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const tabs = [
    { href: "/dashboard", label: "Employees" },
    { href: "/attendance", label: "Attendance" },
    { href: "/leaves", label: "Time Off" },
  ];
  const adminTabs = isAdmin
    ? [
        { href: "/admin/employees", label: "Manage Staff" },
        { href: "/admin/attendance", label: "All Attendance" },
        { href: "/admin/leaves", label: "Approvals" },
      ]
    : [];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggle = (action: () => Promise<unknown>) => {
    startTransition(async () => {
      await action();
      setJustToggled(true);
      setTimeout(() => setJustToggled(false), 1800);
    });
  };

  return (
    <header className="sticky top-0 z-40 rounded-b-[16px] bg-[#0f1117] text-white shadow-lift">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-semibold tracking-wide">
            {companyName || "Dayflow"}
          </Link>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  pathname === t.href || (t.href !== "/dashboard" && pathname?.startsWith(t.href))
                    ? "bg-accent text-white"
                    : pathname?.startsWith(t.href)
                      ? "bg-accent text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            ))}
            {adminTabs.length > 0 && (
              <>
                <span className="mx-2 h-4 w-px bg-white/15" aria-hidden />
                <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">Admin</span>
                {adminTabs.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      pathname?.startsWith(t.href) ? "bg-white text-[#0f1117]" : "text-amber-200/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full transition-colors duration-700 ${
                isCheckedIn ? "bg-emerald-400" : "bg-red-400"
              } ${justToggled ? "animate-ping" : ""} opacity-60`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-700 ${
                isCheckedIn ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
          </span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Account menu"
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <Avatar name={userName || email} size="sm" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-surface py-1 text-sm text-ink shadow-lift">
                <p className="truncate border-b border-border px-4 py-2 text-xs text-muted">{email}</p>
                <Link href="/profile" onClick={() => setOpen(false)} className="block px-4 py-2.5 hover:bg-bg">
                  My Profile
                </Link>
                <form action={logoutAction}>
                  <button className="w-full cursor-pointer border-t border-border px-4 py-2.5 text-left hover:bg-bg">
                    Log Out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end px-6 pb-3">
        {!isCheckedIn ? (
          <button
            onClick={() => toggle(checkInAction)}
            disabled={pending}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-white/20 px-4 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:bg-accent disabled:opacity-50"
          >
            {justToggled ? (
              <>
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current stroke-2"><path d="M3 8.5l3.5 3.5L13 4.5" /></svg>
                Checked in
              </>
            ) : pending ? (
              "Checking in…"
            ) : (
              <>Check in<span aria-hidden>→</span></>
            )}
          </button>
        ) : (
          <div className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-right text-xs">
            <p className="text-slate-400">Checked in at {checkedInSince}{checkedInAt && ` · ${fmtRelative(checkedInAt)}`}</p>
            <button
              onClick={() => toggle(checkOutAction)}
              disabled={pending}
              className="mt-1 cursor-pointer rounded-md border border-white/20 px-3 py-1 font-medium transition-colors hover:border-accent hover:bg-accent disabled:opacity-50"
            >
              {justToggled ? "Checked out ✓" : pending ? "Checking out…" : <>Check out<span aria-hidden>→</span></>}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
