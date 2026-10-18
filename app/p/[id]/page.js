import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { brandName } from "@/lib/brands";
import { CARD_FIELDS, isObjectId, serialize } from "@/lib/search";
import { CATEGORIES, COLOR_FAMILIES, GENDERS, SLEEVES, labelFor } from "@/lib/taxonomy";
import { displayName, goHref, taka, timeAgo } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import ColorDots from "@/components/ColorDots";

export const dynamic = "force-dynamic";

async function load(id) {
  if (!isObjectId(id)) return null;
  await connectDB();
  const p = await Product.findById(id).lean();
  return p ? serialize(p) : null;
}

export async function generateMetadata({ params }) {
  const p = await load(params.id);
  if (!p) return { title: "Not found" };
  return {
    title: `${displayName(p)} · ${taka(p.price)}`,
    description: `${displayName(p)} for ${taka(p.price)}. Compare with similar items from other Bangladeshi brands on KaporKhoj.`,
    robots: p.active ? undefined : { index: false },
  };
}

export default async function ProductPage({ params }) {
  const p = await load(params.id);
  if (!p) notFound();

  const similar = await Product.find({
    _id: { $ne: p._id },
    active: true,
    inStock: true,
    category: p.category,
    ...(p.gender ? { gender: p.gender } : {}),
    ...(p.colors?.length ? { colors: { $in: p.colors } } : {}),
    price: { $gte: p.price * 0.6, $lte: p.price * 1.4 },
  })
    .select(CARD_FIELDS)
    .sort({ lastCheckedAt: -1 })
    .limit(8)
    .lean();

  const from = `/p/${p._id}`;
  const facts = [
    ["For", p.gender && labelFor(GENDERS, p.gender)],
    ["Category", p.category !== "other" && labelFor(CATEGORIES, p.category)],
    ["Sleeve", p.sleeve && labelFor(SLEEVES, p.sleeve)],
    ["Colour", p.colorNames?.length ? p.colorNames.join(", ") : p.colors?.map((c) => labelFor(COLOR_FAMILIES, c)).join(", ")],
  ].filter(([, v]) => v);
  const history = p.priceHistory || [];

  return (
    <div className="container-page py-8">
      <nav className="mb-6 text-xs text-muted">
        <Link href="/shop" className="hover:text-ink">Shop</Link> /{" "}
        <Link href={`/shop?brand=${p.brand}`} className="hover:text-ink">{brandName(p.brand)}</Link>
        {p.category !== "other" && (
          <>
            {" "}/ <Link href={`/shop?category=${p.category}`} className="hover:text-ink">{labelFor(CATEGORIES, p.category)}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-line bg-[#f1ece4]">
          {p.image ? (
            <img src={p.image} alt={displayName(p)} referrerPolicy="no-referrer" className="aspect-[4/5] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center text-muted">No image</div>
          )}
        </div>

        <div className="space-y-5">
          <h1 className="font-display text-3xl font-bold leading-tight">
            {brandName(p.brand)}: <span className="font-semibold">{p.title}</span>
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{taka(p.price)}</span>
            {p.compareAtPrice && <span className="text-muted line-through">{taka(p.compareAtPrice)}</span>}
          </div>

          {!p.active ? (
            <p className="rounded-xl bg-komla-light px-4 py-3 text-sm">This product is no longer listed on {brandName(p.brand)}&apos;s site.</p>
          ) : !p.inStock ? (
            <p className="rounded-xl bg-komla-light px-4 py-3 text-sm">Out of stock when we last checked.</p>
          ) : null}

          {p.sizes?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Sizes available</p>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <span key={s} className="chip cursor-default">{s}</span>
                ))}
              </div>
            </div>
          )}

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="flex items-center gap-2">
                  {k === "Colour" && <ColorDots colors={p.colors} />}
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          <a href={goHref(p._id, from)} target="_blank" rel="nofollow noopener" className="btn-primary w-full py-3.5 text-base sm:w-auto">
            Buy on {brandName(p.brand)}&apos;s site ↗
          </a>
          <p className="text-xs text-muted">
            Price and stock checked {timeAgo(p.lastCheckedAt)}. You&apos;ll buy directly from {brandName(p.brand)}; KaporKhoj
            doesn&apos;t sell or deliver anything.
          </p>

          {history.length > 1 && (
            <div className="rounded-2xl border border-line bg-white p-4 text-sm">
              <p className="mb-2 font-semibold">Price history</p>
              <ul className="space-y-1">
                {[...history].reverse().slice(0, 6).map((h) => (
                  <li key={h.at} className="flex justify-between">
                    <span className="text-muted">{new Date(h.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span>{taka(h.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">Similar from other brands</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {similar.map((s) => (
              <ProductCard key={String(s._id)} product={serialize(s)} from={from} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
