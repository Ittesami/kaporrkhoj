// Refreshes every brand's catalogue. Run by scripts/scrape.js (locally or on
// the 12-hourly GitHub Actions schedule).
import { BRANDS, SCRAPING_ENABLED } from "../lib/brands.js";
import { Product, ScrapeRun } from "../lib/models.js";
import { fetchShopify } from "./adapters/shopify.js";
import { fetchWooCommerce } from "./adapters/woocommerce.js";
import { normalizeProduct } from "./normalize.js";

const ADAPTERS = { shopify: fetchShopify, woocommerce: fetchWooCommerce };

async function scrapeBrand(brand, log) {
  const started = Date.now();
  const result = { brand: brand.slug, ok: false, fetched: 0, created: 0, updated: 0, deactivated: 0 };
  try {
    const items = await ADAPTERS[brand.platform](brand);
    result.fetched = items.length;
    if (!items.length) throw new Error("No products returned; leaving the existing catalogue untouched.");

    const now = new Date();
    const existing = new Map(
      (await Product.find({ brand: brand.slug }, { sourceId: 1, price: 1 }).lean()).map((p) => [p.sourceId, p])
    );

    // Normalise first; non-fashion items (bed sheets, gift cards…) are dropped
    // here and so get deactivated below if they were stored before.
    const kept = items
      .map((item) => ({ item, norm: normalizeProduct(item.raw, brand.name) }))
      .filter(({ norm }) => !norm.skip);
    result.skipped = items.length - kept.length;

    const ops = kept.map(({ item, norm }) => {
      if (!norm.gender && brand.defaultGender) norm.gender = brand.defaultGender;
      const prev = existing.get(item.sourceId);
      const update = {
        $set: {
          url: item.url,
          rawTitle: item.rawTitle,
          title: norm.title,
          image: item.image,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          inStock: item.inStock,
          gender: norm.gender,
          category: norm.category,
          sleeve: norm.sleeve,
          colors: norm.colors,
          colorNames: norm.colorNames,
          sizes: norm.sizes,
          tags: (item.raw.tags || []).slice(0, 30),
          active: true,
          lastCheckedAt: now,
        },
        $setOnInsert: { firstSeenAt: now },
      };
      if (!prev || prev.price !== item.price) {
        update.$push = { priceHistory: { $each: [{ price: item.price, at: now }], $slice: -60 } };
      }
      if (prev) result.updated++;
      else result.created++;
      return { updateOne: { filter: { brand: brand.slug, sourceId: item.sourceId }, update, upsert: true } };
    });

    for (let i = 0; i < ops.length; i += 500) {
      await Product.bulkWrite(ops.slice(i, i + 500), { ordered: false });
    }

    const seen = kept.map(({ item }) => item.sourceId);
    const gone = await Product.updateMany(
      { brand: brand.slug, active: true, sourceId: { $nin: seen } },
      { $set: { active: false, lastCheckedAt: now } }
    );
    result.deactivated = gone.modifiedCount;
    result.ok = true;
  } catch (err) {
    result.error = err.message;
  }
  result.ms = Date.now() - started;
  log(
    result.ok
      ? `✔ ${brand.name}: ${result.fetched} products (${result.created} new, ${result.skipped} skipped, ${result.deactivated} gone) in ${Math.round(result.ms / 1000)}s`
      : `✘ ${brand.name}: ${result.error}`
  );
  return result;
}

export async function runScrape({ only, trigger = "manual", log = console.log } = {}) {
  if (!SCRAPING_ENABLED) {
    log("Scraping is paused (SCRAPING_ENABLED = false in lib/brands.js). Nothing fetched.");
    return [];
  }
  const brands = only ? BRANDS.filter((b) => only.includes(b.slug)) : BRANDS;
  const run = await ScrapeRun.create({ startedAt: new Date(), trigger, brands: [] });
  // Brands run in parallel (different hosts); requests to one host stay sequential and spaced out.
  const results = await Promise.all(brands.map((b) => scrapeBrand(b, log)));
  run.brands = results;
  run.finishedAt = new Date();
  await run.save();
  return results;
}
