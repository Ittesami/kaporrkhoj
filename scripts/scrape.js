// Usage:
//   npm run scrape                 -> all brands
//   npm run scrape:brand yellow    -> one brand (comma-separate for several)
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { runScrape } from "../scraper/run.js";

const i = process.argv.indexOf("--brand");
const only = i >= 0 && process.argv[i + 1] ? process.argv[i + 1].split(",") : null;

await connectDB();
const results = await runScrape({ only, trigger: process.env.GITHUB_ACTIONS ? "schedule" : "manual" });
await mongoose.disconnect();

const failed = results.filter((r) => !r.ok);
if (failed.length === results.length) process.exit(1);
