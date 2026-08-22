"use client";
import { useActionState } from "react";
import { createEmployeeAction } from "@/app/actions/auth";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass } from "@/components/ui";
export function CreateEmployeeForm() {
  const [state, action] = useActionState(createEmployeeAction, null);
  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold">Create Employee (auto Login ID + password)</h3>
      {state?.error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="rounded bg-green-50 p-2 text-sm text-green-700">{state.success}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm font-medium">First name</label><input name="firstName" required className={inputClass} /></div>
        <div><label className="mb-1 block text-sm font-medium">Last name</label><input name="lastName" required className={inputClass} /></div>
        <div><label className="mb-1 block text-sm font-medium">Email</label><input name="email" type="email" required className={inputClass} /></div>
        <div><label className="mb-1 block text-sm font-medium">Phone</label><input name="phone" className={inputClass} /></div>
      </div>
      <SubmitButton pendingText="Creating…">Create</SubmitButton>
    </form>
  );
}
