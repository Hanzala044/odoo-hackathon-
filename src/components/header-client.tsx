"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { checkInAction, checkOutAction, startBreakAction, endBreakAction } from "@/app/actions/attendance";
import { logoutAction } from "@/app/actions/auth";
import { Avatar } from "@/components/ui";

function formatElapsed(ms: number) {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function computeElapsed(checkInIso?: string, breakStartIso?: string | null, breaks?: Array<{ start: string; end: string | null }>) {
  if (!checkInIso) return 0;
  const checkIn = new Date(checkInIso).getTime();
  let breakMs = 0;
  if (breaks) {
    for (const b of breaks) {
      if (b.start && b.end) breakMs += new Date(b.end).getTime() - new Date(b.start).getTime();
    }
  }
  const now = Date.now();
  const activeBreakMs = breakStartIso ? now - new Date(breakStartIso).getTime() : 0;
  return now - checkIn - breakMs - activeBreakMs;
}

export function HeaderClient({
  companyName,
  companyLogo,
  email,
  userName,
  isCheckedIn,
  checkedInSince,
  checkedInAt,
  breakStartAt,
  breaks,
  isOnBreak,
  isAdmin,
}: {
  companyName?: string;
  companyLogo?: string | null;
  email: string;
  userName: string;
  isCheckedIn: boolean;
  checkedInSince?: string;
  checkedInAt?: string;
  breakStartAt?: string | null;
  breaks?: Array<{ start: string; end: string | null }>;
  isOnBreak?: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [justToggled, setJustToggled] = useState(false);
  const [elapsed, setElapsed] = useState(() => computeElapsed(checkedInAt, breakStartAt, breaks));
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const employeeTabs = [
    { href: "/dashboard", label: "My Dashboard" },
    { href: "/attendance", label: "Attendance" },
    { href: "/leaves", label: "Time Off" },
  ];
  const adminTabs = isAdmin
    ? [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/employees", label: "Manage Staff" },
        { href: "/admin/attendance", label: "All Attendance" },
        { href: "/admin/leaves", label: "Approvals" },
      ]
    : [];

  // live elapsed timer
  useEffect(() => {
    if (!isCheckedIn || !checkedInAt) return;
    const id = setInterval(() => setElapsed(computeElapsed(checkedInAt, breakStartAt, breaks)), 1000);
    return () => clearInterval(id);
  }, [isCheckedIn, checkedInAt, breakStartAt, breaks]);

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

  const dashboardHref = isAdmin ? "/admin/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 rounded-b-[16px] bg-[#0f1117] text-white shadow-lift">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href={dashboardHref} className="flex items-center gap-2 text-sm font-semibold tracking-wide">
            {companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={companyLogo} alt={companyName || "Company logo"} className="h-7 w-auto max-w-[140px] rounded object-contain bg-white p-0.5" />
            ) : null}
            <span>{companyName || "Dayflow"}</span>
          </Link>
          <nav className="flex items-center gap-1">
            {/* Employee tabs hidden for admin to avoid duplication, admin has own dashboard */}
            {!isAdmin &&
              employeeTabs.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    pathname === t.href || (t.href !== "/dashboard" && pathname?.startsWith(t.href))
                      ? "bg-accent text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            {adminTabs.length > 0 && (
              <>
                {isAdmin && <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">Admin</span>}
                {adminTabs.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      pathname === t.href || pathname?.startsWith(t.href) ? "bg-white text-[#0f1117]" : "text-amber-200/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
                {!isAdmin && <span className="mx-2 h-4 w-px bg-white/15" aria-hidden />}
              </>
            )}
            {isAdmin && (
              <>
                <span className="mx-2 h-4 w-px bg-white/15" aria-hidden />
                {employeeTabs.slice(1).map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      pathname?.startsWith(t.href) ? "bg-accent text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
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
                isOnBreak ? "bg-amber-400" : isCheckedIn ? "bg-emerald-400" : "bg-red-400"
              } ${justToggled ? "animate-ping" : ""} opacity-60`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-700 ${
                isOnBreak ? "bg-amber-400" : isCheckedIn ? "bg-emerald-400" : "bg-red-400"
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
                  <button className="w-full cursor-pointer border-t border-border px-4 py-2.5 text-left hover:bg-bg">Log Out</button>
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
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                  <path d="M3 8.5l3.5 3.5L13 4.5" />
                </svg>
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
            {isOnBreak ? (
              <p className="text-amber-300">On break since {breakStartAt ? new Date(breakStartAt).toLocaleTimeString() : "—"} · Paused {formatElapsed(elapsed)}</p>
            ) : (
              <p className="text-slate-400">
                Checked in at {checkedInSince} · Live {formatElapsed(elapsed)}
              </p>
            )}
            <div className="mt-1 flex justify-end gap-2">
              {!isOnBreak ? (
                <button
                  onClick={() => toggle(startBreakAction)}
                  disabled={pending}
                  className="cursor-pointer rounded-md border border-white/20 px-3 py-1 font-medium transition-colors hover:border-amber-400 hover:bg-amber-400 hover:text-black disabled:opacity-50"
                >
                  {pending ? "…" : "Take break"}
                </button>
              ) : (
                <button
                  onClick={() => toggle(endBreakAction)}
                  disabled={pending}
                  className="cursor-pointer rounded-md border border-white/20 bg-amber-400 px-3 py-1 font-medium text-black transition-colors hover:bg-amber-300 disabled:opacity-50"
                >
                  {pending ? "…" : "End break"}
                </button>
              )}
              <button
                onClick={() => toggle(checkOutAction)}
                disabled={pending || isOnBreak}
                title={isOnBreak ? "End break before checking out" : undefined}
                className="cursor-pointer rounded-md border border-white/20 px-3 py-1 font-medium transition-colors hover:border-accent hover:bg-accent disabled:opacity-50"
              >
                {justToggled ? "Checked out ✓" : pending ? "Checking out…" : <>Check out<span aria-hidden>→</span></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
