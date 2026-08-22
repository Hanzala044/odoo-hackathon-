"use client";

import { logoutAction } from "@/app/actions/auth";
import { useFormStatus } from "react-dom";

function Inner() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="cursor-pointer rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-bg disabled:opacity-50 transition-colors cursor-pointer"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Inner />
    </form>
  );
}
