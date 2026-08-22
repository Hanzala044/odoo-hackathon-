"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  if (breaks) for (const b of breaks) if (b.start && b.end) breakMs += new Date(b.end).getTime() - new Date(b.start).getTime();
  const now = Date.now();
  const activeBreakMs = breakStartIso ? now - new Date(breakStartIso).getTime() : 0;
  return now - checkIn - breakMs - activeBreakMs;
}

const icons = {
  overview: (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={p.className}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  users: (p:any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={p.className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  clock: (p:any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={p.className}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  calendar: (p:any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={p.className}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  check: (p:any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={p.className}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>,
  wallet: (p:any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={p.className}><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 12h.01"/><path d="M2 10h20"/></svg>,
  user: (p:any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={p.className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logOut: (p:any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={p.className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>,
  menu: (p:any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={p.className}><path d="M4 7h16M4 12h16M4 17h16"/></svg>,
  x: (p:any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={p.className}><path d="M18 6L6 18M6 6l12 12"/></svg>,
};

export function Sidebar({
  companyName, companyLogo, email, userName, profilePic, isCheckedIn, checkedInAt, breakStartAt, breaks, isOnBreak, isAdmin,
}: {
  companyName?: string; companyLogo?: string | null; email: string; userName: string; profilePic?: string | null;
  isCheckedIn: boolean; checkedInAt?: string; breakStartAt?: string | null; breaks?: Array<{start:string; end:string|null}>; isOnBreak?: boolean; isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [justToggled, setJustToggled] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!isCheckedIn || !checkedInAt) { setElapsed(0); return; }
    setElapsed(computeElapsed(checkedInAt, breakStartAt, breaks));
    const id = setInterval(() => setElapsed(computeElapsed(checkedInAt, breakStartAt, breaks)), 1000);
    return () => clearInterval(id);
  }, [isCheckedIn, checkedInAt, breakStartAt, breaks]);

  // clear error when status changes
  useEffect(() => { setActionError(null); }, [isCheckedIn, isOnBreak, checkedInAt, breakStartAt]);

  const toggle = (action: () => Promise<{ error?: string } | null>) => {
    setActionError(null);
    startTransition(async () => {
      const res: any = await action();
      if (res?.error) {
        setActionError(res.error);
      } else {
        setJustToggled(true); setTimeout(()=>setJustToggled(false), 1800);
      }
      router.refresh();
    });
  };

  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && href !== "/admin/dashboard" && pathname?.startsWith(href));

  const employeeNav = [
    { href: "/dashboard", label: "Overview", icon: icons.overview, desc: "Today & week" },
    { href: "/attendance", label: "Attendance", icon: icons.clock, desc: "History & timer" },
    { href: "/leaves", label: "Time Off", icon: icons.calendar, desc: "Requests" },
    { href: "/payroll", label: "Payroll", icon: icons.wallet, desc: "Salary" },
  ];
  const adminPrimary = [
    { href: "/admin/dashboard", label: "Overview", icon: icons.overview, desc: "Team pulse" },
    { href: "/admin/employees", label: "Team", icon: icons.users, desc: "Directory" },
    { href: "/admin/attendance", label: "Attendance", icon: icons.clock, desc: "All records" },
    { href: "/admin/leaves", label: "Approvals", icon: icons.check, desc: "Time off" },
  ];
  const personalForAdmin = [
    { href: "/attendance", label: "My Attendance", icon: icons.clock },
    { href: "/leaves", label: "My Leaves", icon: icons.calendar },
    { href: "/payroll", label: "My Payroll", icon: icons.wallet },
  ];

  const NavItem = ({ href, label, icon: Icon, desc }: any) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={()=>setOpen(false)}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-accent text-white shadow-sm" : "text-white/70 hover:bg-white/[0.07] hover:text-white"}`}
      >
        <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-white/55 group-hover:text-white"}`} />
        <div className="min-w-0 flex-1">
          <p className={`leading-none ${active ? "font-medium" : ""}`}>{label}</p>
          {desc && <p className={`mt-0.5 text-[11px] leading-none ${active ? "text-white/80" : "text-white/40"}`}>{desc}</p>}
        </div>
        {active && <span className="h-2 w-2 rounded-full bg-white/90" aria-hidden />}
      </Link>
    );
  };

  return (
    <>
      {/* mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button onClick={()=>setOpen(v=>!v)} className="rounded-md border border-border p-2 text-ink hover:bg-bg"><icons.menu className="h-5 w-5" /></button>
          <span className="flex items-center gap-2 text-sm font-semibold">{companyLogo ? <img src={companyLogo} alt="" className="h-6 w-auto rounded bg-white p-0.5" /> : null}{companyName || "Dayflow"}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isOnBreak ? "bg-attention-bg text-attention-text" : isCheckedIn ? "bg-positive-bg text-positive-text" : "bg-neutral-bg text-neutral-text"}`}>{isOnBreak ? "On break" : isCheckedIn ? "Working" : "Offline"}</span>
      </div>

      {/* sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-white/10 bg-[#0f1117] text-white transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* brand */}
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center justify-between">
            <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#0f1117] font-bold tracking-tight text-sm overflow-hidden">
                {companyLogo ? <img src={companyLogo} alt="" className="h-full w-full object-contain p-1" /> : (companyName?.slice(0,2).toUpperCase() || "DF")}
              </div>
              <div>
                <p className="text-sm font-semibold leading-none tracking-tight">{companyName || "Dayflow"}</p>
                <p className="text-[11px] text-white/50">HRMS · {isAdmin ? "Admin" : "Employee"}</p>
              </div>
            </Link>
            <button onClick={()=>setOpen(false)} className="rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"><icons.x className="h-5 w-5" /></button>
          </div>
          {/* live badge - subtle */}
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full ${isOnBreak ? "bg-amber-400" : isCheckedIn ? "bg-emerald-400" : "bg-white/30"} ${justToggled ? "animate-ping" : ""} opacity-60`} />
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isOnBreak ? "bg-amber-400" : isCheckedIn ? "bg-emerald-400" : "bg-white/30"}`} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-medium leading-none" suppressHydrationWarning>{isOnBreak ? "On break" : isCheckedIn ? `Working · ${mounted ? formatElapsed(elapsed) : "--:--:--"}` : "Not checked in"}</p>
              <p className="text-[11px] text-white/45 leading-none mt-1" suppressHydrationWarning>{isCheckedIn && checkedInAt ? `Since ${mounted ? new Date(checkedInAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) : "--:--"}` : "Timer idle"}</p>
            </div>
            <span className={`hidden text-[10px] font-semibold tracking-widest lg:inline ${isCheckedIn ? "text-white/50" : "text-white/30"}`}>LIVE</span>
          </div>
        </div>

        {/* nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
          {isAdmin ? (
            <>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/35">Manage</p>
              <nav className="space-y-1">{adminPrimary.map(i => <NavItem key={i.href} {...i} />)}</nav>
              <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/35">Personal</p>
              <nav className="space-y-1">
                {personalForAdmin.map(i => (
                  <Link key={i.href} href={i.href} onClick={()=>setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive(i.href) ? "bg-white text-[#0f1117] font-medium" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                    <i.icon className="h-[16px] w-[16px]" />{i.label}
                  </Link>
                ))}
                <Link href="/profile" onClick={()=>setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive("/profile") ? "bg-white text-[#0f1117] font-medium" : "text-white/60 hover:bg-white/5 hover:text-white"}`}><icons.user className="h-[16px] w-[16px]" />Profile</Link>
              </nav>
            </>
          ) : (
            <>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/35">You</p>
              <nav className="space-y-1">{employeeNav.map(i => <NavItem key={i.href} {...i} />)}</nav>
              <div className="my-4 border-t border-white/10" />
              <Link href="/profile" onClick={()=>setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isActive("/profile") ? "bg-accent text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                <icons.user className="h-[18px] w-[18px]" /><span>Profile</span><span className="ml-auto text-xs text-white/40">Settings</span>
              </Link>
            </>
          )}
        </div>

        {/* time controls */}
        <div className="border-t border-white/10 p-3">
          {actionError && <p className="mb-2 rounded-md bg-critical-bg px-2 py-1 text-xs text-critical-text">{actionError}</p>}
          {!isCheckedIn ? (
            <button onClick={()=>toggle(checkInAction as any)} disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50">
              {pending ? "Checking in…" : <>Check in<span aria-hidden>→</span></>}
            </button>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-white/80" suppressHydrationWarning>{isOnBreak ? "Break paused" : `Live · ${mounted ? formatElapsed(elapsed) : "--:--:--"}`}</p>
                <span className={`text-[11px] ${isOnBreak ? "text-amber-300" : "text-emerald-300"}`}>{breaks?.length ? `${breaks.length} break${breaks.length>1?"s":""}` : "No breaks"}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {!isOnBreak ? (
                  <button onClick={()=>toggle(startBreakAction as any)} disabled={pending} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-50">Take break</button>
                ) : (
                  <button onClick={()=>toggle(endBreakAction as any)} disabled={pending} className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-300 disabled:opacity-50">End break</button>
                )}
                <button onClick={()=>toggle(checkOutAction as any)} disabled={pending || isOnBreak} title={isOnBreak ? "End break first" : undefined} className="rounded-lg border border-white/15 bg-white px-3 py-2 text-xs font-semibold text-[#0f1117] hover:bg-white/90 disabled:opacity-40">Check out</button>
              </div>
              {isOnBreak && <p className="mt-2 text-center text-[11px] text-white/45" suppressHydrationWarning>Break started {breakStartAt && mounted ? new Date(breakStartAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) : "--:--"}</p>}
            </div>
          )}
          {/* user */}
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/[0.06] px-3 py-3">
            <div className="shrink-0">
              {profilePic ? <img src={profilePic} alt="" className="h-9 w-9 rounded-full object-cover" /> : <Avatar name={userName || email} size="sm" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-none">{userName}</p>
              <p className="truncate text-[11px] text-white/50">{email}</p>
            </div>
            <form action={logoutAction}>
              <button className="rounded-md p-2 text-white/60 hover:bg-white/10 hover:text-white" title="Log out"><icons.logOut className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      </aside>

      {/* overlay */}
      {open && <button aria-label="Close menu" onClick={()=>setOpen(false)} className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" />}
    </>
  );
}
