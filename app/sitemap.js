import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { BRANDS } from "@/lib/brands";
import { CATEGORIES, GENDERS } from "@/lib/taxonomy";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const base = SITE.url;
  const pages = ["", "/shop", "/brands", "/about"].map((p) => ({ url: `${base}${p}`, changeFrequency: "daily" }));
  const brands = BRANDS.map((b) => ({ url: `${base}/shop?brand=${b.slug}`, changeFrequency: "daily" }));
  // Single-parameter URLs only: "&" would need XML escaping in the sitemap.
  const cats = [
    ...GENDERS.map((g) => ({ url: `${base}/shop?gender=${g.value}`, changeFrequency: "daily" })),
    ...CATEGORIES.map((c) => ({ url: `${base}/shop?category=${c.value}`, changeFrequency: "daily" })),
  ];

  await connectDB();
  const products = await Product.find({ active: true }).select("_id lastCheckedAt").sort({ lastCheckedAt: -1 }).limit(40000).lean();
  return [
    ...pages,
    ...brands,
    ...cats,
    ...products.map((p) => ({ url: `${base}/p/${p._id}`, lastModified: p.lastCheckedAt })),
  ];
}
