"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BRANDS } from "@/lib/brands";
import { CATEGORIES, COLOR_FAMILIES, GENDERS, SLEEVES, SORTS } from "@/lib/taxonomy";
import { swatchStyle } from "./ColorDots";

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "Free size"];

function Section({ title, children }) {
  return (
    <section className="space-y-2.5 border-b border-line pb-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{title}</h3>
      {children}
    </section>
  );
}

export default function Filters({ total }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [min, setMin] = useState(params.get("min") || "");
  const [max, setMax] = useState(params.get("max") || "");

  useEffect(() => {
    setMin(params.get("min") || "");
    setMax(params.get("max") || "");
  }, [params]);

  function push(next) {
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function setOne(key, value) {
    const next = new URLSearchParams(params);
    if (!value || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    push(next);
  }

  function toggleMulti(key, value) {
    const next = new URLSearchParams(params);
    const cur = new Set((next.get(key) || "").split(",").filter(Boolean));
    cur.has(value) ? cur.delete(value) : cur.add(value);
    cur.size ? next.set(key, [...cur].join(",")) : next.delete(key);
    push(next);
  }

  function applyPrice(e) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    min ? next.set("min", min) : next.delete("min");
    max ? next.set("max", max) : next.delete("max");
    push(next);
  }

  const multi = (key) => new Set((params.get(key) || "").split(",").filter(Boolean));
  const colors = multi("color");
  const sizes = multi("size");
  const brands = multi("brand");
  const anyActive = ["gender", "category", "sleeve", "color", "size", "brand", "min", "max", "q", "stock"].some((k) =>
    params.get(k)
  );

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {total.toLocaleString()} {total === 1 ? "product" : "products"}
        </p>
        {anyActive && (
          <button onClick={() => router.push(pathname)} className="text-xs font-semibold text-komla hover:underline">
            Clear all
          </button>
        )}
      </div>

      <Section title="Sort">
        <select
          value={params.get("sort") || ""}
          onChange={(e) => setOne("sort", e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2"
        >
          <option value="">Default</option>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Section>

      <Section title="For">
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => setOne("gender", g.value)}
              className={`chip ${params.get("gender") === g.value ? "chip-on" : ""}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setOne("category", c.value)}
              className={`chip ${params.get("category") === c.value ? "chip-on" : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Colour">
        <div className="grid grid-cols-5 gap-2">
          {COLOR_FAMILIES.map((c) => (
            <button
              key={c.value}
              onClick={() => toggleMulti("color", c.value)}
              title={c.label}
              aria-label={c.label}
              aria-pressed={colors.has(c.value)}
              className={`h-8 w-8 rounded-full border border-black/15 transition ${
                colors.has(c.value) ? "ring-2 ring-ink ring-offset-2" : "hover:scale-110"
              }`}
              style={swatchStyle(c)}
            />
          ))}
        </div>
      </Section>

      <Section title="Sleeve">
        <div className="flex flex-wrap gap-2">
          {SLEEVES.map((s) => (
            <button
              key={s.value}
              onClick={() => setOne("sleeve", s.value)}
              className={`chip ${params.get("sleeve") === s.value ? "chip-on" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button key={s} onClick={() => toggleMulti("size", s)} className={`chip ${sizes.has(s) ? "chip-on" : ""}`}>
              {s}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Price (Tk)">
        <form onSubmit={applyPrice} className="flex items-center gap-2">
          <input
            inputMode="numeric"
            value={min}
            onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
            placeholder="Min"
            className="w-full rounded-lg border border-line bg-white px-3 py-2"
          />
          <span className="text-muted">–</span>
          <input
            inputMode="numeric"
            value={max}
            onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
            placeholder="Max"
            className="w-full rounded-lg border border-line bg-white px-3 py-2"
          />
          <button className="rounded-lg bg-ink px-3 py-2 font-semibold text-white">Go</button>
        </form>
      </Section>

      <Section title="Brand">
        <div className="space-y-1.5">
          {BRANDS.map((b) => (
            <label key={b.slug} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={brands.has(b.slug)}
                onChange={() => toggleMulti("brand", b.slug)}
                className="h-4 w-4 accent-komla"
              />
              {b.name}
            </label>
          ))}
        </div>
      </Section>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={params.get("stock") === "all"}
          onChange={() => setOne("stock", "all")}
          className="h-4 w-4 accent-komla"
        />
        Show out-of-stock items
      </label>
    </div>
  );
}
