import Link from "next/link";

export default function Logo({ className = "" }) {
  return (
    <Link href="/" className={`font-display text-2xl font-bold tracking-tight ${className}`}>
      Kapor<span className="text-komla">Khoj</span>
    </Link>
  );
}
