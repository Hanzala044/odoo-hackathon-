import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[10px] border border-border bg-surface p-5 shadow-rest ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </Card>
  );
}

const badgeStyles: Record<string, string> = {
  PRESENT: "bg-positive-bg text-positive-text",
  APPROVED: "bg-positive-bg text-positive-text",
  ABSENT: "bg-critical-bg text-critical-text",
  REJECTED: "bg-critical-bg text-critical-text",
  HALF_DAY: "bg-attention-bg text-attention-text",
  PENDING: "bg-attention-bg text-attention-text",
  LEAVE: "bg-info-bg text-info-text",
  PAID: "bg-info-bg text-info-text",
  SICK: "bg-accent-soft text-accent",
  UNPAID: "bg-neutral-bg text-neutral-text",
};

export function Badge({ value }: { value: string }) {
  const color = badgeStyles[value] ?? "bg-neutral-bg text-neutral-text";
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${color}`}>
      {value.replace("_", " ")}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  message,
  action,
}: {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[10px] border border-dashed border-border bg-surface p-10 text-center">
      {icon && (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-bg text-muted">
          {icon}
        </div>
      )}
      <p className="text-sm text-muted">{message}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15";

export const buttonClass =
  "rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer";

export const buttonSecondaryClass =
  "rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer";

export const linkClass = "font-medium text-accent hover:underline";

export function Table({
  head,
  children,
  aligns,
}: {
  head: string[];
  children: ReactNode;
  aligns?: ("left" | "right" | "center")[];
}) {
  const alignCls = (a?: "left" | "right" | "center") =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";
  return (
    <div className="overflow-x-auto rounded-[10px] border border-border bg-surface shadow-rest">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {head.map((h, i) => (
              <th
                key={h}
                className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted ${alignCls(aligns?.[i])}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td className={`border-b border-border/60 px-4 py-3 transition-colors ${className}`}>
      {children ?? "—"}
    </td>
  );
}

export function Tr({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`hover:bg-bg ${className}`}>{children}</tr>;
}

function hashHue(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";
  const hue = hashHue(name);
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-base",
    lg: "h-20 w-20 text-2xl",
  };
  return (
    <span
      aria-hidden
      className={`flex shrink-0 select-none items-center justify-center rounded-full font-medium ${sizes[size]} ${className}`}
      style={{
        backgroundColor: `hsl(${hue} 32% 92%)`,
        color: `hsl(${hue} 35% 35%)`,
      }}
    >
      {initials}
    </span>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={`mb-4 inline-block text-sm ${linkClass}`}>
      ← {children}
    </Link>
  );
}

export function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function fmtTime(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

export function fmtRelative(d?: Date | string | null) {
  if (!d) return null;
  // Avoid hydration mismatch: on server, return static "just now" to match first client render before hydration
  if (typeof window === "undefined") return "just now";
  const diffMs = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  return null;
}

export function fmtMoney(n?: number | null) {
  return n == null ? "—" : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
