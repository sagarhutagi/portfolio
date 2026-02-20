"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { InteractiveTerminal } from "./interactive-terminal";
import type { SiteSettings, Project, Learning, WorkExperience } from "@/types";

/* Lazy-load the heavy WASM terminal only when needed */
const WasmTerminal = lazy(() =>
  import("./wasm-terminal").then((mod) => ({ default: mod.WasmTerminal }))
);

interface TerminalDrawerProps {
  settings: SiteSettings;
  projects: Project[];
  learnings: Learning[];
  experience: WorkExperience[];
  socials: { label: string; href: string }[];
}

type DrawerSize = "normal" | "minimized" | "maximized";
type TerminalMode = "classic" | "wasm";

export function TerminalDrawer({
  settings,
  projects,
  learnings,
  experience,
  socials,
}: TerminalDrawerProps) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DrawerSize>("normal");
  const [mode, setMode] = useState<TerminalMode>("classic");

  /* Lock body scroll when open (but not when minimized) */
  useEffect(() => {
    if (open && size !== "minimized") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, size]);

  /* Ctrl+` or Ctrl+J to toggle */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "`" || e.key === "j")) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setSize("normal");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setSize("normal");
    setMode("classic");
  };

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50
          w-10 h-10 sm:w-12 sm:h-12 
          border border-[var(--accent-color)]/50
          bg-background/90 backdrop-blur-sm
          flex items-center justify-center
          text-[var(--accent-color)]
          hover:bg-[var(--accent-color)]/10
          hover:border-[var(--accent-color)]
          transition-all duration-200
          group
          ${open ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10" : ""}
        `}
        data-interactive
        aria-label="Toggle terminal"
        title="Toggle terminal (Ctrl+`)"
      >
        {/* >_ icon made with text for that authentic feel */}
        <span className="text-sm font-bold leading-none tracking-tighter">
          {open ? "×" : ">_"}
        </span>
        {/* Ping animation when closed */}
        {!open && (
          <span className="absolute inset-0 border border-[var(--accent-color)]/30 animate-ping opacity-20" />
        )}
      </button>

      {/* ── Backdrop ── */}
      {open && size !== "minimized" && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* ── Drawer panel ── */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50
          transition-transform duration-300 ease-out
          ${open ? "translate-y-0" : "translate-y-full"}
        `}
      >
        {/* Handle bar to drag/close — hidden when maximized */}
        {size !== "maximized" && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => setOpen(false)}
              className="w-10 h-1 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors"
              data-interactive
              aria-label="Close terminal"
            />
          </div>
        )}

        {/* Terminal container */}
        <div
          className={`
            bg-background border-t border-[var(--accent-color)]/30 flex flex-col
            transition-[height] duration-300 ease-out
            ${size === "maximized" ? "h-screen" : size === "minimized" ? "h-auto" : "h-[45vh] sm:h-[55vh] md:h-[50vh]"}
          `}
        >
          {/* Glow line at top */}
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent-color)]/50 to-transparent" />

          {mode === "classic" ? (
            <InteractiveTerminal
              settings={settings}
              projects={projects}
              learnings={learnings}
              experience={experience}
              socials={socials}
              onClose={handleClose}
              onMinimize={() => setSize((s) => s === "minimized" ? "normal" : "minimized")}
              onMaximize={() => setSize((s) => s === "maximized" ? "normal" : "maximized")}
              onWasm={() => setMode("wasm")}
              minimized={size === "minimized"}
            />
          ) : (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden border border-border bg-[hsl(var(--card))]">
              {/* Title bar for WASM mode */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background/50 shrink-0">
                <button
                  onClick={handleClose}
                  className="w-2.5 h-2.5 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors focus:outline-none group relative"
                  aria-label="Close terminal"
                  data-interactive
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-black/0 group-hover:text-black/80 transition-colors">✕</span>
                </button>
                <button
                  onClick={() => setSize((s) => s === "minimized" ? "normal" : "minimized")}
                  className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 hover:bg-yellow-500 transition-colors focus:outline-none group relative"
                  aria-label="Minimize terminal"
                  data-interactive
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-black/0 group-hover:text-black/80 transition-colors">−</span>
                </button>
                <button
                  onClick={() => setSize((s) => s === "maximized" ? "normal" : "maximized")}
                  className="w-2.5 h-2.5 rounded-full bg-green-500/70 hover:bg-green-500 transition-colors focus:outline-none group relative"
                  aria-label="Maximize terminal"
                  data-interactive
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-black/0 group-hover:text-black/80 transition-colors">⤢</span>
                </button>
                <span className="text-[10px] text-muted-foreground ml-2">
                  wasm-sh — visitor@portfolio
                </span>
                <button
                  onClick={() => setMode("classic")}
                  className="ml-auto text-[10px] text-muted-foreground hover:text-[var(--accent-color)] transition-colors px-2 py-0.5 border border-border hover:border-[var(--accent-color)]/40"
                  data-interactive
                  title="Switch back to classic terminal"
                >
                  ← classic
                </button>
              </div>

              {size !== "minimized" && (
                <Suspense
                  fallback={
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block w-4 h-4 border-2 border-[var(--accent-color)]/40 border-t-[var(--accent-color)] rounded-full animate-spin mb-3" />
                        <p className="text-xs text-muted-foreground">Loading WASM shell...</p>
                      </div>
                    </div>
                  }
                >
                  <WasmTerminal
                    settings={settings}
                    projects={projects}
                    learnings={learnings}
                    experience={experience}
                    socials={socials}
                    onExit={() => setMode("classic")}
                  />
                </Suspense>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
