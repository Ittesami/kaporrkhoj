// Turns a brand's raw product facts into our taxonomy (lib/taxonomy.js).
// Adapters pass in plain text fields; nothing here touches the network.
import { CATEGORIES, COLOR_FAMILIES, SIZE_ORDER, SKIP_WORDS } from "../lib/taxonomy.js";

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(str = "") {
  return String(str)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-word, case-insensitive phrase test ("tan" must not match "standard"),
// allowing a plural ("leggings", "joggers").
const reCache = new Map();
function hasWord(text, word) {
  let re = reCache.get(word);
  if (!re) {
    re = new RegExp(`(^|[^a-z0-9])${escapeRe(word.toLowerCase())}(e?s)?($|[^a-z0-9])`, "i");
    reCache.set(word, re);
  }
  return re.test(text);
}

// "CLASSIC GREEN POLO BY RICHMAN" -> "Classic Green Polo"
export function cleanTitle(raw, brandName) {
  let t = decodeEntities(raw).replace(/\s+/g, " ").trim();
  const b = escapeRe(brandName);
  t = t
    .replace(new RegExp(`\\s*(by|from|-|\\|)\\s*${b}\\s*$`, "i"), "")
    .replace(new RegExp(`^${b}\\s*(-|:|\\|)?\\s*`, "i"), "")
    .trim();

  const letters = t.replace(/[^a-z]/gi, "");
  const upper = t.replace(/[^A-Z]/g, "");
  if (letters.length && upper.length / letters.length > 0.7) {
    t = t.toLowerCase().replace(/(^|[\s\-(/])([a-z])/g, (_, p, c) => p + c.toUpperCase());
    t = t.replace(/\b(Ss|Ls|T-shirt)\b/g, (m) => (m === "T-shirt" ? "T-Shirt" : m.toUpperCase()));
  }
  t = t.replace(/\bmens\b/gi, "Men's").replace(/\bwomens\b/gi, "Women's");
  return t || decodeEntities(raw).trim();
}

const KIDS_WORDS = ["kids", "kid", "boys", "boy", "girls", "girl", "baby", "babies", "infant", "junior", "new born", "newborn", "teen", "toddler", "children", "child"];
const WOMEN_WORDS = ["women", "womens", "women's", "woman", "ladies", "lady", "female"];
const MEN_WORDS = ["men", "mens", "men's", "man", "gents", "gent", "male"];

function detectGender(primary, secondary) {
  for (const text of [primary, secondary]) {
    if (KIDS_WORDS.some((w) => hasWord(text, w))) return "kids";
    if (WOMEN_WORDS.some((w) => hasWord(text, w))) return "women";
    if (MEN_WORDS.some((w) => hasWord(text, w))) return "men";
  }
  return null;
}

function detectCategory(primary, secondary) {
  for (const text of [primary, secondary]) {
    for (const cat of CATEGORIES) {
      if (cat.words.some((w) => hasWord(text, w))) return cat.value;
    }
  }
  return "other";
}

function detectSleeve(text, category) {
  if (/sleeveless/i.test(text)) return "sleeveless";
  if (/\b(half|short)[\s-]*sleeve|\bs\/s\b/i.test(text)) return "half";
  if (/\b(long|full)[\s-]*sleeve|\bl\/s\b|\bls\s+shirt\b/i.test(text)) return "full";
  if (category === "polo" || category === "t-shirt") return "half";
  if (category === "panjabi" || category === "kabli") return "full";
  return null;
}

// Longest colour phrase first so "navy blue" beats "blue".
const COLOR_WORDS = COLOR_FAMILIES.flatMap((f) => f.words.map((w) => ({ w, family: f.value }))).sort(
  (a, b) => b.w.length - a.w.length
);

export function colorFamiliesOf(text) {
  const found = new Set();
  let rest = ` ${String(text).toLowerCase()} `;
  for (const { w, family } of COLOR_WORDS) {
    if (hasWord(rest, w)) {
      found.add(family);
      rest = rest.replace(new RegExp(escapeRe(w), "gi"), " ");
    }
  }
  return [...found];
}

export function normalizeSize(raw) {
  let s = decodeEntities(raw).trim().toUpperCase().replace(/\s+/g, " ");
  const map = { SMALL: "S", MEDIUM: "M", LARGE: "L", "EXTRA LARGE": "XL", "EXTRA-LARGE": "XL", "2XL": "XXL", XXXL: "3XL", XXXXL: "4XL", "FREE SIZE": "Free size", FREESIZE: "Free size" };
  s = map[s] || s;
  return s;
}

export function sortSizes(sizes) {
  const rank = (s) => {
    const i = SIZE_ORDER.indexOf(s);
    if (i >= 0) return i;
    const n = parseFloat(s);
    return Number.isFinite(n) ? 100 + n : 1000;
  };
  return [...new Set(sizes)].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

/**
 * @param {object} raw
 * @param {string} raw.title          product title as the brand writes it
 * @param {string} [raw.type]         product type / main category text
 * @param {string[]} [raw.tags]       tags and category names
 * @param {string[]} [raw.colorNames] explicit colour option values, if any
 * @param {string[]} [raw.sizes]      sizes currently offered
 * @param {string} brandName
 */
export function normalizeProduct(raw, brandName) {
  const title = cleanTitle(raw.title, brandName);
  const type = decodeEntities(raw.type || "");
  const tagText = (raw.tags || []).map(decodeEntities).join(" | ");
  const primary = `${title} | ${type}`;
  if (SKIP_WORDS.some((w) => hasWord(primary, w))) return { skip: true, title };

  const category = detectCategory(primary, tagText);
  const gender = detectGender(primary, tagText);
  const sleeve = detectSleeve(`${title} | ${type} | ${tagText}`, category);

  const colorNames = [...new Set((raw.colorNames || []).map((c) => decodeEntities(c).trim()).filter(Boolean))];
  let colors = colorFamiliesOf([...colorNames, title].join(" | "));
  if (!colors.length) colors = colorFamiliesOf(tagText);

  return {
    title,
    category,
    gender,
    sleeve,
    colorNames,
    colors,
    sizes: sortSizes((raw.sizes || []).map(normalizeSize).filter(Boolean)),
  };
}
