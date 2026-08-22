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
  footer: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex flex-col items-center gap-1">
          <span className="text-3xl font-bold tracking-tight">Dayflow</span>
          <span className="text-sm italic text-slate-500">Every workday, perfectly aligned.</span>
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mb-5 mt-1 text-sm text-slate-500">{subtitle}</p>
          {children}
          <p className="mt-5 text-center text-sm text-slate-500">{footer}</p>
        </div>
      </div>
    </main>
  );
}
