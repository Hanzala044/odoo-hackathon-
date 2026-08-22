"use client";

import { useActionState } from "react";
import { adminUpdateProfileAction, updatePayrollAction } from "@/app/actions/profile";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function AdminProfileForm({
  userId,
  phone,
  address,
  jobTitle,
  department,
}: {
  userId: string;
  phone?: string | null;
  address?: string | null;
  jobTitle?: string | null;
  department?: string | null;
}) {
  const [state, action] = useActionState(adminUpdateProfileAction, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />
      <FormError error={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="jobTitle" className="mb-1 block text-sm font-medium">Job title</label>
          <input id="jobTitle" name="jobTitle" defaultValue={jobTitle ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="department" className="mb-1 block text-sm font-medium">Department</label>
          <input id="department" name="department" defaultValue={department ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone</label>
          <input id="phone" name="phone" defaultValue={phone ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium">Address</label>
          <input id="address" name="address" defaultValue={address ?? ""} className={inputClass} />
        </div>
      </div>
      <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
    </form>
  );
}

export function PayrollForm({ userId, salaryBase, salaryBonus }: { userId: string; salaryBase: number; salaryBonus: number }) {
  const [state, action] = useActionState(updatePayrollAction, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />
      <FormError error={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="salaryBase" className="mb-1 block text-sm font-medium">Base salary ($)</label>
          <input id="salaryBase" name="salaryBase" type="number" step="0.01" min="0" defaultValue={salaryBase} className={inputClass} />
        </div>
        <div>
          <label htmlFor="salaryBonus" className="mb-1 block text-sm font-medium">Bonus ($)</label>
          <input id="salaryBonus" name="salaryBonus" type="number" step="0.01" min="0" defaultValue={salaryBonus} className={inputClass} />
        </div>
      </div>
      <SubmitButton pendingText="Saving…">Update salary</SubmitButton>
    </form>
  );
}
