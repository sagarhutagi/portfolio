"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ScreenshotGalleryProps {
  screenshots: string[];
  projectTitle: string;
}

/**
 * Grid of clickable screenshot thumbnails with a fullscreen lightbox.
 * Works on both desktop and mobile.
 */
export function ScreenshotGallery({ screenshots, projectTitle }: ScreenshotGalleryProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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

      {/* ── Image Lightbox ── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxSrc(null);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[61] p-2.5 text-white/70 hover:text-white transition-colors bg-white/10 backdrop-blur-sm"
            aria-label="Close image"
            data-interactive
          >
            <X size={22} />
          </button>
          <div className="relative w-full max-w-5xl aspect-video">
            <Image
              src={lightboxSrc}
              alt={`${projectTitle} screenshot`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
