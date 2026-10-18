import { createHash } from "node:crypto";

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch|headless|lighthouse/i;

export function isBot(ua = "") {
  return !ua || BOT_RE.test(ua);
}

export function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : request.headers.get("x-real-ip")) || "unknown";
}

// Salted with the secret and today's date: lets us count unique visitors per
// day without storing an IP, and can't be linked across days.
export function hashIp(ip) {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET || ""}|${day}|${ip}`)
    .digest("hex")
    .slice(0, 24);
}

export function deviceOf(ua = "") {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

// Tags the brand's analytics can see, so they know the visit came from us.
export function withUtm(url, product) {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "kaporkhoj");
    u.searchParams.set("utm_medium", "referral");
    u.searchParams.set("utm_campaign", product.category || "listing");
    return u.toString();
  } catch {
    return url;
  }
}
