"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", employeeId: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error || "Failed");
    else router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-gray-300 p-6 space-y-3">
        <h1 className="text-lg font-semibold">Create account</h1>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" required />
          <input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm" required />
        </div>
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" required />
        <input placeholder="Employee ID (e.g. EMP011)" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" required />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" required />
        {error && <div className="text-xs text-red-600">{error}</div>}
        <button disabled={loading} className="w-full bg-[#7c6cff] text-white py-2 text-sm">{loading ? "..." : "Register"}</button>
        <div className="text-xs text-center"><Link href="/login" className="text-[#7c6cff] underline">Back to login</Link></div>
      </form>
    </div>
  );
}
