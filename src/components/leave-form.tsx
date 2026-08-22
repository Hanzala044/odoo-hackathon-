"use client";

import { useActionState, useMemo, useState } from "react";
import { applyLeaveAction } from "@/app/actions/leaves";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

type Range = { start: string; end: string; status: string; type: string };

function toISODate(v: string) {
  return new Date(`${v}T00:00:00.000Z`).getTime();
}

function overlaps(a: Range, start: number, end: number) {
  return toISODate(a.start) <= end && toISODate(a.end) >= start;
}

export function LeaveApplyForm({ existingRanges }: { existingRanges: Range[] }) {
  const [state, action] = useActionState(applyLeaveAction, null);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const today = new Date().toISOString().slice(0, 10);

  const conflict = useMemo(() => {
    if (!startDate || !endDate || toISODate(endDate) < toISODate(startDate)) return null;
    return existingRanges.find((r) => overlaps(r, toISODate(startDate), toISODate(endDate))) ?? null;
  }, [startDate, endDate, existingRanges]);

  const invalidRange = startDate && endDate && toISODate(endDate) < toISODate(startDate);

  return (
    <form action={action} className="space-y-4">
      {state?.success ? (
        <p className="flex items-center gap-2 rounded-md bg-positive-bg px-3 py-2 text-sm font-medium text-positive-text">
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M3 8.5l3.5 3.5L13 4.5" /></svg>
          {state.success} It now appears at the top of your requests below.
        </p>
      ) : (
        state?.error && (
          <p className="rounded-md bg-critical-bg px-3 py-2 text-sm text-critical-text">{state.error}</p>
        )
      )}
      {conflict && (
        <p className="rounded-md bg-attention-bg px-3 py-2 text-sm text-attention-text">
          Heads up — you already have a {conflict.status.toLowerCase()} {conflict.type.toLowerCase()} request from{" "}
          {new Date(`${conflict.start}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric" })} to{" "}
          {new Date(`${conflict.end}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Overlapping
          requests can&apos;t be submitted.
        </p>
      )}
      {invalidRange && !conflict && (
        <p className="rounded-md bg-attention-bg px-3 py-2 text-sm text-attention-text">
          End date must be on or after the start date.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="type" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Type</label>
          <select id="type" name="type" className={inputClass}>
            <option value="PAID">Paid</option>
            <option value="SICK">Sick</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>
        <div>
          <label htmlFor="startDate" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Start date</label>
          <input id="startDate" name="startDate" type="date" min={today} defaultValue={startDate} onChange={(e) => setStartDate(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="endDate" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">End date</label>
          <input id="endDate" name="endDate" type="date" min={startDate || today} defaultValue={endDate} onChange={(e) => setEndDate(e.target.value)} required className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="remarks" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Remarks (optional)</label>
        <textarea id="remarks" name="remarks" rows={2} maxLength={500} className={inputClass} />
      </div>
      <SubmitButton pendingText="Submitting…">Apply for leave</SubmitButton>
    </form>
  );
}
