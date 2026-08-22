import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  deserializeSessionToken,
} from "@/lib/session";
import { isAdmin } from "@/lib/roles";

const PUBLIC_PATHS = ["/login", "/register", "/change-password"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await deserializeSessionToken(token) : null;

  // Signed-in users skip login/register
  if (session && (pathname === "/login" || pathname === "/register")) {
    const target = isAdmin(session.role) ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Unauthenticated users hitting protected areas go to /login
  if (!session && !isPublic(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session) {
    // mustChangePassword: force everyone to /change-password until resolved
    if (session.mustChangePassword && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }

    // Admins have separate dashboard: /dashboard -> /admin/dashboard
    if (isAdmin(session.role) && pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Non-admins cannot reach /admin/**
    if (pathname.startsWith("/admin") && !isAdmin(session.role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except static assets and Next internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
