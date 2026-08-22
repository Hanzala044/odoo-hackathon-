"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar({ onCheckInChange }: { onCheckInChange?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const navItems = [
    { href: "/employees", label: "Employees" },
    { href: "/attendance", label: "Attendance" },
    { href: "/time-off", label: "Time Off" },
  ];

  const handleCheckIn = async () => {
    try {
      const res = await fetch("/api/attendance/check-in", { method: "POST" });
      if (res.ok) {
        setCheckedIn(true);
        const now = new Date();
        setCheckInTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        onCheckInChange?.();
      }
    } catch {}
  };

  const handleCheckOut = async () => {
    try {
      const res = await fetch("/api/attendance/check-out", { method: "POST" });
      if (res.ok) {
        setCheckedIn(false);
        setCheckInTime(null);
        onCheckInChange?.();
      }
    } catch {}
  };

  return (
    <header className="w-full border border-gray-300 bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-700">Company Logo</span>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1 text-sm ${
                    active
                      ? "bg-[#7c6cff] text-white rounded"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* status dot + avatar */}
          <div className="flex items-center gap-2">
            <div
              className={`h-4 w-4 rounded-full ${checkedIn ? "bg-green-500" : "bg-red-500"}`}
              title={checkedIn ? "Checked In" : "Not Checked In"}
            />
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="h-7 w-7 bg-[#c2d8f0] border border-gray-300 flex items-center justify-center text-sm"
              aria-label="User menu"
            >
              👤
            </button>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 top-10 w-40 border border-gray-300 bg-white shadow z-50">
              <Link
                href={`/employees/${(session?.user as any)?.id ?? ""}`}
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-200"
              >
                My Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Check In widget line - arrow pointing from avatar in mockup */}
      <div className="flex justify-end px-4 pb-2">
        {!checkedIn ? (
          <button
            onClick={handleCheckIn}
            className="border border-gray-400 px-3 py-1 text-xs bg-white hover:bg-gray-50"
          >
            Check IN -&gt;
          </button>
        ) : (
          <div className="border border-gray-400 bg-white p-2 text-xs min-w-[120px]">
            {checkInTime && <div className="text-[10px] text-gray-500">Since {checkInTime}</div>}
            <button onClick={handleCheckOut} className="border border-gray-400 px-3 py-1 mt-1 w-full">
              Check Out -&gt;
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
