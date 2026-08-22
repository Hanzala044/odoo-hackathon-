import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6" suppressHydrationWarning>
      <div className="w-full max-w-md" suppressHydrationWarning>
        <Link href="/" className="mb-8 flex flex-col items-center gap-1">
          <span className="text-3xl font-bold tracking-tight">Dayflow</span>
          <span className="text-sm italic text-muted">Every workday, perfectly aligned.</span>
        </Link>
        <div className="rounded-[10px] border border-border bg-surface p-6 shadow-rest" suppressHydrationWarning>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mb-5 mt-1 text-sm text-muted">{subtitle}</p>
          {children}
          {footer ? <p className="mt-5 text-center text-sm text-muted">{footer}</p> : null}
        </div>
      </div>
    </main>
  );
}
