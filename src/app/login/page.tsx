"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@dayflow.test");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid credentials");
    else router.push("/employees");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4">
      <form onSubmit={handle} className="w-full max-w-sm bg-white border border-gray-300 p-6 space-y-4">
        <h1 className="text-lg font-semibold">Sign in to Dayflow</h1>
        <p className="text-xs text-gray-500">After login the user must land on Employees page</p>
        <div>
          <label className="text-xs">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-xs">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm mt-1" />
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <button disabled={loading} className="w-full bg-[#7c6cff] text-white py-2 text-sm hover:opacity-90">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="text-xs text-center">
          No account? <Link href="/register" className="text-[#7c6cff] underline">Register</Link>
        </div>
        <div className="text-[11px] text-gray-400 border-t pt-3">
          Seeded: admin@dayflow.test / john.doe@dayflow.test — password: password123
        </div>
      </form>
    </div>
  );
}
