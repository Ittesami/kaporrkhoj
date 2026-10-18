"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBox({ large = false }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("q") || "";
  const [q, setQ] = useState(current);

  // Keep the box in sync when the URL changes (back button, filter links).
  useEffect(() => setQ(current), [current]);

  function submit(e) {
    e.preventDefault();
    const text = q.trim();
    router.push(text ? `/shop?q=${encodeURIComponent(text)}` : "/shop");
  }

  return (
    <form onSubmit={submit} role="search" className="relative w-full">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={large ? 'Try "orange half sleeve shirt under 2000"' : "Search shirts, panjabis, kurtis…"}
        aria-label="Search products"
        className={`w-full rounded-full border border-line bg-white pl-5 pr-24 outline-none transition focus:border-ink ${
          large ? "py-4 text-base shadow-sm" : "py-2.5 text-sm"
        }`}
      />
      <button
        type="submit"
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink font-semibold text-white hover:bg-komla ${
          large ? "px-6 py-2.5 text-sm" : "px-4 py-1.5 text-xs"
        }`}
      >
        Search
      </button>
    </form>
  );
}
