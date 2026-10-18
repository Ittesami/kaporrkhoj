import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Not found</h1>
      <p className="mt-3 text-muted">That page or product isn&apos;t here any more.</p>
      <Link href="/shop" className="btn-primary mt-6">Browse all products</Link>
    </div>
  );
}
