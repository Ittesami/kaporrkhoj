import { brandName } from "./brands.js";

// Every product name on the site is shown as "Brand: Product".
export function displayName(p) {
  return `${brandName(p.brand)}: ${p.title}`;
}

export function taka(n) {
  if (n == null) return "";
  return `Tk ${Math.round(n).toLocaleString("en-IN")}`;
}

export function timeAgo(iso) {
  if (!iso) return "never";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export function goHref(id, from) {
  return `/go/${id}${from ? `?from=${encodeURIComponent(from)}` : ""}`;
}
