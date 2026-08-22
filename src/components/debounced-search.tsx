"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { inputClass } from "@/components/ui";

export function DebouncedSearch({ placeholder }: { placeholder: string }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const current = params.get("q") ?? "";
    if (value === current) return;
    timer.current = setTimeout(() => {
      startTransition(() => {
        router.replace(value ? `${pathname}?q=${encodeURIComponent(value)}` : pathname);
      });
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      aria-label="Search employees"
      className={`${inputClass} max-w-sm ${pending ? "opacity-60" : ""}`}
    />
  );
}
