// WooCommerce stores expose a public, read-only Store API at /wp-json/wc/store/v1.
import { fetchJson } from "../http.js";

const PAGE_SIZE = 100; // Store API maximum
const MAX_PAGES = 100;

// Pick a ~600px image from the srcset rather than the 2000px original.
function pickImage(img) {
  if (!img) return null;
  const candidates = String(img.srcset || "")
    .split(",")
    .map((s) => s.trim().split(/\s+/))
    .map(([url, w]) => ({ url, w: parseInt(w, 10) }))
    .filter((c) => c.url && c.w)
    .sort((a, b) => a.w - b.w);
  return candidates.find((c) => c.w >= 500)?.url || img.src || img.thumbnail || null;
}

function money(value, minorUnit) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n / 10 ** (minorUnit ?? 2);
}

function attributeTerms(product, names) {
  const attr = (product.attributes || []).find((a) => names.includes(String(a.name).toLowerCase()));
  return attr ? attr.terms.map((t) => t.name) : [];
}

export async function fetchWooCommerce(brand) {
  const out = [];
  let totalPages = 1;
  for (let page = 1; page <= Math.min(totalPages, MAX_PAGES); page++) {
    const { data, headers } = await fetchJson(
      `${brand.baseUrl}/wp-json/wc/store/v1/products?per_page=${PAGE_SIZE}&page=${page}`
    );
    totalPages = Number(headers.get("x-wp-totalpages")) || totalPages;
    if (!Array.isArray(data) || !data.length) break;

    for (const p of data) {
      const minor = p.prices?.currency_minor_unit;
      const price = money(p.prices?.price, minor);
      if (!price) continue;
      const regular = money(p.prices?.regular_price, minor);

      out.push({
        sourceId: String(p.id),
        url: p.permalink,
        rawTitle: p.name,
        image: pickImage(p.images?.[0]),
        price,
        compareAtPrice: regular && regular > price ? regular : null,
        inStock: Boolean(p.is_in_stock),
        raw: {
          title: p.name,
          type: (p.categories || []).map((c) => c.name).join(" | "),
          tags: [...(p.tags || []).map((t) => t.name), ...(p.categories || []).map((c) => c.name)],
          colorNames: attributeTerms(p, ["color", "colour", "colors"]),
          sizes: attributeTerms(p, ["size", "sizes"]),
        },
      });
    }
  }
  return out;
}
