export const metadata = { title: "About & how it works" };

export default function AboutPage() {
  return (
    <article className="container-page max-w-3xl space-y-6 py-12 leading-relaxed">
      <h1 className="font-display text-4xl font-bold">About KaporKhoj</h1>
      <p>
        KaporKhoj (&ldquo;cloth search&rdquo;) lets you search clothes from Bangladeshi fashion brands in one place.
        Filter by colour, sleeve, size and price across every brand at once, then click through to buy on the
        brand&apos;s own website.
      </p>

      <h2 className="font-display text-2xl font-semibold">How it works</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>About every 12 hours we read each brand&apos;s public product listings: name, price, colours, sizes, stock and link.</li>
        <li>We sort every product into our own categories and colour families so you can compare like with like.</li>
        <li>Each card shows when we last checked it. Prices can change between checks, so confirm on the brand&apos;s site.</li>
        <li>We don&apos;t sell, take payments or deliver anything. When you click &ldquo;Buy&rdquo;, you go straight to the brand.</li>
      </ul>

      <h2 className="font-display text-2xl font-semibold">Not affiliated</h2>
      <p>
        KaporKhoj is independent and is not affiliated with, endorsed by or sponsored by the brands listed. Brand
        names belong to their owners. Product photos are shown directly from the brand&apos;s own website and link back
        to it.
      </p>

      <h2 className="font-display text-2xl font-semibold">For brands</h2>
      <p>
        Want your catalogue listed, updated faster through a data feed, corrected, or removed? Our crawler identifies
        itself as <code className="rounded bg-white px-1.5 py-0.5 text-sm">KaporKhojBot</code>, only reads public pages,
        respects robots.txt, and stops for any brand that asks. Get in touch and we&apos;ll respond quickly.
      </p>
    </article>
  );
}
