import Link from "next/link";
import { connectDB } from "@/lib/db";
import { brandName } from "@/lib/brands";
import { RANGES, getDashboard } from "@/lib/clickStats";
import { taka, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 ${className}`}>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Bars({ rows, label, href }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (!rows.length) return <p className="text-sm text-muted">No clicks yet.</p>;
  return (
    <ul className="space-y-2 text-sm">
      {rows.map((r) => (
        <li key={String(r._id)}>
          <div className="flex justify-between gap-3">
            {href ? (
              <Link href={href(r)} className="truncate hover:text-komla">{label(r)}</Link>
            ) : (
              <span className="truncate">{label(r)}</span>
            )}
            <span className="font-semibold tabular-nums">{r.n.toLocaleString()}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-paper">
            <div className="h-1.5 rounded-full bg-komla" style={{ width: `${(r.n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminPage({ searchParams }) {
  const days = RANGES.includes(Number(searchParams.days)) ? Number(searchParams.days) : 7;
  await connectDB();
  const d = await getDashboard(days);
  const dayMax = Math.max(1, ...d.byDay.map((x) => x.n));

  return (
    <div className="container-page space-y-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Click-through dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map((r) => (
            <Link key={r} href={`/admin?days=${r}`} className={`chip ${r === days ? "chip-on" : ""}`}>
              {r === 1 ? "24 h" : `${r} days`}
            </Link>
          ))}
          <a href={`/api/admin/clicks?days=${days}`} className="chip">Export CSV</a>
          <form action="/api/auth/logout" method="post">
            <button className="chip">Sign out</button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Clicks to brands", d.total.toLocaleString()],
          ["Unique visitors (daily)", d.visitors.toLocaleString()],
          ["Brands clicked", d.byBrand.length],
          ["Value of clicked items", taka(d.byBrand.reduce((s, b) => s + (b.value || 0), 0))],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs text-muted">{k}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <Card title="Clicks per day (Dhaka time)">
        {d.byDay.length ? (
          <div className="flex h-40 items-end gap-1">
            {d.byDay.map((x) => (
              <div key={x._id} className="group relative flex h-full flex-1 flex-col justify-end" title={`${x._id}: ${x.n}`}>
                <div className="rounded-t bg-komla/80 group-hover:bg-komla" style={{ height: `${(x.n / dayMax) * 100}%` }} />
                <span className="mt-1 hidden truncate text-center text-[10px] text-muted sm:block">{x._id.slice(5)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No clicks in this period.</p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="By brand">
          <Bars rows={d.byBrand} label={(r) => `${brandName(r._id)} (${(d.catalogue[r._id] || 0).toLocaleString()} listed)`} />
        </Card>
        <Card title="Top source pages">
          <Bars rows={d.topPages} label={(r) => r._id || "(direct)"} href={(r) => r._id || "/"} />
        </Card>
        <Card title="Devices">
          <Bars rows={d.byDevice} label={(r) => r._id || "unknown"} />
        </Card>
      </div>

      <Card title="Most clicked products">
        <Bars rows={d.topProducts} label={(r) => `${brandName(r.brand)}: ${r.title} · ${taka(r.price)}`} href={(r) => `/p/${r._id}`} />
      </Card>

      <Card title="Latest clicks">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 pr-3 font-medium">Product</th>
                <th className="py-2 pr-3 font-medium">Price</th>
                <th className="py-2 pr-3 font-medium">From</th>
                <th className="py-2 font-medium">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {d.recent.map((c) => (
                <tr key={String(c._id)}>
                  <td className="whitespace-nowrap py-2 pr-3 text-muted">{timeAgo(c.at)}</td>
                  <td className="py-2 pr-3">
                    <Link href={`/p/${c.product}`} className="hover:text-komla">
                      {brandName(c.brand)}: {c.productTitle}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3">{taka(c.price)}</td>
                  <td className="max-w-[220px] truncate py-2 pr-3 text-muted">{c.from || "–"}</td>
                  <td className="py-2">{c.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!d.recent.length && <p className="py-4 text-sm text-muted">No clicks yet.</p>}
        </div>
      </Card>

      <Card title="Catalogue refreshes">
        <ul className="space-y-3 text-sm">
          {d.runs.map((r) => (
            <li key={String(r._id)} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-semibold">{timeAgo(r.startedAt)}</span>
              <span className="text-xs text-muted">{r.trigger}</span>
              {r.brands.map((b) => (
                <span key={b.brand} className={b.ok ? "" : "text-red-600"} title={b.error || ""}>
                  {b.ok ? "✔" : "✘"} {brandName(b.brand)} {b.ok ? `${b.fetched}` : "failed"}
                </span>
              ))}
            </li>
          ))}
          {!d.runs.length && <li className="text-muted">No refresh has run yet. Run `npm run scrape`.</li>}
        </ul>
      </Card>
    </div>
  );
}
