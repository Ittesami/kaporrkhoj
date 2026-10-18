import { Click, Product, ScrapeRun } from "./models.js";

export const RANGES = [1, 7, 30, 90];

export function sinceDays(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function getDashboard(days) {
  const since = sinceDays(days);
  const match = { $match: { at: { $gte: since } } };

  const [total, visitors, byBrand, byDay, topProducts, topPages, byDevice, recent, runs, catalogue] = await Promise.all([
    Click.countDocuments({ at: { $gte: since } }),
    // ipHash rotates daily, so unique (day, hash) pairs = daily unique visitors summed.
    Click.aggregate([match, { $group: { _id: { d: { $dateToString: { format: "%Y-%m-%d", date: "$at" } }, h: "$ipHash" } } }, { $count: "n" }]),
    Click.aggregate([match, { $group: { _id: "$brand", n: { $sum: 1 }, value: { $sum: "$price" } } }, { $sort: { n: -1 } }]),
    Click.aggregate([
      match,
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$at", timezone: "Asia/Dhaka" } }, n: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Click.aggregate([
      match,
      { $group: { _id: "$product", n: { $sum: 1 }, brand: { $first: "$brand" }, title: { $first: "$productTitle" }, price: { $last: "$price" } } },
      { $sort: { n: -1 } },
      { $limit: 15 },
    ]),
    Click.aggregate([
      match,
      { $group: { _id: { $arrayElemAt: [{ $split: ["$from", "&page="] }, 0] }, n: { $sum: 1 } } },
      { $sort: { n: -1 } },
      { $limit: 10 },
    ]),
    Click.aggregate([match, { $group: { _id: "$device", n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
    Click.find({ at: { $gte: since } }).sort({ at: -1 }).limit(50).lean(),
    ScrapeRun.find().sort({ startedAt: -1 }).limit(8).lean(),
    Product.aggregate([{ $match: { active: true } }, { $group: { _id: "$brand", n: { $sum: 1 } } }]),
  ]);

  return {
    total,
    visitors: visitors[0]?.n || 0,
    byBrand,
    byDay,
    topProducts,
    topPages,
    byDevice,
    recent,
    runs,
    catalogue: Object.fromEntries(catalogue.map((c) => [c._id, c.n])),
  };
}
