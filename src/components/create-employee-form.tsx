"use client";
import { useActionState, useState } from "react";
import { createEmployeeAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-sm text-slate-500">{label}</span>
      <code className="min-w-0 flex-1 truncate rounded bg-slate-100 px-2 py-1 font-mono text-sm">{value}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
          } catch {
            const el = document.createElement("textarea");
            el.value = value;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="shrink-0 rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export function CreateEmployeeForm() {
  const [state, action] = useActionState(createEmployeeAction, null);
  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold">Create Employee (auto Login ID + password)</h3>
      {state?.error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
      {state?.generatedId && state.generatedPassword && (
        <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Share these credentials with the employee now.</p>
          <p className="text-xs text-amber-700">
            This is the only time the temporary password is shown — it cannot be retrieved later.
          </p>
          <CopyField label="Login ID" value={state.generatedId} />
          <CopyField label="Password" value={state.generatedPassword} />
        </div>
      )}
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
