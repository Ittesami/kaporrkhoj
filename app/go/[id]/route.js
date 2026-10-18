// Every "Buy on <brand>" button goes through here: we log the click, then
// send the shopper to the brand's own product page with UTM tags.
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Click, Product } from "@/lib/models";
import { isObjectId } from "@/lib/search";
import { clientIp, deviceOf, hashIp, isBot, withUtm } from "@/lib/tracking";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  if (!isObjectId(params.id)) return NextResponse.redirect(new URL("/shop", request.url));

  await connectDB();
  const product = await Product.findById(params.id).select("brand title url price category").lean();
  if (!product) return NextResponse.redirect(new URL("/shop", request.url));

  const target = withUtm(product.url, product);
  const ua = request.headers.get("user-agent") || "";

  if (!isBot(ua)) {
    const from = request.nextUrl.searchParams.get("from") || "";
    try {
      await Click.create({
        product: product._id,
        brand: product.brand,
        productTitle: product.title,
        price: product.price,
        targetUrl: product.url,
        from: from.startsWith("/") ? from.slice(0, 500) : "",
        referrer: (request.headers.get("referer") || "").slice(0, 500),
        ipHash: hashIp(clientIp(request)),
        userAgent: ua.slice(0, 300),
        device: deviceOf(ua),
      });
    } catch (err) {
      // Never block a shopper because logging failed.
      console.error("click log failed", err);
    }
  }

  const res = NextResponse.redirect(target, 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
