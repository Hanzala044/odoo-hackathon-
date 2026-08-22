import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(isAdmin(session.role) ? "/admin/dashboard" : "/dashboard");
}
