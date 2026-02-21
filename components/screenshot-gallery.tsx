"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";

interface ScreenshotGalleryProps {
  screenshots: string[];
  projectTitle: string;
}

/**
 * Grid of clickable screenshot thumbnails with a fullscreen lightbox.
 * The lightbox is portalled to document.body so it always covers the
 * entire viewport regardless of parent overflow / stacking context.
 */
export function ScreenshotGallery({ screenshots, projectTitle }: ScreenshotGalleryProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  /* Wait for client mount so createPortal has a target */
  useEffect(() => setMounted(true), []);

  /* Close on Escape key */
  useEffect(() => {
    if (!lightboxSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxSrc]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {screenshots.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightboxSrc(src)}
            className="relative aspect-video border border-border overflow-hidden hover:border-[var(--accent-color)]/40 transition-colors group"
            data-interactive
          >
            <Image
              src={src}
              alt={`${projectTitle} screenshot ${i + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono text-white bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                Click to expand
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Image Lightbox (portalled to body) ── */}
      {mounted && lightboxSrc && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-default"
          data-lightbox
          onClick={() => setLightboxSrc(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxSrc(null);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[10000] p-2.5 text-white/70 hover:text-white transition-colors bg-white/10 backdrop-blur-sm rounded-md"
            aria-label="Close image"
            data-interactive
          >
            <X size={22} />
          </button>
          <div className="relative w-full h-full max-w-[95vw] max-h-[90vh]">
            <Image
              src={lightboxSrc}
              alt={`${projectTitle} screenshot`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
