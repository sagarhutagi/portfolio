"use client";

import { useState, useEffect } from "react";
import { InteractiveTerminal } from "./interactive-terminal";
import type { SiteSettings, Project, Learning, WorkExperience } from "@/types";

interface TerminalDrawerProps {
  settings: SiteSettings;
  projects: Project[];
  learnings: Learning[];
  experience: WorkExperience[];
  socials: { label: string; href: string }[];
}

type DrawerSize = "normal" | "minimized" | "maximized";

export function TerminalDrawer({
  settings,
  projects,
  learnings,
  experience,
  socials,
}: TerminalDrawerProps) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DrawerSize>("normal");

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

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          fixed bottom-6 right-6 z-50
          w-12 h-12 
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
          onClick={() => { setOpen(false); setSize("normal"); }}
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
            ${size === "maximized" ? "h-screen" : size === "minimized" ? "h-auto" : "h-[60vh] md:h-[50vh]"}
          `}
        >
          {/* Glow line at top */}
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent-color)]/50 to-transparent" />

          <InteractiveTerminal
            settings={settings}
            projects={projects}
            learnings={learnings}
            experience={experience}
            socials={socials}
            onClose={() => { setOpen(false); setSize("normal"); }}
            onMinimize={() => setSize((s) => s === "minimized" ? "normal" : "minimized")}
            onMaximize={() => setSize((s) => s === "maximized" ? "normal" : "maximized")}
            minimized={size === "minimized"}
          />
        </div>
      </div>
    </>
  );
}
