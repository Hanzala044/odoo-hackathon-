"use client";

import { useFormStatus } from "react-dom";
import { buttonClass } from "./ui";

export function SubmitButton({
  children,
  pendingText = "Saving…",
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex cursor-pointer items-center gap-2 disabled:cursor-not-allowed ${className ?? buttonClass}`}
    >
      {pending && (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 animate-spin fill-none stroke-current stroke-2">
          <circle cx="8" cy="8" r="6" opacity=".25" />
          <path d="M14 8a6 6 0 0 0-6-6" strokeLinecap="round" />
        </svg>
      )}
      {pending ? pendingText : children}
    </button>
  );
}

export function FormError({ error }: { error?: string | null }) {
  if (!error) return null;
  return <p className="rounded-md bg-critical-bg px-3 py-2 text-sm text-critical-text">{error}</p>;
}
