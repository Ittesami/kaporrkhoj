import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Keeps signed-out visitors out of the admin panel and bounces signed-in
// admins past the login form. API routes re-check the session themselves.
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  let session = null;
  try {
    session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  } catch {
    // AUTH_SECRET missing: treat as signed out; the login API will report the real problem.
  }

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
