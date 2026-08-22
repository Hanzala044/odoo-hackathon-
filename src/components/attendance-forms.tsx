"use client";

import { useActionState } from "react";
import { checkInAction, checkOutAction, markAttendanceAction } from "@/app/actions/attendance";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass, buttonClass, buttonSecondaryClass } from "@/components/ui";

export function CheckButtons({ checkedIn, checkedOut }: { checkedIn: boolean; checkedOut: boolean }) {
  const [inState, doCheckIn] = useActionState(async () => await checkInAction(), null);
  const [outState, doCheckOut] = useActionState(async () => await checkOutAction(), null);

  return (
    <div className="flex items-center gap-4">
      {(inState?.error || outState?.error) && (
        <FormError error={inState?.error ?? outState?.error} />
      )}
      {!checkedIn && !checkedOut && (
        <form action={doCheckIn}>
          <SubmitButton pendingText="Checking in…" className={buttonClass}>Check in</SubmitButton>
        </form>
      )}
      {checkedIn && !checkedOut && (
        <form action={doCheckOut}>
          <SubmitButton pendingText="Checking out…" className={buttonSecondaryClass}>Check out</SubmitButton>
        </form>
      )}
      {checkedIn && checkedOut && <p className="text-sm text-slate-500">Day complete — see you tomorrow.</p>}
    </div>
  );
}

export function MarkAttendanceForm({
  employees,
}: {
  employees: { id: string; label: string }[];
}) {
  const [state, action] = useActionState(markAttendanceAction, null);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <FormError error={state?.error} />
      <div>
        <label htmlFor="userId" className="mb-1 block text-sm font-medium">Employee</label>
        <select id="userId" name="userId" required className={inputClass}>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium">Date</label>
        <input id="date" name="date" type="date" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium">Status</label>
        <select id="status" name="status" className={inputClass}>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="HALF_DAY">Half day</option>
          <option value="LEAVE">Leave</option>
        </select>
      </div>
      <SubmitButton pendingText="Saving…">Mark</SubmitButton>
    </form>
  );
}
