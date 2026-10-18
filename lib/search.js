// Builds the Mongo query behind /shop from URL search params.
// Free text is parsed first, so "orange half sleeve shirt under 2000" becomes
// colour=orange, sleeve=half, category=shirt, max=2000 with no AI involved.
import mongoose from "mongoose";
import { CATEGORIES, COLOR_FAMILIES, GENDERS, SLEEVES, SORTS } from "./taxonomy.js";
import { colorFamiliesOf } from "../scraper/normalize.js";
import { BRAND_BY_SLUG } from "./brands.js";

export const PAGE_SIZE = 36;

const STOPWORDS = /\b(for|the|a|an|in|of|with|and|or|er|jonno|moddhe|takar|taka|tk|show|me|find|want|need|i|some)\b/g;

const list = (v) => (Array.isArray(v) ? v : String(v || "").split(",")).map((s) => s.trim()).filter(Boolean);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function wordRe(w) {
  return new RegExp(`(^|[^a-z0-9])${escapeRe(w)}($|[^a-z0-9])`, "i");
}

// Pull filters out of free text; whatever is left is used as a text search.
export function parseQuery(q) {
  let rest = ` ${String(q || "").toLowerCase()} `;
  const out = {};

  const price = rest.match(/(under|below|within|less than|max|<)\s*(tk|৳|bdt)?\s*(\d{3,6})/);
  if (price) {
    out.max = Number(price[3]);
    rest = rest.replace(price[0], " ");
  }
  // Banglish: "2000 takar moddhe" / "2000 tk er niche"
  const bnPrice = rest.match(/(\d{3,6})\s*(tk|taka|takar|৳)?\s*(er\s+)?(moddhe|modhe|niche|nice)/);
  if (!out.max && bnPrice) {
    out.max = Number(bnPrice[1]);
    rest = rest.replace(bnPrice[0], " ");
  }
  const above = rest.match(/(over|above|more than|min|>)\s*(tk|৳|bdt)?\s*(\d{3,6})/);
  if (above) {
    out.min = Number(above[3]);
    rest = rest.replace(above[0], " ");
  }

  const sleeve = rest.match(/\b(half|short|full|long)[\s-]*sleeves?\b|\bsleeveless\b/);
  if (sleeve) {
    out.sleeve = sleeve[0].includes("less") ? "sleeveless" : /half|short/.test(sleeve[0]) ? "half" : "full";
    rest = rest.replace(sleeve[0], " ");
  }

  const genderWords = { men: ["men", "mens", "men's", "male", "gents", "boy friend"], women: ["women", "womens", "women's", "ladies", "female"], kids: ["kids", "kid", "boys", "girls", "baby", "children"] };
  for (const [g, words] of Object.entries(genderWords)) {
    const w = words.find((x) => wordRe(x).test(rest));
    if (w) {
      out.gender = g;
      rest = rest.replace(wordRe(w), " ");
      break;
    }
  }

  for (const cat of CATEGORIES) {
    const w = cat.words.find((x) => wordRe(x).test(rest) || wordRe(`${x}s`).test(rest));
    if (w) {
      out.category = cat.value;
      rest = rest.replace(wordRe(`${w}s`), " ").replace(wordRe(w), " ");
      break;
    }
  }

  const colors = colorFamiliesOf(rest).filter((c) => c !== "multi");
  if (colors.length) {
    out.colors = colors;
    for (const fam of COLOR_FAMILIES.filter((f) => colors.includes(f.value))) {
      for (const w of [...fam.words].sort((a, b) => b.length - a.length)) rest = rest.replace(wordRe(w), " ");
    }
  }

  const brand = Object.values(BRAND_BY_SLUG).find((b) => wordRe(b.name.toLowerCase()).test(rest));
  if (brand) {
    out.brands = [brand.slug];
    rest = rest.replace(wordRe(brand.name.toLowerCase()), " ");
  }

  out.text = rest.replace(STOPWORDS, " ").replace(/\s+/g, " ").trim();
  return out;
}

export function readFilters(sp = {}) {
  const valid = (listDef, v) => (listDef.some((x) => x.value === v) ? v : null);
  return {
    q: String(sp.q || "").slice(0, 120),
    gender: valid(GENDERS, sp.gender),
    category: valid(CATEGORIES, sp.category),
    sleeve: valid(SLEEVES, sp.sleeve),
    colors: list(sp.color).filter((c) => COLOR_FAMILIES.some((f) => f.value === c)),
    sizes: list(sp.size).slice(0, 10),
    brands: list(sp.brand).filter((b) => BRAND_BY_SLUG[b]),
    min: num(sp.min),
    max: num(sp.max),
    sort: valid(SORTS, sp.sort) || (sp.q ? "relevance" : "newest"),
    includeOutOfStock: sp.stock === "all",
    page: Math.max(1, Math.min(200, parseInt(sp.page, 10) || 1)),
  };
}

// Explicit filters win over anything guessed from the text.
export function effectiveFilters(f) {
  const parsed = f.q ? parseQuery(f.q) : {};
  return {
    ...f,
    gender: f.gender || parsed.gender || null,
    category: f.category || parsed.category || null,
    sleeve: f.sleeve || parsed.sleeve || null,
    colors: f.colors.length ? f.colors : parsed.colors || [],
    brands: f.brands.length ? f.brands : parsed.brands || [],
    min: f.min ?? parsed.min ?? null,
    max: f.max ?? parsed.max ?? null,
    text: parsed.text || "",
    guessed: parsed,
  };
}

export function buildMongoQuery(f) {
  const query = { active: true };
  if (!f.includeOutOfStock) query.inStock = true;
  if (f.gender) query.gender = f.gender;
  if (f.category) query.category = f.category;
  if (f.sleeve) query.sleeve = f.sleeve;
  if (f.colors.length) query.colors = { $in: f.colors };
  if (f.sizes.length) query.sizes = { $in: f.sizes };
  if (f.brands.length) query.brand = { $in: f.brands };
  if (f.min || f.max) {
    query.price = {};
    if (f.min) query.price.$gte = f.min;
    if (f.max) query.price.$lte = f.max;
  }
  if (f.text) query.$text = { $search: f.text };
  return query;
}

export function sortFor(f) {
  switch (f.sort) {
    case "price-asc":
      return { price: 1, _id: 1 };
    case "price-desc":
      return { price: -1, _id: 1 };
    case "relevance":
      return f.text ? { score: { $meta: "textScore" }, firstSeenAt: -1 } : { firstSeenAt: -1, _id: -1 };
    default:
      return { firstSeenAt: -1, _id: -1 };
  }
}

export const CARD_FIELDS = "brand title image price compareAtPrice inStock colors sizes lastCheckedAt category";

async function runSearch(Product, f) {
  const query = buildMongoQuery(f);
  const projection = f.text ? { score: { $meta: "textScore" } } : {};
  const [items, total] = await Promise.all([
    Product.find(query, projection)
      .select(CARD_FIELDS)
      .sort(sortFor(f))
      .skip((f.page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Product.countDocuments(query),
  ]);
  return { items, total };
}

export async function searchProducts(Product, sp) {
  let f = effectiveFilters(readFilters(sp));
  let { items, total } = await runSearch(Product, f);
  let droppedText = null;
  // Leftover words like "eid" or "nice" often match nothing; if the
  // understood filters alone still find products, show those instead.
  if (!total && f.text) {
    const loose = { ...f, text: "" };
    const retry = await runSearch(Product, loose);
    if (retry.total) {
      droppedText = f.text;
      f = loose;
      ({ items, total } = retry);
    }
  }
  return { filters: f, droppedText, items: items.map(serialize), total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function serialize(p) {
  return {
    ...p,
    _id: String(p._id),
    lastCheckedAt: p.lastCheckedAt ? new Date(p.lastCheckedAt).toISOString() : null,
    firstSeenAt: p.firstSeenAt ? new Date(p.firstSeenAt).toISOString() : null,
    priceHistory: (p.priceHistory || []).map((h) => ({ price: h.price, at: new Date(h.at).toISOString() })),
    createdAt: undefined,
    updatedAt: undefined,
  };
}

export function isObjectId(id) {
  return mongoose.isValidObjectId(id) && String(id).length === 24;
}
