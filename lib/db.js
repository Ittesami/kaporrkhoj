import dns from "node:dns";
import mongoose from "mongoose";

// Some home/mobile-hotspot DNS resolvers answer mongodb+srv "SRV" lookups but
// time out on the "TXT" lookup, which makes the Atlas connection fail with
// `queryTxt ETIMEOUT`. Setting MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 in
// .env.local works around that on such networks. Not needed on most hosts.
if (process.env.MONGODB_DNS_SERVERS) {
  dns.setServers(process.env.MONGODB_DNS_SERVERS.split(",").map((s) => s.trim()));
}

// Cache the connection on `global` so dev hot-reloads and serverless
// invocations reuse one connection instead of opening a new one per request.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectDB() {
  if (!isDbConfigured()) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      // dbName keeps all KaporKhoj collections in their own database, even on a
      // cluster shared with other apps and when the URI names no database.
      .connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB || "kaporkhoj",
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        cached.promise = null; // allow a retry on the next request
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
