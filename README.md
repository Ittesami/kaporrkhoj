# KaporKhoj

Search fashion across Bangladeshi brands in one place, then click through to buy on the brand's own site.
Next.js 14 (App Router, JS) + MongoDB (Mongoose) + Tailwind.

## How it fits together

| Part | Where | What it does |
|---|---|---|
| Brand list | `lib/brands.js` | Which brands we collect from, and how (Shopify or WooCommerce adapter) |
| Scraper | `scraper/` | Reads each brand's public product API politely (identifies itself, 2.5 s between requests, stops on 403/429) |
| Normaliser | `scraper/normalize.js`, `lib/taxonomy.js` | Maps every product to our own gender / category / colour family / sleeve / sizes; drops homeware |
| Refresh schedule | `.github/workflows/refresh-catalogue.yml` | Runs the scraper every 12 hours (06:00 and 18:00 Dhaka) |
| Search | `lib/search.js` | Turns "orange half sleeve shirt under 2000" into filters, no AI |
| Click tracking | `app/go/[id]/route.js` | Every "Buy on …" button: logs the click, adds UTM tags, redirects to the brand |
| Admin | `/admin` | Click dashboard (by brand, product, page, device, day), CSV export, refresh history |

Product names are always shown as **"Brand: Product"**. No brand logos are used; product photos are
hotlinked from the brand's own site (not re-hosted), and only facts (name, price, colours, sizes, link) are stored.

## Run locally

```bash
npm install
cp .env.example .env.local     # then fill in AUTH_SECRET and ADMIN_PASSWORD
npm run db                     # local MongoDB on :27017 (keep this terminal open)
npm run scrape                 # fill the catalogue (about 30 seconds)
npm run dev
```

`npm run scrape:brand yellow` refreshes a single brand.

## Deploy

1. **Database:** create a free MongoDB Atlas cluster and put its URI in `MONGODB_URI`.
2. **Website:** deploy to Vercel. Set `MONGODB_URI`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`.
3. **12-hour refresh:** push to GitHub, then in the repo's *Settings → Secrets and variables → Actions* add
   the secret `MONGODB_URI` and the variables `SITE_URL` and `SCRAPER_CONTACT` (an email brands can reach you at).
   Run it once by hand from the *Actions* tab ("Refresh catalogue" → *Run workflow*).

## Adding a brand

1. Check the brand's `robots.txt` and terms of use. Skip it if they forbid automated collection.
2. Check its platform: `https://<site>/products.json` (Shopify) or `https://<site>/wp-json/wc/store/v1/products` (WooCommerce).
3. Add it to `lib/brands.js` and run `npm run scrape:brand <slug>`.

Sites that are neither (e.g. Aarong, Sailor) need a new adapter that reads their sitemap and the
schema.org `Product` JSON-LD on each product page.
