import Link from "next/link";
import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { BRANDS } from "@/lib/brands";
import { CARD_FIELDS, serialize } from "@/lib/search";
import { COLOR_FAMILIES } from "@/lib/taxonomy";
import { timeAgo } from "@/lib/format";
import SearchBox from "@/components/SearchBox";
import ProductCard from "@/components/ProductCard";
import { swatchStyle } from "@/components/ColorDots";

export const dynamic = "force-dynamic";

const QUICK = [
  { label: "Panjabis", href: "/shop?gender=men&category=panjabi" },
  { label: "Half-sleeve shirts", href: "/shop?category=shirt&sleeve=half" },
  { label: "Polos", href: "/shop?category=polo" },
  { label: "Kurtis", href: "/shop?gender=women&category=kurti" },
  { label: "Three piece", href: "/shop?category=three-piece" },
  { label: "Kids", href: "/shop?gender=kids" },
  { label: "On sale", href: "/shop?sort=price-asc&max=1500" },
];

const EXAMPLES = ["orange half sleeve shirt under 2000", "white panjabi", "womens black kurti", "navy polo"];

export default async function HomePage() {
  await connectDB();
  const [perBrand, total, lastRun] = await Promise.all([
    // Newest few from each brand, so one big catalogue doesn't fill the row.
    Promise.all(
      BRANDS.map((b) =>
        Product.find({ brand: b.slug, active: true, inStock: true, image: { $ne: null } })
          .select(CARD_FIELDS)
          .sort({ firstSeenAt: -1, _id: -1 })
          .limit(2)
          .lean()
      )
    ),
    Product.countDocuments({ active: true }),
    Product.findOne({ active: true }).sort({ lastCheckedAt: -1 }).select("lastCheckedAt").lean(),
  ]);
  const latest = [0, 1].flatMap((i) => perBrand.map((list) => list[i])).filter(Boolean).slice(0, 8);

  return (
    <>
      <section className="border-b border-line bg-[radial-gradient(ellipse_at_top,#fdeee4,transparent_60%)]">
        <div className="container-page py-14 text-center sm:py-20">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-komla">
            {total.toLocaleString()} products · {BRANDS.length} brands
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
            Every Bangladeshi brand, <span className="text-komla">one search</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Stop opening ten brand sites one by one. Filter by colour, sleeve, size and price, then buy on the
            brand&apos;s own site.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <Suspense>
              <SearchBox large />
            </Suspense>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-muted">
              {EXAMPLES.map((e) => (
                <Link key={e} href={`/shop?q=${encodeURIComponent(e)}`} className="rounded-full bg-white/70 px-3 py-1 hover:text-ink">
                  {e}
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-6 text-xs text-muted">Prices last refreshed {timeAgo(lastRun?.lastCheckedAt)}</p>
        </div>
      </section>

      <section className="container-page mt-10">
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <Link key={q.href} href={q.href} className="chip">
              {q.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page mt-10">
        <h2 className="font-display text-2xl font-semibold">Shop by colour</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {COLOR_FAMILIES.map((c) => (
            <Link key={c.value} href={`/shop?color=${c.value}`} className="group flex flex-col items-center gap-1.5 text-xs">
              <span className="h-11 w-11 rounded-full border border-black/10 transition group-hover:scale-110" style={swatchStyle(c)} />
              <span className="text-muted group-hover:text-ink">{c.label.split(" ")[0]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Just added</h2>
          <Link href="/shop?sort=newest" className="text-sm font-semibold text-komla hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {latest.map((p) => (
            <ProductCard key={String(p._id)} product={serialize(p)} from="/" />
          ))}
        </div>
      </section>

      <section className="container-page mt-12">
        <h2 className="font-display text-2xl font-semibold">Brands</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {BRANDS.map((b) => (
            <Link
              key={b.slug}
              href={`/shop?brand=${b.slug}`}
              className="rounded-2xl border border-line bg-white px-4 py-6 text-center font-display text-lg font-semibold transition hover:border-ink"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
