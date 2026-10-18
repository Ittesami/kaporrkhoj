import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { BRANDS } from "@/lib/brands";
import { taka, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Brands" };

export default async function BrandsPage() {
  await connectDB();
  const stats = await Product.aggregate([
    { $match: { active: true } },
    {
      $group: {
        _id: "$brand",
        count: { $sum: 1 },
        inStock: { $sum: { $cond: ["$inStock", 1, 0] } },
        minPrice: { $min: "$price" },
        checked: { $max: "$lastCheckedAt" },
      },
    },
  ]);
  const by = Object.fromEntries(stats.map((s) => [s._id, s]));

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl font-bold">Brands</h1>
      <p className="mt-2 max-w-2xl text-muted">
        We currently collect from {BRANDS.length} brands, with more on the way. Each one&apos;s catalogue is refreshed about
        every 12 hours from its public website.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BRANDS.map((b) => {
          const s = by[b.slug] || {};
          return (
            <Link key={b.slug} href={`/shop?brand=${b.slug}`} className="rounded-2xl border border-line bg-white p-6 transition hover:border-ink">
              <p className="font-display text-2xl font-semibold">{b.name}</p>
              <p className="mt-1 text-xs text-muted">{new URL(b.baseUrl).host}</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted">Products</dt>
                  <dd className="font-semibold">{(s.count || 0).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">In stock</dt>
                  <dd className="font-semibold">{(s.inStock || 0).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">From</dt>
                  <dd className="font-semibold">{s.minPrice ? taka(s.minPrice) : "–"}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted">Checked {timeAgo(s.checked)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
