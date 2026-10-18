import mongoose from "mongoose";

const { Schema } = mongoose;

// One document per product on a brand's site. We store facts only (name,
// price, colour, sizes, link) plus a link to the brand's own image; no
// descriptions or re-hosted photos.
const ProductSchema = new Schema(
  {
    brand: { type: String, required: true, index: true }, // slug from lib/brands.js
    sourceId: { type: String, required: true }, // the brand's own product id
    url: { type: String, required: true },
    rawTitle: String,
    title: { type: String, required: true },
    image: String,
    price: { type: Number, index: true },
    compareAtPrice: Number,
    inStock: { type: Boolean, default: true, index: true },
    gender: { type: String, index: true },
    category: { type: String, index: true },
    sleeve: String,
    colors: { type: [String], index: true }, // colour families
    colorNames: [String], // the brand's own colour names
    sizes: [String],
    tags: [String],
    priceHistory: [{ _id: false, price: Number, at: Date }],
    active: { type: Boolean, default: true, index: true }, // false once it disappears from the brand's site
    firstSeenAt: Date,
    lastCheckedAt: Date,
  },
  { timestamps: true }
);
ProductSchema.index({ brand: 1, sourceId: 1 }, { unique: true });
ProductSchema.index({ title: "text", colorNames: "text", tags: "text" }, { weights: { title: 10, colorNames: 5, tags: 1 } });

// One document per outbound click through /go/[id].
const ClickSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", index: true },
  brand: { type: String, index: true },
  productTitle: String,
  price: Number,
  targetUrl: String,
  from: String, // page on our site the click came from
  referrer: String,
  ipHash: String, // salted hash, never the raw IP
  userAgent: String,
  device: String,
  at: { type: Date, default: Date.now, index: true },
});

// One document per scraper run, for the admin dashboard.
const ScrapeRunSchema = new Schema({
  startedAt: { type: Date, index: true },
  finishedAt: Date,
  trigger: String,
  brands: [
    {
      _id: false,
      brand: String,
      ok: Boolean,
      fetched: Number,
      created: Number,
      updated: Number,
      skipped: Number,
      deactivated: Number,
      error: String,
      ms: Number,
    },
  ],
});

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export const Click = mongoose.models.Click || mongoose.model("Click", ClickSchema);
export const ScrapeRun = mongoose.models.ScrapeRun || mongoose.model("ScrapeRun", ScrapeRunSchema);
