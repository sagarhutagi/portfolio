import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

/**
 * Parse a simple device type, browser name, and OS from the User-Agent.
 */
function parseUserAgent(ua: string) {
  const lower = ua.toLowerCase();

  // Device
  let device = "desktop";
  if (/mobile|android|iphone|ipod/.test(lower)) device = "mobile";
  else if (/tablet|ipad/.test(lower)) device = "tablet";

  // Browser
  let browser = "Other";
  if (/edg(e|\/)/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

  // OS
  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua) && !/android/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

  return { device, browser, os };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = typeof body.path === "string" ? body.path : "/";
    const referrer = typeof body.referrer === "string" ? body.referrer : "";

    const ua = req.headers.get("user-agent") ?? "";
    const { device, browser, os } = parseUserAgent(ua);

    // Skip bots
    if (/bot|crawl|spider|slurp|lighthouse/i.test(ua)) {
      return NextResponse.json({ ok: true });
    }

    const db = createServerSupabase();
    await db.from("page_views").insert({
      path,
      referrer,
      user_agent: ua.slice(0, 512),
      device,
      browser,
      os,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
