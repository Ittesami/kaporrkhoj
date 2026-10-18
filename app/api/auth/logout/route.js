import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request) {
  const res = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
