// Polite HTTP for the scraper: identifies itself, waits between requests to
// the same site, retries briefly on network errors / 5xx, and gives up on
// 403/429 (a site telling us to back off) instead of working around it.

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://kaporkhoj.com";
const contact = process.env.SCRAPER_CONTACT ? `; ${process.env.SCRAPER_CONTACT}` : "";
export const USER_AGENT = `KaporKhojBot/1.0 (+${site}/about${contact})`;

const DELAY_MS = Number(process.env.SCRAPER_DELAY_MS) || 2500;
const lastHit = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class BlockedError extends Error {}

export async function politeFetch(url, { retries = 2 } = {}) {
  const host = new URL(url).host;
  const wait = (lastHit.get(host) || 0) + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastHit.set(host, Date.now());

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });
    if (res.status === 403 || res.status === 429) {
      throw new BlockedError(`${host} answered ${res.status}; stopping this brand for this run.`);
    }
    if (res.status >= 500 && retries > 0) {
      await sleep(DELAY_MS * 2);
      return politeFetch(url, { retries: retries - 1 });
    }
    return res;
  } catch (err) {
    if (err instanceof BlockedError || retries <= 0) throw err;
    await sleep(DELAY_MS * 2);
    return politeFetch(url, { retries: retries - 1 });
  }
}

export async function fetchJson(url) {
  const res = await politeFetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const type = res.headers.get("content-type") || "";
  if (!type.includes("json")) throw new Error(`${url} did not return JSON (${type})`);
  return { data: await res.json(), headers: res.headers };
}
