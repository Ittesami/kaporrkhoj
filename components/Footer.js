import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="container-page grid gap-8 py-10 text-sm sm:grid-cols-3">
        <div className="space-y-2">
          <Logo className="text-xl" />
          <p className="text-muted">Search fashion across Bangladesh, then buy on the brand&apos;s own site.</p>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/shop" className="hover:text-komla">All products</Link>
          <Link href="/brands" className="hover:text-komla">Brands</Link>
          <Link href="/about" className="hover:text-komla">About &amp; how it works</Link>
          <Link href="/privacy" className="hover:text-komla">Privacy</Link>
        </nav>
        <p className="text-xs leading-relaxed text-muted">
          KaporKhoj is an independent comparison site and is not affiliated with, endorsed by or sponsored by the
          brands listed. Brand names belong to their owners. Prices and stock are collected from each brand&apos;s
          public website about every 12 hours and may have changed; always check the brand&apos;s site before buying.
        </p>
      </div>
    </footer>
  );
}
