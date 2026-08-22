"use client";

import { useActionState, useEffect, useRef } from "react";
import { reviewLeaveAction } from "@/app/actions/leaves";
import { useFormStatus } from "react-dom";
import { inputClass } from "@/components/ui";

function ReviewButton({ status, label }: { status: "APPROVED" | "REJECTED"; label: string }) {
  const { pending } = useFormStatus();
  const style =
    status === "APPROVED"
      ? "bg-positive-text hover:bg-positive-text/90"
      : "bg-critical-text hover:bg-critical-text/90";
  return (
    <button
      type="submit"
      name="status"
      value={status}
      disabled={pending}
      className={`cursor-pointer rounded-md ${style} px-2.5 py-1 text-xs font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {pending ? (
        <svg viewBox="0 0 16 16" className="h-3 w-3 animate-spin fill-none stroke-current stroke-2">
          <circle cx="8" cy="8" r="6" opacity=".25" />
          <path d="M14 8a6 6 0 0 0-6-6" strokeLinecap="round" />
        </svg>
      ) : (
        label
      )}
    </button>
  );
}

export function LeaveReviewForm({ id }: { id: string }) {
  const [state, action] = useActionState(reviewLeaveAction, null);
  const rowRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (state?.success && rowRef.current) {
      const tr = rowRef.current.closest("tr");
      if (tr) {
        tr.classList.add("row-flash");
        setTimeout(() => tr.classList.remove("row-flash"), 1700);
      }
    }
  }, [state]);

  return (
    <td ref={rowRef}>
      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <input
          name="adminComment"
          placeholder="Comment (optional)"
          className={`${inputClass} w-36 px-2 py-1 text-xs`}
        />
        <ReviewButton status="APPROVED" label="Approve" />
        <ReviewButton status="REJECTED" label="Reject" />
      </form>
    </td>
  );
}
