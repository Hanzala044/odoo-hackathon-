import AuthShell from "@/components/auth-shell";
import { ChangePasswordForm } from "@/components/change-password-form";
export default function Page() {
  return <AuthShell title="Change password" subtitle="You must change the system-generated password"><ChangePasswordForm /></AuthShell>;
}
