"use client";
import { useActionState, useState } from "react";
import { createEmployeeAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { inputClass, buttonSecondaryClass, buttonClass } from "@/components/ui";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      <code className="min-w-0 flex-1 truncate rounded-md bg-bg px-2 py-1 font-mono text-sm">{value}</code>
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
        className={buttonSecondaryClass}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}

export function CreateEmployeeForm() {
  const [state, action] = useActionState(createEmployeeAction, null);
  const hasCredentials = !!state?.generatedId && !!state?.generatedPassword;
  return (
    <form action={action} className="space-y-4 rounded-[10px] border border-border bg-surface p-5 shadow-rest">
      <h2 className="text-[15px] font-semibold">Add an employee</h2>
      <p className="text-sm text-muted">A login ID and temporary password are generated automatically.</p>
      {state?.error && <p className="rounded-md bg-critical-bg px-3 py-2 text-sm text-critical-text">{state.error}</p>}
      {hasCredentials && (
        <div className="space-y-3 rounded-lg border border-accent/30 bg-accent-soft p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-accent">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.75]">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 1 1 8 0v3" />
            </svg>
            Credentials generated
          </p>
          <p className="text-xs text-muted">
            This is the only time the password is shown — copy it now, it cannot be retrieved later.
          </p>
          <CopyField label="Login ID" value={state.generatedId!} />
          <CopyField label="Password" value={state.generatedPassword!} />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name"><input name="firstName" required className={inputClass} /></Field>
        <Field label="Last name"><input name="lastName" required className={inputClass} /></Field>
        <Field label="Email"><input name="email" type="email" required className={inputClass} /></Field>
        <Field label="Phone"><input name="phone" className={inputClass} /></Field>
      </div>
      <SubmitButton pendingText="Creating…" className={hasCredentials ? buttonSecondaryClass : buttonClass}>
        Create employee
      </SubmitButton>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">{label}</label>
      {children}
    </div>
  );
}
