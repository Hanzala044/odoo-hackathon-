"use client";
import { useActionState, useState } from "react";
import { updateCompanyAction } from "@/app/actions/company";
import { SubmitButton, FormError } from "@/components/submit-button";
import { inputClass } from "@/components/ui";

export function CompanyLogoForm({ companyName, companyLogo }: { companyName: string; companyLogo?: string | null }) {
  const [state, action] = useActionState(updateCompanyAction, null);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={action} className="flex items-center gap-3 rounded-[10px] border border-border bg-surface p-3 shadow-rest">
      <FormError error={state?.error} />
      {state?.success && <p className="text-xs text-positive-text">{state.success}</p>}
      <div className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="h-10 w-10 rounded object-cover border border-border" />
        ) : companyLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={companyLogo} alt="logo" className="h-10 w-10 rounded object-contain border border-border bg-white p-0.5" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-bg text-xs text-muted">No logo</div>
        )}
        <div>
          <input name="companyName" defaultValue={companyName} placeholder="Company name" className={inputClass + " h-8 text-xs"} />
          <label className="mt-1 flex cursor-pointer items-center text-xs text-accent hover:underline">
            Change logo
            <input
              type="file"
              name="logo"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  if (f.size > 4 * 1024 * 1024) { alert("Logo must be under 4MB"); e.target.value=""; return; }
                  setPreview(URL.createObjectURL(f));
                } else setPreview(null);
              }}
            />
          </label>
        </div>
      </div>
      <SubmitButton pendingText="Saving…">Save</SubmitButton>
    </form>
  );
}
