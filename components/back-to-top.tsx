"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" button that appears after scrolling down.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 p-2.5 border border-border bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/50 transition-all duration-300 shadow-lg group"
      aria-label="Scroll to top"
      data-interactive
    >
      <ArrowUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
