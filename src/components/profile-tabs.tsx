"use client";
import { useState } from "react";
import { calcSalary, PF_RATE, PROF_TAX } from "@/lib/salary";
import { fmtDate } from "@/components/ui";

export function ProfileTabs({ profile, isAdmin, isOwn }: { profile: any; isAdmin: boolean; isOwn: boolean }) {
  const [tab, setTab] = useState("private");
  const wage = profile.monthlyWage ?? 50000;
  const s = calcSalary(wage);
  const tabs = [
    { id: "resume", label: "Resume" },
    { id: "private", label: "Private Info" },
    ...(isAdmin ? [{ id: "salary", label: "Salary Info" }] : []),
    ...(isOwn ? [{ id: "security", label: "Security" }] : []),
  ];
  return (
    <div className="rounded-[10px] border border-border bg-surface shadow-rest">
      <div className="flex gap-1 border-b p-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`rounded px-3 py-1.5 text-sm ${tab === t.id ? "bg-accent text-white" : "border border-border hover:bg-bg"}`}>{t.label}</button>
        ))}
      </div>
      <div className="p-6 text-sm">
        {tab === "private" && (
          <div className="grid gap-3 md:grid-cols-2">
            <p>Date of Birth: {fmtDate(profile.dateOfBirth)}</p>
            <p>Bank Details: {profile.bankName || "—"} | Acc: {profile.bankAccount || "—"}</p>
            <p>Residing Address: {profile.address || "—"}</p>
            <p>IFSC: {profile.ifscCode || "—"}</p>
            <p>Nationality: {profile.nationality || "—"}</p>
            <p>PAN: {profile.panNo || "—"}</p>
            <p>Personal Email: {profile.personalEmail || "—"}</p>
            <p>UAN: {profile.uanNo || "—"}</p>
            <p>Gender: {profile.gender || "—"}</p>
            <p>Emp Code: {profile.empCode || profile.user?.employeeId || "—"}</p>
            <p>Marital Status: {profile.maritalStatus || "—"}</p>
            <p>Date of Joining: {fmtDate(profile.dateOfJoining)}</p>
          </div>
        )}
        {tab === "salary" && isAdmin && (
          <div className="space-y-2">
            <p>Month Wage <b>{wage.toLocaleString()}</b> | Yearly {(wage * 12).toLocaleString()}</p>
            <p>Basic {(s.basic).toFixed(2)} (50% wage) | HRA {(s.hra).toFixed(2)} (50% Basic) | Standard {s.standard.toFixed(2)} | Perf Bonus {s.perfBonus.toFixed(2)} | LTA {s.lta.toFixed(2)} | Fixed {s.fixed.toFixed(2)}</p>
            <p>PF 12%: {(s.basic * PF_RATE).toFixed(2)} | Prof Tax: {PROF_TAX}</p>
            <p className="text-xs text-muted">Auto-calculated. Total must not exceed wage.</p>
          </div>
        )}
        {tab === "resume" && <p className="text-muted">About / Skills / Certification — view only for now.</p>}
        {tab === "security" && <a href="/change-password" className="text-accent hover:underline">Change system-generated password</a>}
      </div>
    </div>
  );
}
