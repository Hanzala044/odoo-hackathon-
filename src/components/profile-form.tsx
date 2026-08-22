"use client";

import { useActionState } from "react";
import { updateOwnProfileAction } from "@/app/actions/profile";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function OwnProfileForm({ phone, address }: { phone?: string | null; address?: string | null }) {
  const [state, action] = useActionState(updateOwnProfileAction, null);
  return (
    <form action={action} className="space-y-4">
      <FormError error={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2">
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
