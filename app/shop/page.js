import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { parseQuery, searchProducts } from "@/lib/search";
import { CATEGORIES, GENDERS, labelFor } from "@/lib/taxonomy";
import { brandName } from "@/lib/brands";
import Filters from "@/components/Filters";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

function toParams(sp) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v != null && v !== "") p.set(k, Array.isArray(v) ? v.join(",") : v);
  return p;
}

export function generateMetadata({ searchParams: sp }) {
  const parts = [sp.gender && labelFor(GENDERS, sp.gender), sp.category && labelFor(CATEGORIES, sp.category)].filter(Boolean);
  const brand = sp.brand && !String(sp.brand).includes(",") ? brandName(sp.brand) : null;
  const title = sp.asked
    ? `“${sp.asked}”`
    : parts.length
      ? `${parts.join("'s ")} from ${brand || "Bangladeshi brands"}`
      : brand
        ? `${brand} products`
        : "All products";
  return { title, robots: sp.q || sp.page ? { index: false } : undefined };
}

export default async function ShopPage({ searchParams: sp }) {
  // Turn a typed search into explicit filters once, so each part can be
  // switched off in the sidebar: "orange half sleeve shirt" -> color, sleeve, category.
  if (sp.q && !sp.asked) {
    const parsed = parseQuery(sp.q);
    const next = toParams(sp);
    const fill = (key, value) => value && !next.get(key) && next.set(key, value);
    fill("gender", parsed.gender);
    fill("category", parsed.category);
    fill("sleeve", parsed.sleeve);
    fill("color", parsed.colors?.join(","));
    fill("brand", parsed.brands?.join(","));
    fill("min", parsed.min && String(parsed.min));
    fill("max", parsed.max && String(parsed.max));
    if (next.toString() !== toParams(sp).toString()) {
      next.set("asked", sp.q);
      parsed.text ? next.set("q", parsed.text) : next.delete("q");
      redirect(`/shop?${next.toString()}`);
    }
  }

  await connectDB();
  const { items, total, pages, filters, droppedText } = await searchProducts(Product, sp);
  const params = toParams(sp);
  const from = `/shop?${params.toString()}`;

  return (
    <div className="container-page py-6">
      {sp.asked && (
        <p className="mb-4 text-sm text-muted">
          Results for <span className="font-semibold text-ink">“{sp.asked}”</span>
          {droppedText && (
            <>
              . Nothing matched “{droppedText}”, so we&apos;re showing everything else you asked for.
            </>
          )}
        </p>
      )}
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
          <details className="group rounded-2xl border border-line bg-white p-4 lg:open:block lg:border-0 lg:bg-transparent lg:p-0" open>
            <summary className="cursor-pointer list-none font-semibold lg:hidden">
              Filters <span className="text-muted group-open:hidden">▾</span>
            </summary>
            <div className="mt-4 lg:mt-0">
              <Suspense>
                <Filters total={total} />
              </Suspense>
            </div>
          </details>
        </aside>

        <section>
          {items.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p._id} product={p} from={from} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
              <p className="font-display text-xl font-semibold">Nothing matches all of that yet</p>
              <p className="mt-2 text-sm text-muted">Try removing a filter or two from the sidebar.</p>
            </div>
          )}
          <Pagination page={filters.page} pages={pages} params={params} />
        </section>
      </div>
    </div>
  );
}
