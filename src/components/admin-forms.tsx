"use client";

import { useActionState, useState } from "react";
import { adminUpdateProfileAction, updatePayrollAction } from "@/app/actions/profile";
import { SubmitButton, FormError, FormSuccess } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function AdminProfileForm({ userId, profile }: { userId: string; profile: any }) {
  const [state, action] = useActionState(adminUpdateProfileAction, null);
  const [preview, setPreview] = useState<string | null>(null);
  const dobVal = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "";
  const dojVal = profile.dateOfJoining ? new Date(profile.dateOfJoining).toISOString().slice(0, 10) : "";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />
      <FormError error={state?.error} />
      {state?.success && <FormSuccess message={state.success} />}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-border bg-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="preview" className="h-full w-full object-cover" /> : profile.profilePic ? <img src={profile.profilePic} alt="avatar" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-muted">No photo</div>}
        </div>
        <label className="cursor-pointer rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:bg-bg">
          Upload photo
          <input type="file" name="profilePic" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              if (f.size > 4*1024*1024) { alert("Must be under 4MB"); e.target.value=""; return;}
              setPreview(URL.createObjectURL(f));
            } else setPreview(null);
          }} />
        </label>
      </div>

      <h3 className="pt-2 text-sm font-semibold">Employment</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Job title</label><input name="jobTitle" defaultValue={profile.jobTitle ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Department</label><input name="department" defaultValue={profile.department ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Manager</label><input name="manager" defaultValue={profile.manager ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Location</label><input name="location" defaultValue={profile.location ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Emp Code</label><input name="empCode" defaultValue={profile.empCode ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Date of Joining</label><input name="dateOfJoining" type="date" defaultValue={dojVal} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Monthly Wage</label><input name="monthlyWage" type="number" min="0" defaultValue={profile.monthlyWage ?? 50000} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Working days/week</label><input name="workingDaysPerWeek" type="number" min="1" max="7" defaultValue={profile.workingDaysPerWeek ?? 5} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Break hrs</label><input name="breakHours" type="number" step="0.1" min="0" defaultValue={profile.breakHours ?? 1} className={inputClass} /></div>
      </div>

      <h3 className="pt-2 text-sm font-semibold">Contact & Private</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Phone</label><input name="phone" defaultValue={profile.phone ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Address</label><input name="address" defaultValue={profile.address ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Personal Email</label><input name="personalEmail" defaultValue={profile.personalEmail ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Date of Birth</label><input name="dateOfBirth" type="date" defaultValue={dobVal} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Nationality</label><input name="nationality" defaultValue={profile.nationality ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Gender</label><select name="gender" defaultValue={profile.gender ?? ""} className={inputClass}><option value="">—</option><option>Male</option><option>Female</option><option>Other</option></select></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Marital Status</label><select name="maritalStatus" defaultValue={profile.maritalStatus ?? ""} className={inputClass}><option value="">—</option><option>Single</option><option>Married</option><option>Other</option></select></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Bank Name</label><input name="bankName" defaultValue={profile.bankName ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Bank Account</label><input name="bankAccount" defaultValue={profile.bankAccount ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">IFSC</label><input name="ifscCode" defaultValue={profile.ifscCode ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">PAN</label><input name="panNo" defaultValue={profile.panNo ?? ""} className={inputClass} /></div>
        <div><label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">UAN</label><input name="uanNo" defaultValue={profile.uanNo ?? ""} className={inputClass} /></div>
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
      {state?.success && <FormSuccess message={state.success} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="salaryBase" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Base salary ($)</label>
          <input id="salaryBase" name="salaryBase" type="number" step="0.01" min="0" defaultValue={salaryBase} className={inputClass} />
        </div>
        <div>
          <label htmlFor="salaryBonus" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Bonus ($)</label>
          <input id="salaryBonus" name="salaryBonus" type="number" step="0.01" min="0" defaultValue={salaryBonus} className={inputClass} />
        </div>
      </div>
      <SubmitButton pendingText="Saving…">Update salary</SubmitButton>
    </form>
  );
}
