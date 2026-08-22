"use client";

import { useActionState, useState } from "react";
import { updateOwnProfileAction } from "@/app/actions/profile";
import { SubmitButton, FormError, FormSuccess } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function OwnProfileForm({ profile }: { profile: any }) {
  const [state, action] = useActionState(updateOwnProfileAction, null);
  const [preview, setPreview] = useState<string | null>(null);
  const dobVal = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "";

  return (
    <form action={action} className="space-y-4">
      <FormError error={state?.error} />
      {state?.success && <FormSuccess message={state.success} />}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-border bg-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="preview" className="h-full w-full object-cover" /> : profile.profilePic ? <img src={profile.profilePic} alt="avatar" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-muted">No photo</div>}
        </div>
        <label className="cursor-pointer rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:bg-bg">
          Upload photo
          <input
            type="file"
            name="profilePic"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (f.size > 4 * 1024 * 1024) { alert("Must be under 4MB"); e.target.value=""; return; }
                setPreview(URL.createObjectURL(f));
              } else setPreview(null);
            }}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Phone</label><input name="phone" defaultValue={profile.phone ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Address</label><input name="address" defaultValue={profile.address ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Personal Email</label><input name="personalEmail" type="email" defaultValue={profile.personalEmail ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Date of Birth</label><input name="dateOfBirth" type="date" defaultValue={dobVal} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Nationality</label><input name="nationality" defaultValue={profile.nationality ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Gender</label><select name="gender" defaultValue={profile.gender ?? ""} className={inputClass}><option value="">—</option><option>Male</option><option>Female</option><option>Other</option></select></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Marital Status</label><select name="maritalStatus" defaultValue={profile.maritalStatus ?? ""} className={inputClass}><option value="">—</option><option>Single</option><option>Married</option><option>Other</option></select></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Location</label><input name="location" defaultValue={profile.location ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Bank Name</label><input name="bankName" defaultValue={profile.bankName ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Account No.</label><input name="bankAccount" defaultValue={profile.bankAccount ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">IFSC</label><input name="ifscCode" defaultValue={profile.ifscCode ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">PAN</label><input name="panNo" defaultValue={profile.panNo ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">UAN</label><input name="uanNo" defaultValue={profile.uanNo ?? ""} className={inputClass} /></div>
      </div>
      <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
    </form>
  );
}
