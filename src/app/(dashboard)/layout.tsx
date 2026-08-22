import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { RealtimeRefresher } from "@/components/realtime-refresher";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.id }, include: { company: true, profile: true } });
  if (user?.mustChangePassword) redirect("/change-password");
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const att = await prisma.attendance.findUnique({ where: { userId_date: { userId: session.id, date: todayUtc } } });
  const isCheckedIn = !!att?.checkIn && !att?.checkOut;
  const isOnBreak = !!att?.breakStart && isCheckedIn;
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        companyName={user?.company?.name}
        companyLogo={user?.company?.logo ?? null}
        email={session.email}
        userName={user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : session.email}
        profilePic={user?.profile?.profilePic ?? null}
        isCheckedIn={isCheckedIn}
        isOnBreak={isOnBreak}
        checkedInAt={att?.checkIn ? new Date(att.checkIn).toISOString() : undefined}
        breakStartAt={att?.breakStart ? new Date(att.breakStart).toISOString() : null}
        breaks={Array.isArray(att?.breaks) ? (att!.breaks as any) : []}
        isAdmin={isAdmin(session.role)}
      />
      <div className="lg:pl-[272px]">
        <RealtimeRefresher />
        <main className="mx-auto w-full max-w-[1160px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
