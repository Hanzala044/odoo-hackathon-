"use client";
import { calcAdvanced, prorateForMonth, workingDaysInMonth, type SalaryBreakdown } from "@/lib/salary";
import { Card } from "@/components/ui";
import { useMemo } from "react";

function money(n: number | null | undefined) { if (n == null) return "—"; return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }
function money2(n: number | null | undefined) { if (n == null) return "—"; return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export function PayslipCard({ wage, workingDaysPerWeek = 5, breakHours = 1, presentDays, totalWorkingDays, monthLabel }: {
  wage: number; workingDaysPerWeek?: number; breakHours?: number; presentDays?: number; totalWorkingDays?: number; monthLabel?: string;
}) {
  const s: SalaryBreakdown = calcAdvanced(wage);
  const prorated = (presentDays != null && totalWorkingDays != null) ? prorateForMonth(wage, presentDays!, totalWorkingDays!) : null;

  return (
    <div className="overflow-hidden rounded-[12px] border border-border bg-surface shadow-rest">
      {/* header */}
      <div className="bg-[#0f1117] px-6 py-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">{monthLabel || "Current month"} · Payslip</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">₹{s.netPay.toLocaleString("en-IN")} <span className="text-sm font-normal text-white/60">net payable</span></h3>
            <p className="mt-1 text-xs text-white/45">Gross {money(s.gross)} · Deductions {money(s.totalDeductionEmp)} · CTC {money(s.ctcMonthly)}/mo · {money(s.ctcAnnual)}/yr</p>
          </div>
          <div className="rounded-lg bg-white/10 px-4 py-3 text-right backdrop-blur">
            <p className="text-[11px] uppercase tracking-widest text-white/50">Monthly wage</p>
            <p className="text-lg font-semibold">{money(wage)}</p>
            <p className="text-[11px] text-white/40">{workingDaysPerWeek} days/wk · {breakHours}h break</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* earnings */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Earnings</h4>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bg text-xs text-muted">
                <tr><th className="px-3 py-2 text-left font-medium">Component</th><th className="px-3 py-2 text-right font-medium">Monthly</th><th className="px-3 py-2 text-right font-medium">Annual</th></tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <Row label="Basic (50% wage)" monthly={s.basic} annual={s.basic*12} />
                <Row label="House Rent Allowance (50% basic)" monthly={s.hra} annual={s.hra*12} />
                <Row label="Standard Allowance" monthly={s.standard} annual={s.standard*12} />
                <Row label="Conveyance" monthly={s.conveyance} annual={s.conveyance*12} muted />
                <Row label="Medical" monthly={s.medical} annual={s.medical*12} muted />
                <Row label="Performance Bonus (8.33%)" monthly={s.perfBonus} annual={s.perfBonus*12} />
                <Row label="Leave Travel Allowance (8.33%)" monthly={s.lta} annual={s.lta*12} />
                <Row label="Special / Fixed" monthly={s.special} annual={s.special*12} highlight />
                <tr className="bg-bg font-semibold"><td className="px-3 py-2">Gross Earnings</td><td className="px-3 py-2 text-right">{money(s.gross)}</td><td className="px-3 py-2 text-right">{money(s.gross*12)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* deductions + employer */}
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Deductions — Employee</h4>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-bg text-xs text-muted"><tr><th className="px-3 py-2 text-left font-medium">Component</th><th className="px-3 py-2 text-right font-medium">Monthly</th><th className="px-3 py-2 text-right font-medium">Annual</th></tr></thead>
                <tbody className="divide-y divide-border/60">
                  <Row label="Provident Fund — Employee (12% basic)" monthly={s.pfEmployee} annual={s.pfEmployee*12} />
                  <Row label="Professional Tax" monthly={s.profTax} annual={s.profTax*12} />
                  <Row label="Income Tax (TDS)" monthly={s.incomeTax} annual={s.incomeTax*12} muted />
                  <tr className="bg-critical-bg/40 font-semibold"><td className="px-3 py-2">Total Deduction</td><td className="px-3 py-2 text-right text-critical-text">-{money(s.totalDeductionEmp)}</td><td className="px-3 py-2 text-right text-critical-text">-{money(s.totalDeductionEmp*12)}</td></tr>
                  <tr className="bg-positive-bg font-semibold"><td className="px-3 py-2">Net Pay</td><td className="px-3 py-2 text-right text-positive-text">{money(s.netPay)}</td><td className="px-3 py-2 text-right text-positive-text">{money(s.netPay*12)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border bg-bg/50 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted">Employer contributions (CTC)</h4>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-xs text-muted">PF Employer</p><p className="font-medium">{money(s.pfEmployer)}</p></div>
              <div><p className="text-xs text-muted">Gratuity (4.81%)</p><p className="font-medium">{money(s.gratuity)}</p></div>
              <div><p className="text-xs text-muted">CTC / month</p><p className="font-semibold">{money(s.ctcMonthly)}</p></div>
            </div>
            <p className="mt-3 text-[11px] text-muted">CTC Annual {money(s.ctcAnnual)} · Employer PF {money(s.pfEmployer*12)}/yr · Gratuity {money(s.gratuity*12)}/yr</p>
          </div>

          {prorated ? (
            <div className="rounded-lg border border-amber-200 bg-attention-bg p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-attention-text">This month — attendance proration</p>
              <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-xs text-muted">Working days</p><p className="font-medium">{totalWorkingDays}</p></div>
                <div><p className="text-xs text-muted">Present</p><p className="font-medium text-positive-text">{presentDays}</p></div>
                <div><p className="text-xs text-muted">Payable</p><p className="font-semibold">{money(prorated!.payable)}</p></div>
              </div>
              <p className="mt-2 text-xs text-muted">Per day {money(Math.round(prorated!.perDay))} · Loss of pay {money(prorated!.lossOfPay)} for {(totalWorkingDays ?? 0) - (presentDays ?? 0)} absences</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border bg-bg px-6 py-3 text-[11px] text-muted">
        Auto-calculated from monthly wage. Standard allowance, conveyance & medical are fixed per policy; PF 12% of basic is statutory. LTA & performance bonus at 8.33% each mirror the Important wireframe you shipped.
      </div>
    </div>
  );
}

function Row({ label, monthly, annual, muted, highlight }: { label: string; monthly: number; annual: number; muted?: boolean; highlight?: boolean }) {
  return (
    <tr className={`${highlight ? "bg-accent-soft/40" : ""} ${muted ? "text-muted" : ""}`}>
      <td className="px-3 py-2">{label}</td>
      <td className="px-3 py-2 text-right tabular-nums">{monthly % 1 === 0 ? `₹${monthly.toLocaleString("en-IN")}` : `₹${money2(monthly)}`}</td>
      <td className="px-3 py-2 text-right tabular-nums text-muted">{annual % 1 === 0 ? `₹${annual.toLocaleString("en-IN")}` : `₹${money2(annual)}`}</td>
    </tr>
  );
}
export function MiniPayslip({ wage }: { wage: number }) {
  const s = calcAdvanced(wage);
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">Net pay</p>
          <p className="text-2xl font-semibold">₹{s.netPay.toLocaleString("en-IN")}</p>
          <p className="text-xs text-muted">Gross {s.gross.toLocaleString()} · PF {s.pfEmployee} · PTax {s.profTax}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">CTC / yr</p>
          <p className="font-medium">₹{s.ctcAnnual.toLocaleString("en-IN")}</p>
        </div>
      </div>
    </Card>
  );
}
