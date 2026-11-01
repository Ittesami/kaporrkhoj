// Master switch for collecting from brand websites. While false, the scraper
// exits without contacting any brand site and the existing catalogue in the
// database is left as it is. Set to true (and re-enable the schedule in
// .github/workflows/refresh-catalogue.yml) to resume.
export const SCRAPING_ENABLED = false;

// Brands we collect from. Each one was checked before adding:
//  - robots.txt allows crawling the product pages/API we read
//  - the site exposes a public, structured product feed (Shopify or WooCommerce)
// To add a brand: check its robots.txt and terms of use first, then add an entry.
// `platform` picks the adapter in scraper/adapters.
export const BRANDS = [
  {
    slug: "yellow",
    name: "Yellow",
    platform: "shopify",
    baseUrl: "https://www.yellowclothing.net",
  },
  {
    slug: "twelve",
    name: "Twelve",
    platform: "shopify",
    baseUrl: "https://twelvebd.com",
  },
  {
    slug: "richman",
    name: "Richman",
    platform: "woocommerce",
    baseUrl: "https://richmanbd.com",
    defaultGender: "men", // menswear-only brand; titles rarely say "men"
  },
  {
    slug: "lubnan",
    name: "Lubnan",
    platform: "woocommerce",
    baseUrl: "https://lubnanbd.com",
  },
  {
    slug: "easy",
    name: "Easy",
    platform: "woocommerce",
    baseUrl: "https://easyfashion.com.bd",
  },
];

export const BRAND_BY_SLUG = Object.fromEntries(BRANDS.map((b) => [b.slug, b]));

export function brandName(slug) {
  return BRAND_BY_SLUG[slug]?.name || slug;
}
