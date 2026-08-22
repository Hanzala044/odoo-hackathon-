"use client";

import { useActionState } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <FormError error={state?.error} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required placeholder="you@dayflow.test" className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required className={inputClass} />
      </div>
      <SubmitButton pendingText="Signing in…" className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
        Sign in
      </SubmitButton>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, null);
  return (
    <form action={action} className="space-y-4">
      <FormError error={state?.error} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium">First name</label>
          <input id="firstName" name="firstName" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium">Last name</label>
          <input id="lastName" name="lastName" required className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="employeeId" className="mb-1 block text-sm font-medium">Employee ID</label>
        <input id="employeeId" name="employeeId" required placeholder="e.g. EMP-104" className={inputClass} />
      </div>
      <div>
        <label htmlFor="reg-email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="reg-email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="reg-password" className="mb-1 block text-sm font-medium">Password</label>
        <input id="reg-password" name="password" type="password" required minLength={8} className={inputClass} />
      </div>
      <SubmitButton pendingText="Creating account…" className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
        Create account
      </SubmitButton>
    </form>
  );
}
