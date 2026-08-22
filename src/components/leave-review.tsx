"use client";

import { useActionState } from "react";
import { reviewLeaveAction } from "@/app/actions/leaves";
import { useFormStatus } from "react-dom";
import { inputClass } from "@/components/ui";

function ReviewButton({ status, label }: { status: "APPROVED" | "REJECTED"; label: string }) {
  const { pending } = useFormStatus();
  const style =
    status === "APPROVED"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-red-600 hover:bg-red-700";
  return (
    <button
      type="submit"
      name="status"
      value={status}
      disabled={pending}
      className={`cursor-pointer rounded-lg ${style} px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50`}
    >
      {pending ? "…" : label}
    </button>
  );
}

export function LeaveReviewForm({ id }: { id: string }) {
  const [, action] = useActionState(reviewLeaveAction, null);
  return (
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
  );
}
