import Link from "next/link";

export default function Pagination({ page, pages, params }) {
  if (pages <= 1) return null;
  const href = (p) => {
    const next = new URLSearchParams(params);
    p > 1 ? next.set("page", String(p)) : next.delete("page");
    return `/shop?${next.toString()}`;
  };
  const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5 text-sm" aria-label="Pages">
      {page > 1 && (
        <Link href={href(page - 1)} className="chip">
          ← Prev
        </Link>
      )}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="text-muted">…</span>}
          <Link href={href(n)} className={`chip ${n === page ? "chip-on" : ""}`} aria-current={n === page ? "page" : undefined}>
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className="chip">
          Next →
        </Link>
      )}
    </nav>
  );
}
