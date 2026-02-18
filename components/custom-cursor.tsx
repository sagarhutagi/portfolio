"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor — glowing dot with a thin outer ring.
 * On hover over any interactive element the ring grows and becomes more visible.
 * Uses pointer-events: none and requestAnimationFrame for zero-lag tracking.
 * Hidden on touch devices.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Hide on touch devices */
    if (window.matchMedia("(pointer: coarse)").matches) {
      el.style.display = "none";
      return;
    }

    /* Mouse position (target) */
    let mx = 0;
    let my = 0;
    /* Current rendered position of the ring (lazy) */
    let rx = 0;
    let ry = 0;

    const dot = el.querySelector<HTMLElement>(".custom-cursor__dot");
    const ring = el.querySelector<HTMLElement>(".custom-cursor__ring");

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      /* Dot follows the mouse instantly */
      if (dot) dot.style.transform = `translate(calc(-50% + ${mx}px), calc(-50% + ${my}px))`;
    };

    /* Lerp ring toward the mouse each frame (lazy feel) */
    const ease = 0.12; // 0 = frozen, 1 = instant
    let raf: number;
    const tick = () => {
      rx += (mx - rx) * ease;
      ry += (my - ry) * ease;
      if (ring) ring.style.transform = `translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px))`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onEnter = () => el.classList.add("cursor-hover");
    const onLeave = () => el.classList.remove("cursor-hover");

    const attach = () => {
      const targets = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select, [data-interactive]'
      );
      targets.forEach((t) => {
        t.addEventListener("mouseenter", onEnter);
        t.addEventListener("mouseleave", onLeave);
      });
    };

    document.addEventListener("mousemove", onMove);
    attach();

    /* Re-attach when DOM changes (modals, navigation, etc.) */
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="custom-cursor">
      <span className="custom-cursor__dot" />
      <span className="custom-cursor__ring" />
    </div>
  );
}
