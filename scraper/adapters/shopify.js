// Shopify stores publish their public catalogue at /products.json.
import { fetchJson } from "../http.js";

const PAGE_SIZE = 250; // Shopify's maximum
const MAX_PAGES = 60;

function optionValues(product, names) {
  const opt = (product.options || []).find((o) => names.includes(String(o.name).toLowerCase()));
  return opt ? { position: opt.position, values: opt.values || [] } : null;
}

function sizedImage(src, width = 600) {
  if (!src) return null;
  return `${src}${src.includes("?") ? "&" : "?"}width=${width}`;
}

export async function fetchShopify(brand) {
  const out = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data } = await fetchJson(`${brand.baseUrl}/products.json?limit=${PAGE_SIZE}&page=${page}`);
    const products = data.products || [];
    if (!products.length) break;

    for (const p of products) {
      const variants = p.variants || [];
      const available = variants.filter((v) => v.available);
      const priced = (available.length ? available : variants).map((v) => Number(v.price)).filter((n) => n > 0);
      if (!priced.length) continue;
      const price = Math.min(...priced);
      const compare = Math.max(0, ...variants.map((v) => Number(v.compare_at_price) || 0));

      const sizeOpt = optionValues(p, ["size", "sizes"]);
      const colorOpt = optionValues(p, ["color", "colour", "colors"]);
      const sizes = sizeOpt
        ? [...new Set(available.map((v) => v[`option${sizeOpt.position}`]).filter(Boolean))]
        : [];

      out.push({
        sourceId: String(p.id),
        url: `${brand.baseUrl}/products/${p.handle}`,
        rawTitle: p.title,
        image: sizedImage(p.images?.[0]?.src),
        price,
        compareAtPrice: compare > price ? compare : null,
        inStock: available.length > 0,
        raw: {
          title: p.title,
          type: p.product_type,
          tags: p.tags || [],
          colorNames: colorOpt?.values || [],
          sizes,
        },
      });
    }
    if (products.length < PAGE_SIZE) break;
  }
  return out;
}
