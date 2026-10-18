export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="container-page max-w-3xl space-y-6 py-12 leading-relaxed">
      <h1 className="font-display text-4xl font-bold">Privacy</h1>
      <p>You don&apos;t need an account to use KaporKhoj, and we don&apos;t ask for your name, phone or email.</p>

      <h2 className="font-display text-2xl font-semibold">What we record</h2>
      <p>When you click through to a brand&apos;s site we record:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>which product and brand you clicked, its price, and the time;</li>
        <li>the KaporKhoj page you clicked from;</li>
        <li>your browser type and device type (mobile or desktop);</li>
        <li>a one-way scrambled code made from your IP address that changes every day, so we can count unique visitors without storing the address itself.</li>
      </ul>
      <p>
        We use this to understand which products and brands people are interested in, and to show brands how many
        shoppers we send them (as totals, never as individual records). The link to the brand carries tags saying
        the visit came from KaporKhoj.
      </p>

      <h2 className="font-display text-2xl font-semibold">Brand websites</h2>
      <p>
        Once you leave KaporKhoj, the brand&apos;s own privacy policy applies. Product photos are loaded from the
        brand&apos;s website.
      </p>
    </article>
  );
}
