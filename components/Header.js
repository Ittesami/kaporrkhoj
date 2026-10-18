import Link from "next/link";
import { Suspense } from "react";
import Logo from "./Logo";
import SearchBox from "./SearchBox";

const NAV = [
  { href: "/shop?gender=men", label: "Men" },
  { href: "/shop?gender=women", label: "Women" },
  { href: "/shop?gender=kids", label: "Kids" },
  { href: "/brands", label: "Brands" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <Logo />
        <nav className="order-3 flex w-full gap-5 text-sm font-medium sm:order-none sm:w-auto">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-komla">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto w-full max-w-md flex-1 sm:w-auto">
          <Suspense>
            <SearchBox />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
