"use client";
import { useActionState } from "react";
import { changePasswordAction } from "@/app/actions/auth";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass } from "@/components/ui";
export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, null);
  return (
    <form action={action} className="space-y-4">
      <FormError error={state?.error} />
      <div><label className="mb-1 block text-sm font-medium">Current password</label><input name="currentPassword" type="password" required className={inputClass} /></div>
      <div><label className="mb-1 block text-sm font-medium">New password</label><input name="newPassword" type="password" required minLength={8} className={inputClass} /></div>
      <div><label className="mb-1 block text-sm font-medium">Confirm new password</label><input name="confirmPassword" type="password" required minLength={8} className={inputClass} /></div>
      <SubmitButton className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white">Update password</SubmitButton>
    </form>
  );
}
