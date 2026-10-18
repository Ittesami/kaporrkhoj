import Link from "next/link";
import { brandName } from "@/lib/brands";
import { displayName, goHref, taka, timeAgo } from "@/lib/format";
import ColorDots from "./ColorDots";

export default function ProductCard({ product: p, from }) {
  const off = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-md">
      <Link href={`/p/${p._id}`} className="relative block aspect-[4/5] overflow-hidden bg-[#f1ece4]">
        {p.image ? (
          <img
            src={p.image}
            alt={displayName(p)}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No image</div>
        )}
        {off >= 5 && (
          <span className="absolute left-2 top-2 rounded-full bg-komla px-2 py-0.5 text-xs font-bold text-white">
            -{off}%
          </span>
        )}
        {!p.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1 text-center text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/p/${p._id}`} className="line-clamp-2 text-sm leading-snug">
          <span className="font-semibold">{brandName(p.brand)}:</span> {p.title}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-bold">{taka(p.price)}</span>
          {p.compareAtPrice && <span className="text-xs text-muted line-through">{taka(p.compareAtPrice)}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <ColorDots colors={p.colors} />
          <span className="text-[11px] text-muted" title="When we last checked the brand's site">
            checked {timeAgo(p.lastCheckedAt)}
          </span>
        </div>
        <a
          href={goHref(p._id, from)}
          target="_blank"
          rel="nofollow noopener"
          className="mt-1 rounded-full border border-ink py-1.5 text-center text-xs font-semibold transition hover:bg-ink hover:text-white"
        >
          Buy on {brandName(p.brand)} ↗
        </a>
      </div>
    </article>
  );
}
