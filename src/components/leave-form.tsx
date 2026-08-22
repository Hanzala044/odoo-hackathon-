"use client";

import { useActionState } from "react";
import { applyLeaveAction } from "@/app/actions/leaves";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function LeaveApplyForm() {
  const [state, action] = useActionState(applyLeaveAction, null);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="space-y-4">
      <FormError error={state?.error} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium">Type</label>
          <select id="type" name="type" className={inputClass}>
            <option value="PAID">Paid</option>
            <option value="SICK">Sick</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-medium">Start date</label>
          <input id="startDate" name="startDate" type="date" min={today} defaultValue={today} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-medium">End date</label>
          <input id="endDate" name="endDate" type="date" min={today} defaultValue={today} required className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="remarks" className="mb-1 block text-sm font-medium">Remarks (optional)</label>
        <textarea id="remarks" name="remarks" rows={2} maxLength={500} className={inputClass} />
      </div>
      <SubmitButton pendingText="Submitting…">Apply for leave</SubmitButton>
    </form>
  );
}
