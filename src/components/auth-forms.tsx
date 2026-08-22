"use client";
import { useActionState, useState } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-1.5 py-0.5 text-xs" aria-label="toggle password">
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
        <label htmlFor="identifier" className="mb-1 block text-sm font-medium">Login Id/Email :-</label>
        <input id="identifier" name="identifier" required placeholder="e.g. OIJODO20250001 or email" className={inputClass} />
        <p className="mt-1 text-xs text-slate-500">Login ID format: [Company initials][First2+Last2][Year][0001]</p>
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password :-</label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} required className={inputClass} />
          <EyeToggle show={show} onToggle={() => setShow((v) => !v)} />
        </div>
      </div>
      <SubmitButton pendingText="Signing in…" className="w-full rounded-lg bg-[#c147ff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#a93ae0]">SIGN IN</SubmitButton>
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
        <label className="mb-1 block text-sm font-medium">Company Name :-</label>
        <div className="flex gap-2">
          <input name="companyName" required className={inputClass + " flex-1"} placeholder="e.g. Odoo India" />
          <label className="flex cursor-pointer items-center rounded-lg border bg-slate-50 px-3 text-sm">⬆ Upload Logo<input type="file" name="logo" accept="image/*" className="hidden" /></label>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Name :-</label>
        <input name="name" required placeholder="First and last name" className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email :-</label>
        <input name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Phone :-</label>
        <input name="phone" className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Password :-</label>
        <div className="relative">
          <input name="password" type={show1 ? "text" : "password"} required minLength={8} className={inputClass} />
          <EyeToggle show={show1} onToggle={() => setShow1((v) => !v)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Confirm Password :-</label>
        <div className="relative">
          <input name="confirmPassword" type={show2 ? "text" : "password"} required minLength={8} className={inputClass} />
          <EyeToggle show={show2} onToggle={() => setShow2((v) => !v)} />
        </div>
      </div>
      <SubmitButton pendingText="Creating…" className="w-full rounded-lg bg-[#c147ff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#a93ae0]">Sign Up</SubmitButton>
    </form>
  );
}
