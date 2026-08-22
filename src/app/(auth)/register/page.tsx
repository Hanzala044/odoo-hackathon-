import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join your team on Dayflow"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
