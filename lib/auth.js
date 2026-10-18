import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./session.js";

// Compare via fixed-length digests so neither length nor content leaks via timing.
function safeEqual(a, b) {
  const da = createHash("sha256").update(String(a)).digest();
  const db = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(da, db);
}

export function checkAdminCredentials(username, password) {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env.local.");
  }
  // Evaluate both so response time doesn't reveal which one was wrong.
  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}

export async function getAdminSession() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

// Simple in-memory limiter; enough to slow down password guessing on one instance.
const hits = new Map();
export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length <= limit;
}
