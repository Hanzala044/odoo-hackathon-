"use client";
import { useActionState, useState } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-bg px-1.5 py-0.5 text-xs" aria-label="toggle password">
      {show ? "🙈" : "👁"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="space-y-4">
      <FormError error={state?.error} />
      <div>
        <label htmlFor="identifier" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Login Id/Email :-</label>
        <input id="identifier" name="identifier" required placeholder="e.g. OIJODO20250001 or email" className={inputClass} />
        <p className="mt-1 text-xs text-muted">Login ID format: [Company initials][First2+Last2][Year][0001]</p>
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Password :-</label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} required className={inputClass} />
          <EyeToggle show={show} onToggle={() => setShow((v) => !v)} />
        </div>
      </div>
      <SubmitButton pendingText="Signing in…" className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover">SIGN IN</SubmitButton>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, null);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  return (
    <form action={action} className="space-y-4">
      <FormError error={state?.error} />
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Company Name :-</label>
        <div className="flex gap-2">
          <input name="companyName" required className={inputClass + " flex-1"} placeholder="e.g. Odoo India" />
          <label className="flex cursor-pointer items-center rounded-md border border-border bg-bg px-3 text-sm text-muted">⬆ Upload Logo<input type="file" name="logo" accept="image/*" className="hidden" /></label>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Name :-</label>
        <input name="name" required placeholder="First and last name" className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Email :-</label>
        <input name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Phone :-</label>
        <input name="phone" className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Password :-</label>
        <div className="relative">
          <input name="password" type={show1 ? "text" : "password"} required minLength={8} className={inputClass} />
          <EyeToggle show={show1} onToggle={() => setShow1((v) => !v)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Confirm Password :-</label>
        <div className="relative">
          <input name="confirmPassword" type={show2 ? "text" : "password"} required minLength={8} className={inputClass} />
          <EyeToggle show={show2} onToggle={() => setShow2((v) => !v)} />
        </div>
      </div>
      <SubmitButton pendingText="Creating…" className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover">Sign Up</SubmitButton>
    </form>
  );
}
