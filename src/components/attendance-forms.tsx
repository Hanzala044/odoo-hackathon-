"use client";

import { useActionState } from "react";
import { checkInAction, checkOutAction, startBreakAction, endBreakAction, markAttendanceAction } from "@/app/actions/attendance";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass, buttonClass, buttonSecondaryClass } from "@/components/ui";

export function CheckButtons({ checkedIn, checkedOut, isOnBreak }: { checkedIn: boolean; checkedOut: boolean; isOnBreak?: boolean }) {
  const [inState, doCheckIn] = useActionState(async () => await checkInAction(), null);
  const [outState, doCheckOut] = useActionState(async () => await checkOutAction(), null);
  const [breakStartState, doBreakStart] = useActionState(async () => await startBreakAction(), null);
  const [breakEndState, doBreakEnd] = useActionState(async () => await endBreakAction(), null);
  const error = inState?.error ?? outState?.error ?? breakStartState?.error ?? breakEndState?.error;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {error && <FormError error={error} />}
      {!checkedIn && !checkedOut && (
        <form action={doCheckIn}>
          <SubmitButton pendingText="Checking in…" className={buttonClass}>Check in</SubmitButton>
        </form>
      )}
      {checkedIn && !checkedOut && !isOnBreak && (
        <>
          <form action={doBreakStart}>
            <SubmitButton pendingText="Starting break…" className={buttonSecondaryClass}>Take break</SubmitButton>
          </form>
          <form action={doCheckOut}>
            <SubmitButton pendingText="Checking out…" className={buttonSecondaryClass}>Check out</SubmitButton>
          </form>
        </>
      )}
      {checkedIn && !checkedOut && isOnBreak && (
        <>
          <form action={doBreakEnd}>
            <SubmitButton pendingText="Ending break…" className={buttonClass}>End break</SubmitButton>
          </form>
          <p className="text-xs text-amber-600">On break — end break to resume or check out</p>
        </>
      )}
      {checkedIn && checkedOut && <p className="text-sm text-muted">Day complete — see you tomorrow. Worked {checkedOut ? "" : ""}</p>}
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
        <label htmlFor="userId" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Employee</label>
        <select id="userId" name="userId" required className={inputClass}>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Date</label>
        <input id="date" name="date" type="date" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Status</label>
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
