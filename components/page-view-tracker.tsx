"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Silently tracks page views by sending a beacon to /api/track.
 * Skips admin routes. Deduplicates by tracking the last sent path.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith("/admin")) return;
    // Deduplicate consecutive navigations to the same path
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer ?? "",
    });

    // Use sendBeacon for reliability, fall back to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([payload], { type: "application/json" })
      );
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
