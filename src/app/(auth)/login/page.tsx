import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Dayflow account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Register
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
