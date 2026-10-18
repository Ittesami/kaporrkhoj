import { NextResponse } from "next/server";
import { checkAdminCredentials, rateLimit } from "@/lib/auth";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/session";
import { clientIp } from "@/lib/tracking";

export const dynamic = "force-dynamic";

export async function POST(request) {
  // 8 attempts per 15 minutes per IP.
  if (!rateLimit(`login:${clientIp(request)}`, { limit: 8, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many login attempts. Try again in a few minutes." }, { status: 429 });
  }

  const { username, password } = await request.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  try {
    if (!checkAdminCredentials(username, password)) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await createSessionToken(username), sessionCookieOptions);
    return res;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
