// CSV export of raw click records for the admin (Excel / Metabase / SQL import).
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Click } from "@/lib/models";
import { getAdminSession } from "@/lib/auth";
import { RANGES, sinceDays } from "@/lib/clickStats";

export const dynamic = "force-dynamic";

const COLUMNS = ["at", "brand", "productTitle", "price", "product", "targetUrl", "from", "referrer", "device", "ipHash", "userAgent"];

function cell(v) {
  const s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const days = Number(request.nextUrl.searchParams.get("days"));
  const since = sinceDays(RANGES.includes(days) ? days : 30);
  await connectDB();
  const rows = await Click.find({ at: { $gte: since } }).sort({ at: -1 }).limit(100000).lean();

  const csv = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kaporkhoj-clicks-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
